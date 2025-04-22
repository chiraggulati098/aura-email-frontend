import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Email } from './EmailList';
import { ArrowLeft, AlertTriangle, Shield, Reply, Trash, MoreHorizontal, Paperclip, Bot } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import api from '@/lib/axios';

const convertUrlsToLinks = (text: string) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split the text into parts: URLs and non-URLs
  const parts = text.split(urlRegex);
  
  // Map through the parts and convert URLs to links
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

interface EmailDetailProps {
  email: Email | null;
  onBack: () => void;
  onReply: (email: Email) => void;
  onEmailUpdate?: (email: Email) => void;
  onDelete?: () => void;
  onRead?: () => void;
  activePage?: string;
}

const EmailDetail = ({ email, onBack, onReply, onEmailUpdate, onDelete, onRead, activePage }: EmailDetailProps) => {
  const { toast } = useToast();
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  const handleGenerateReply = async () => {
    if (!email?.id) return;
    
    setIsGeneratingReply(true);
    try {
      const response = await api.post('/api/generate_reply', {
        msg_id: email.id
      });
      
      if (onReply && email) {
        // Call onReply with the original email but add the generated reply body
        onReply({
          ...email,
          body: response.data.reply
        });
      }
      
      toast({
        description: "Reply generated successfully"
      });
    } catch (error: any) {
      console.error('Error generating reply:', error);
      toast({
        variant: "destructive",
        description: error.response?.data?.error || 'Failed to generate reply'
      });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSummarize = async () => {
    if (!email?.id) return;
    
    setIsLoadingSummary(true);
    try {
      const response = await api.post('/api/summarize_email', {
        msg_id: email.id
      });

      setSummary(response.data.summary);
      toast({
        description: "Email summarized successfully"
      });
    } catch (error: any) {
      console.error('Error summarizing email:', error);
      toast({
        variant: "destructive",
        description: error.response?.data?.error || 'Failed to summarize email'
      });
      setSummary(null);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleDelete = async () => {
    if (!email?.id) return;

    try {
      const response = await api.post('/api/delete_email', {
        msg_id: email.id
      });

      if (response.data.deleted) {
        toast({
          description: "Email deleted successfully"
        });
        if (onDelete) {
          onDelete();
        }
        onBack(); // Go back to inbox after successful deletion
      } else {
        toast({
          variant: "destructive",
          description: "Email not found"
        });
      }
    } catch (error: any) {
      console.error('Error deleting email:', error);
      toast({
        variant: "destructive",
        description: error.response?.data?.error || 'Failed to delete email'
      });
    }
  };

  useEffect(() => {
    if (email?.id && !email.read) {
      api.post('/api/mark_as_read', {
        msg_id: email.id
      })
      .then(response => {
        const data = response.data;
        if (data.updated) {
          // Silently update the email list in the background
          if (onRead) {
            onRead();
          }
          // Update the email's read status in the parent component
          if (onEmailUpdate && email) {
            onEmailUpdate({
              ...email,
              read: true
            });
          }
          toast({
            description: "Email marked as read"
          });
        }
      })
      .catch(error => {
        console.error('Error marking email as read:', error);
      });
    }
  }, [email?.id, email?.read]);

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select an email to read</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-2 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            {email.subject || "No Subject"}
            {email.has_attachments && (
              <Paperclip className="h-4 w-4 inline ml-2 text-muted-foreground" />
            )}
          </h2>
          {email.label && (
            <Badge variant="secondary" className="mt-1">
              {email.label}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-auto flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium">{email.sender || "Unknown Sender"}</div>
            <div className="text-sm text-muted-foreground">
              To: {email.recipients
                ? (Array.isArray(email.recipients)
                  ? email.recipients.join(", ")
                  : email.recipients)
                : "Unknown Recipients"}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>{email.date || "Unknown Date"}</div>
            <div>{email.time || "Unknown Time"}</div>
          </div>
        </div>

        {(email.spam || email.phishing) && (
          <div className="bg-slate-50 p-3 rounded-md border text-sm">
            {email.spam && (
              <div className="flex gap-2 items-center text-yellow-700 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Our AI has detected this as potential spam.</span>
              </div>
            )}
            {email.phishing && (
              <div className="flex gap-2 items-center text-red-700">
                <Shield className="h-4 w-4" />
                <span>This email may be a phishing attempt. Be cautious with any links or attachments.</span>
              </div>
            )}
          </div>
        )}

        {(isLoadingSummary || summary) && (
          <div className="bg-slate-50 p-4 rounded-md border">
            <div className="flex items-center gap-2 text-muted-foreground">
              {isLoadingSummary ? (
                <>
                  <div className="animate-pulse">Generating</div>
                  <div className="animate-pulse">Summary</div>
                </>
              ) : (
                <div className="text-sm">{summary}</div>
              )}
            </div>
          </div>
        )}

        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
          {convertUrlsToLinks(email.body || "No content available.")}
        </div>

        <div className="p-4 border-t flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => onReply({
              ...email,
              body: '' // Clear the body for regular replies
            })}
          >
            <Reply className="h-4 w-4" />
            Reply
          </Button>
          
          {activePage !== 'sent' && (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleGenerateReply}
                disabled={isGeneratingReply}
              >
                <Bot className="h-4 w-4" />
                {isGeneratingReply ? (
                  <span className="animate-pulse">Generating reply</span>
                ) : (
                  'Generate Reply'
                )}
              </Button>

              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSummarize}
              >
                <Bot className="h-4 w-4" />
                Summarize
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;