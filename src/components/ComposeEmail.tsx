import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Check, X, Send, Paperclip, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

interface ComposeEmailProps {
  onClose?: () => void;
  replyTo?: string;
  subject?: string;
  initialBody?: string;
}

const ComposeEmail = ({ onClose, replyTo, subject, initialBody }: ComposeEmailProps) => {
  const [to, setTo] = useState("");
  const [subj, setSubj] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showProofread, setShowProofread] = useState(false);
  const [proofreadBody, setProofreadBody] = useState("");
  const [proofreadLoading, setProofreadLoading] = useState(false);

  // Initialize form whenever props change (including when AI generates a reply)
  useEffect(() => {
    setTo(replyTo || "");
    // Don't add Re: if it's already there
    setSubj(subject ? (subject.startsWith("Re:") ? subject : `Re: ${subject}`) : "");
    
    // Format the reply body with proper spacing
    if (initialBody) {
      setBody(initialBody);
    }
  }, [replyTo, subject, initialBody]);

  const handleSend = async () => {
    if (!to || !subj || !body.trim()) {
      toast({
        variant: "destructive",
        description: "Please fill in all fields",
      });
      return;
    }

    setSending(true);
    try {
      await api.post("/api/send_email", {
        to,
        subject: subj,
        body: body.trim()
      });
      
      toast({
        description: "Email sent successfully",
      });
      onClose?.();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        description: err.response?.data?.error || "Failed to send email",
      });
    } finally {
      setSending(false);
    }
  };

  const handleProofread = async () => {
    if (!body.trim()) {
      toast({
        description: "Please write some content before proofreading",
      });
      return;
    }

    setProofreadLoading(true);
    try {
      const response = await api.post("/api/proofread", { 
        body: body.trim() 
      });
      
      setProofreadBody(response.data.proofread_body);
      setShowProofread(true);
    } catch (err: any) {
      toast({
        variant: "destructive",
        description: err.response?.data?.error || "Proofreading failed",
      });
    } finally {
      setProofreadLoading(false);
    }
  };

  const applyProofread = () => {
    setBody(proofreadBody);
    setShowProofread(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">{replyTo ? "Reply" : "New Message"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* body */}
        <div className="p-3 space-y-2 flex-1">
          <Input 
            placeholder="To" 
            value={to} 
            onChange={e => setTo(e.target.value)}
            disabled={!!replyTo} // Disable if it's a reply
          />
          <Input 
            placeholder="Subject" 
            value={subj} 
            onChange={e => setSubj(e.target.value)}
          />
          <Textarea
            placeholder="Write your message here..."
            className="h-48 resize-none"
            value={body}
            onChange={e => setBody(e.target.value)}
          />

          {showProofread && (
            <div className="border rounded-lg p-3 space-y-2">
              <div className="font-medium text-xs text-gray-500">Proofread Version:</div>
              <div className="text-sm whitespace-pre-wrap h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                {proofreadBody}
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProofread}
                  disabled={proofreadLoading}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-1", {
                    "animate-spin": proofreadLoading
                  })} />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProofread(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={applyProofread}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Apply Changes
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="p-4 border-t flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleProofread}
              disabled={proofreadLoading}
            >
              <Sparkles className="h-4 w-4" />
              Proofread
            </Button>
          </div>
          <Button
            className="gap-2 bg-email-primary hover:bg-email-secondary"
            onClick={handleSend}
            disabled={sending}
          >
            <Send className={cn("h-4 w-4", {
              "animate-spin": sending
            })} />
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
