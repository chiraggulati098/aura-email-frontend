import React, { useState, useEffect } from 'react';
import EmailSidebar from '@/components/EmailSidebar';
import EmailList, { Email } from '@/components/EmailList';
import EmailDetail from '@/components/EmailDetail';
import ComposeEmail from '@/components/ComposeEmail';

const EmailClient = () => {
  const [activePage, setActivePage] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyTo, setReplyTo] = useState<{email: string, subject: string} | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://127.0.0.1:5000/api/fetch_emails');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEmails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emails');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

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
      subject: email.subject
    });
    setIsComposing(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="h-14 border-b flex items-center px-4">
        <h1 className="text-xl font-bold text-email-primary">AI Email</h1>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <EmailSidebar 
          activePage={activePage} 
          onChangePage={setActivePage} 
          onComposeClick={handleComposeClick}
        />
        
        {error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : !selectedEmail ? (
          loading ? (
            <div className="flex-1 flex items-center justify-center">
              <p>Loading emails...</p>
            </div>
          ) : (
            <EmailList 
              emails={emails} 
              onSelectEmail={handleSelectEmail} 
              activePage={activePage}
            />
          )
        ) : (
          <EmailDetail 
            email={selectedEmail} 
            onBack={handleBackToList} 
            onReply={handleReply}
          />
        )}
      </main>

      {isComposing && (
        <ComposeEmail 
          onClose={handleCloseCompose} 
          replyTo={replyTo?.email} 
          subject={replyTo?.subject}
        />
      )}
    </div>
  );
};

export default EmailClient;
