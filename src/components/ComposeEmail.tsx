
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Paperclip } from 'lucide-react';

interface ComposeEmailProps {
  onClose: () => void;
  replyTo?: string;
  subject?: string;
}

const ComposeEmail = ({ onClose, replyTo, subject }: ComposeEmailProps) => {
  const isReply = Boolean(replyTo);
  
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{isReply ? 'Reply' : 'New Message'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4 flex-1">
          <div>
            <Input 
              placeholder="To" 
              defaultValue={replyTo || ''} 
            />
          </div>
          
          <div>
            <Input 
              placeholder="Subject" 
              defaultValue={isReply ? `Re: ${subject}` : ''}
            />
          </div>
          
          <div className="flex-1 h-64">
            <Textarea 
              placeholder="Write your message here..." 
              className="h-full resize-none" 
            />
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" size="sm" className="gap-1">
            <Paperclip className="h-4 w-4" />
            Attach
          </Button>
          
          <Button className="gap-2 bg-email-primary hover:bg-email-secondary">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
