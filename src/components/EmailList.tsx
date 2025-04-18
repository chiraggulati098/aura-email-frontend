import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield } from 'lucide-react';

export interface Email {
  id: string;
  subject: string;
  sender: string;
  recipients: string[];
  body: string;
  snippet: string;
  has_attachments: boolean;
  date: string;
  time: string;
  star: boolean;
  label: string;
  read: boolean;
  spam: boolean;
  phishing: boolean;
}

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  activePage: string;
}

const EmailList = ({ emails, onSelectEmail, activePage }: EmailListProps) => {
  const filteredEmails = emails.filter(email => {
    if (activePage === 'inbox') return !email.spam && !email.phishing;
    if (activePage === 'spam') return email.spam || email.phishing;
    if (activePage === 'sent') return false; // We would use a real filter here
    return true; // "all" category
  });

  return (
    <div className="flex-1 overflow-auto">
      {filteredEmails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>No emails in {activePage}</p>
        </div>
      ) : (
        <div>
          {filteredEmails.map((email) => (
            <div 
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={cn(
                "email-item",
                email.read ? "email-item-read" : "email-item-unread"
              )}
            >
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">{email.sender}</div>
                  <div className="text-xs text-muted-foreground">{email.time}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{email.subject}</div>
                  {email.star && (
                    <Badge variant="outline" className="bg-yellow-100 border-0 text-xs">
                      Starred
                    </Badge>
                  )}
                  {email.spam && (
                    <Badge variant="outline" className="bg-email-spam border-0 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Spam
                    </Badge>
                  )}
                  {email.phishing && (
                    <Badge variant="outline" className="bg-email-phishing border-0 text-xs">
                      <Shield className="h-3 w-3" />
                      Phishing
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{email.snippet}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailList;
