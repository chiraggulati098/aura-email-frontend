import React, { useState, useEffect } from 'react';
import { useUserEmail } from '@/contexts/UserEmailContext';
import EmailSidebar from '@/components/EmailSidebar';
import EmailList, { Email } from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';
import ComposeEmail from '@/components/ComposeEmail';
import api from '@/lib/axios';

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

  const { userEmail, isEmailLoaded } = useUserEmail();

  const fetchEmails = async (page = 1, silentUpdate = false) => {
    try {
      if (!silentUpdate) {
        setLoading(true);
      }
      setError(null);
      
      const filter = getFilterForPage(activePage);
      const endpoint = activePage === 'sent'
        ? `/api/fetch_sent_emails?page=${page}`
        : `/api/fetch_emails?page=${page}&filter=${filter}`;
      
      const response = await api.get(endpoint);
      const data = response.data;
      
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
    let retryTimeout: NodeJS.Timeout;

    const attemptFetch = () => {
      if (isEmailLoaded) {
        fetchEmails(1);
      } else {
        // If email is not loaded yet, retry after 500ms
        retryTimeout = setTimeout(attemptFetch, 500);
      }
    };

    attemptFetch();

    // Cleanup function to clear the timeout if component unmounts
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [activePage, isEmailLoaded]); // Added isEmailLoaded as a dependency

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
        <h1 className="text-xl font-bold text-foreground">AURA Email</h1>
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