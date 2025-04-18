
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Inbox, 
  AlertTriangle, 
  Archive, 
  Send, 
  PlusCircle,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';

interface EmailSidebarProps {
  activePage: string;
  onChangePage: (page: string) => void;
  onComposeClick: () => void;
}

const EmailSidebar = ({ activePage, onChangePage, onComposeClick }: EmailSidebarProps) => {
  const menuItems = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="mr-2 h-4 w-4" /> },
    { id: 'spam', label: 'Spam', icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
    { id: 'all', label: 'All email', icon: <Archive className="mr-2 h-4 w-4" /> },
    { id: 'sent', label: 'Sent', icon: <Send className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="w-60 border-r flex flex-col h-full">
      <div className="p-4">
        <Button 
          onClick={onComposeClick} 
          className="w-full gap-2 bg-email-primary hover:bg-email-secondary transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Compose
        </Button>
        
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            type="search" 
            placeholder="Search email" 
            className="pl-8" 
          />
        </div>
      </div>

      <nav className="mt-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-none h-10",
              activePage === item.id ? "bg-email-light/20 text-email-primary font-medium" : ""
            )}
            onClick={() => onChangePage(item.id)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="mt-auto p-4 text-xs text-muted-foreground">
        <p>AI Email</p>
        <p>Smart Filtering Active</p>
      </div>
    </div>
  );
};

export default EmailSidebar;
