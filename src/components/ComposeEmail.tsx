import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Paperclip } from "lucide-react";

interface ComposeEmailProps {
  onClose?: () => void;
  replyTo?: string;
  subject?: string;
}

const ComposeEmail = ({ onClose, replyTo, subject }: ComposeEmailProps) => {
  const [to, setTo]             = useState(replyTo || "");
  const [subj, setSubj]         = useState(replyTo ? `Re: ${subject}` : "");
  const [body, setBody]         = useState("");
  const [bodyType, setBodyType] = useState<"plain"|"html">("plain");
  const [sending, setSending]   = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/send_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject: subj, body, body_type: bodyType }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Unknown error");
      // optionally show a toast here
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Failed to send: " + err.message);
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

          <div className="flex items-center gap-2">
            <label htmlFor="bodyType">Format:</label>
            <select
              id="bodyType"
              className="border rounded px-2 py-1"
              value={bodyType}
              onChange={e => setBodyType(e.target.value as "plain"|"html")}
            >
              <option value="plain">Plain Text</option>
              <option value="html">HTML</option>
            </select>
          </div>

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
