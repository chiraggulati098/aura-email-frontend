import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Inbox, 
  AlertTriangle, 
  Archive, 
  Send, 
  PlusCircle,
  LogOut
} from "lucide-react";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface EmailSidebarProps {
  activePage: string;
  onChangePage: (page: string) => void;
  onComposeClick: () => void;
}

const EmailSidebar = ({ activePage, onChangePage, onComposeClick }: EmailSidebarProps) => {
  const { logout } = useAuth();
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

      <div className="mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start rounded-none h-10 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

        <div className="p-4 text-xs text-muted-foreground">
          <p>AURA Email</p>
          <div className="flex items-center gap-2">
            <p>Smart Filtering Active</p>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-[blink_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSidebar;
