import React, { useState, useEffect } from 'react';
import { useUserEmail } from '@/contexts/UserEmailContext';
import EmailSidebar from '@/components/EmailSidebar';
import EmailList, { Email } from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';
import ComposeEmail from '@/components/ComposeEmail';

type EmailFilter = 'valid_only' | 'spam_and_phishing' | 'all';

interface EmailResponse {
  emails: Email[];
  total_emails: number;
  page: number;
  emails_per_page: number;
  start_index: number;
  end_index: number;
  filter: EmailFilter;
}

const EmailClient = () => {
  const [activePage, setActivePage] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyTo, setReplyTo] = useState<{email: string, subject: string, body?: string} | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [emailsPerPage] = useState(20);

  const getFilterForPage = (page: string): EmailFilter => {
    switch (page) {
      case 'inbox':
        return 'valid_only';
      case 'spam':
        return 'spam_and_phishing';
      case 'all':
        return 'all';
      default:
        return 'valid_only';
    }
  };

  const { userEmail } = useUserEmail();

  const fetchEmails = async (page = 1, silentUpdate = false) => {
    try {
      if (!silentUpdate) {
        setLoading(true);
      }
      if (!userEmail) {
        throw new Error('User email not available');
      }
      setError(null);
      const filter = getFilterForPage(activePage);
      const endpoint = activePage === 'sent'
        ? `http://127.0.0.1:5000/api/fetch_sent_emails?page=${page}&user_email=${encodeURIComponent(userEmail)}`
        : `http://127.0.0.1:5000/api/fetch_emails?page=${page}&filter=${filter}&user_email=${encodeURIComponent(userEmail)}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEmails(data.emails);
      setTotalEmails(data.total_emails);
      setCurrentPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
      console.error('Error fetching emails:', err);
    } finally {
      if (!silentUpdate) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEmails(1); // Reset to page 1 when changing sections
  }, [activePage]); // Added activePage as a dependency

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  const handleComposeClick = () => {
    setIsComposing(true);
    setReplyTo(null);
  };

  const handleCloseCompose = () => {
    setIsComposing(false);
    setReplyTo(null);
  };

  const handleReply = (email: Email) => {
    setReplyTo({
      email: email.sender,
      subject: email.subject,
      body: email.body
    });
    setIsComposing(true);
  };

  // Add pagination handler
  const handlePageChange = (newPage: number) => {
    fetchEmails(newPage);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="h-14 border-b flex items-center px-6">
        <h1 className="text-xl font-bold text-foreground">AI Email</h1>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <EmailSidebar 
          activePage={activePage} 
          onChangePage={setActivePage} 
          onComposeClick={handleComposeClick}
        />
        
        {selectedEmail ? (
          <EmailDetail 
            email={selectedEmail} 
            onBack={handleBackToList} 
            onReply={handleReply}
            onDelete={() => fetchEmails(currentPage, true)}
            onRead={() => fetchEmails(currentPage, true)}
            activePage={activePage}
          />
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <EmailList 
            emails={emails}
            onSelectEmail={handleSelectEmail}
            activePage={activePage}
            currentPage={currentPage}
            totalEmails={totalEmails}
            emailsPerPage={emailsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {isComposing && (
        <ComposeEmail 
          onClose={handleCloseCompose} 
          replyTo={replyTo?.email} 
          subject={replyTo?.subject}
          initialBody={replyTo?.body}
        />
      )}
    </div>
  );
};

export default EmailClient;