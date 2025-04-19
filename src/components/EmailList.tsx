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
           <p className="text-lg font-medium">No emails in {activePage}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredEmails.map((email) => (
            <div 
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={cn(
                "p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200",
                !email.read && "bg-blue-50/40",
                "relative"
              )}
            >
               <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        !email.read && "text-gray-900",
                        email.read && "text-gray-600"
                      )}>
                        {email.sender}
                      </span>
                      {email.star && (
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      <div>{email.date}</div>
                      <div>{email.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={cn(
                      "text-sm font-medium",
                      !email.read && "text-gray-900",
                      email.read && "text-gray-600"
                    )}>
                      {email.subject}
                    </h3>
                    <div className="flex gap-1">
                      {email.has_attachments && (
                        <Paperclip className="h-4 w-4 text-gray-400" />
                      )}
                      {email.spam && (
                        <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Spam
                        </Badge>
                      )}
                      {email.phishing && (
                        <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Phishing
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className={cn(
                    "text-sm truncate",
                    !email.read && "text-gray-700",
                    email.read && "text-gray-500"
                  )}>
                    {email.snippet}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailList;