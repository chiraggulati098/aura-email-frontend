import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Paperclip } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ComposeEmailProps {
  onClose?: () => void;
  replyTo?: string;
  subject?: string;
  initialBody?: string;
}

const ComposeEmail = ({ onClose, replyTo, subject, initialBody }: ComposeEmailProps) => {
  const [to, setTo]             = useState(replyTo || "");
  const [subj, setSubj]         = useState(replyTo ? `Re: ${subject}` : "");
  const [body, setBody]         = useState(initialBody || "");
  const [sending, setSending]   = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const payload = { 
        to, 
        subject: subj, 
        body,
        user_email: 'tc.chiraggulati@gmail.com'
      };
      console.log('Sending email payload:', payload);

      const res = await fetch("http://127.0.0.1:5000/api/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      let json;
      try {
        json = await res.json();
      } catch (jsonError) {
        throw new Error(
          `Server error (${res.status}): Failed to parse response`
        );
      }

      if (!res.ok) {
        throw new Error(json?.error || `Server error (${res.status})`);
      }
      
      toast({
        title: "Success",
        description: "Mail sent!",
      });
      onClose?.();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: err.message,
      });
    } finally {
      setSending(false);
    }
  };

  console.log("ComposeEmail props:", { onClose, replyTo, subject });

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{replyTo ? "Reply" : "New Message"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose ?? (() => {})}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* body */}
        <div className="p-4 space-y-4 flex-1">
          <Input placeholder="To" value={to} onChange={e=>setTo(e.target.value)} />
          <Input placeholder="Subject" value={subj} onChange={e=>setSubj(e.target.value)} />

          <Textarea
            placeholder="Write your message here..."
            className="h-64 resize-none"
            value={body}
            onChange={e=>setBody(e.target.value)}
          />
        </div>

        {/* footer */}
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" size="sm" className="gap-1">
            <Paperclip className="h-4 w-4" />
            Attach
          </Button>
          <Button
            className="gap-2 bg-email-primary hover:bg-email-secondary"
            onClick={handleSend}
            disabled={sending}
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
