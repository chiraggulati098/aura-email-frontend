import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { AlertTriangle, Shield, Star, Paperclip, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export type EmailFilter = 'valid_only' | 'spam_and_phishing' | 'all';

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

export interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  activePage: string;
  currentPage: number;
  totalEmails: number;
  emailsPerPage: number;
  onPageChange: (page: number) => void;
}

const EmailList = ({ 
  emails, 
  onSelectEmail, 
  activePage, 
  currentPage, 
  totalEmails, 
  emailsPerPage, 
  onPageChange
}: EmailListProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const totalPages = Math.ceil(totalEmails / emailsPerPage);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/refresh", {
        method: "POST",
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to refresh");
      
      if (data.new_emails_count === 0) {
        toast({
          description: "No new emails",
        });
      } else {
        // If there are new emails, go to page 1 and reload
        onPageChange(1);
        window.location.reload();
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Refresh failed",
        description: err.message
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Emails are now pre-filtered by the backend API

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <div className="flex-1">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold capitalize">{activePage}</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg font-medium">No emails in {activePage}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {emails.map((email) => (
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
      
      {totalEmails > 0 && (
        <div className="border-t p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * emailsPerPage) + 1} to {Math.min(currentPage * emailsPerPage, totalEmails)} of {totalEmails} emails
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;