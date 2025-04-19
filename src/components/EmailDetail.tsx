import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Email } from './EmailList';
import { ArrowLeft, AlertTriangle, Shield, Reply, Trash, MoreHorizontal, Paperclip } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface EmailDetailProps {
  email: Email | null;
  onBack: () => void;
  onReply: (email: Email) => void;
  onEmailUpdate?: (email: Email) => void;
  onDelete?: () => void;
}

const EmailDetail = ({ email, onBack, onReply, onEmailUpdate, onDelete }: EmailDetailProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!email?.id) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/delete_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ msg_id: email.id }),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete email');
      }

      if (data.deleted) {
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
    } catch (error) {
      console.error('Error deleting email:', error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : 'Failed to delete email'
      });
    }
  };

  useEffect(() => {
    if (email?.id && !email.read) {
      fetch('http://127.0.0.1:5000/api/mark_as_read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ msg_id: email.id }),
        credentials: 'include',
      })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to mark email as read');
        }
        return data;
      })
      .then(data => {
        if (data.updated) {
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
        toast({
          variant: "destructive",
          description: error.message
        });
      });
    }
  }, [email?.id, email?.read, toast]);

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

        <div className="prose prose-sm max-w-none whitespace-pre-wrap">
          {email.body || "No content available."}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => onReply(email)}
        >
          <Reply className="h-4 w-4" />
          Reply
        </Button>
      </div>
    </div>
  );
};

export default EmailDetail;