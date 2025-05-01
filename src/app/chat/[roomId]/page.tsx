'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, DoorOpen, AlertTriangle, Loader2 } from 'lucide-react'; // Added Loader2 import
import { useToast } from "@/hooks/use-toast";

// Mock message structure - Replace with actual data structure
interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: number;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params?.roomId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false); // Simulate connection status
  const [isPartnerConnected, setIsPartnerConnected] = useState(false); // Simulate partner connection
  const [isTyping, setIsTyping] = useState(false); // Simulate partner typing status
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // --- Mock Real-time Connection & Messaging ---
  // Replace this entire section with actual WebSocket/Firebase logic
  useEffect(() => {
    if (!roomId) return;

    console.log(`Joining room: ${roomId}`);
    // Simulate connection established
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      toast({ title: "Connected", description: "You are connected to the chat." });
      // Simulate partner joining after a delay
      const partnerJoinTimeout = setTimeout(() => {
        setIsPartnerConnected(true);
        toast({ title: "Partner Found", description: "Someone has joined the chat." });
        // Add a welcome message
        setMessages((prev) => [
          ...prev,
          { id: 'system-welcome', sender: 'other', text: 'Hello! 👋', timestamp: Date.now() }
        ]);
      }, 2000);
      return () => clearTimeout(partnerJoinTimeout);
    }, 1000);


    // Simulate receiving messages
    const messageInterval = setInterval(() => {
      if (isConnected && isPartnerConnected) {
        // Simulate partner typing
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);

        // Simulate receiving a message
        setTimeout(() => {
           const randomMessages = ["Hey!", "What's up?", "Nice weather today.", "Tell me a joke!", "How are you doing?"];
           const randomText = randomMessages[Math.floor(Math.random() * randomMessages.length)];
          setMessages((prev) => [
            ...prev,
            { id: `msg-${Date.now()}`, sender: 'other', text: randomText, timestamp: Date.now() },
          ]);
        }, 2000); // Delay message receipt after typing indicator
      }
    }, 8000); // Receive a message every 8 seconds

     // Simulate partner disconnecting randomly
    const disconnectTimeout = setTimeout(() => {
        if (Math.random() > 0.7 && isConnected && isPartnerConnected) { // 30% chance of disconnect
             setIsPartnerConnected(false);
             toast({
                 title: "Partner Disconnected",
                 description: "Your chat partner has left.",
                 variant: "destructive"
                });
        }
    }, Math.random() * 30000 + 15000); // Random disconnect between 15-45 seconds


    return () => {
      clearTimeout(connectTimeout);
      clearInterval(messageInterval);
      clearTimeout(disconnectTimeout);
      console.log(`Leaving room: ${roomId}`);
      // Simulate disconnection
      setIsConnected(false);
      setIsPartnerConnected(false);
    };
  }, [roomId, toast, isConnected, isPartnerConnected]); // Ensure dependencies are correctly listed

  // --- End Mock Section ---

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newMessage.trim() === '' || !isConnected || !isPartnerConnected) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    // TODO: Send message via WebSocket/Firebase
    console.log('Sending message:', message);
    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Simulate immediate scroll after sending
     setTimeout(scrollToBottom, 0);
  };

   const handleLeaveChat = () => {
    // TODO: Add actual disconnection logic here (WebSocket/Firebase)
    console.log('Leaving chat');
    setIsConnected(false);
    setIsPartnerConnected(false);
    toast({ title: "Chat Left", description: "You have left the chat." });
    router.push('/'); // Navigate back to home page
  };

  if (!roomId) {
    // Should ideally redirect or show an error earlier, but good fallback
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Invalid Chat Room ID.</p>
        </div>
        );
  }

  return (
    <div className="flex h-screen flex-col bg-secondary">
      <Card className="flex flex-1 flex-col m-4 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-card">
          <CardTitle className="text-xl font-semibold text-primary">AnonChat Room</CardTitle>
           <Button variant="ghost" size="icon" onClick={handleLeaveChat} title="Leave Chat">
             <DoorOpen className="h-5 w-5 text-destructive" />
           </Button>
        </CardHeader>

        <CardContent ref={scrollAreaRef} className="flex-1 p-0 overflow-hidden">
           <ScrollArea className="h-full w-full p-4">
             <div className="space-y-4">
                {!isConnected && (
                 <div className="flex items-center justify-center text-muted-foreground p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                 </div>
                )}
                 {isConnected && !isPartnerConnected && (
                 <div className="flex items-center justify-center text-muted-foreground p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Waiting for a partner...
                 </div>
                )}
                {isConnected && isPartnerConnected && messages.length === 0 && (
                     <div className="text-center text-muted-foreground p-4">Say hello!</div>
                )}
               {messages.map((msg) => (
                 <div
                   key={msg.id}
                   className={`flex items-end space-x-2 ${
                     msg.sender === 'me' ? 'justify-end' : 'justify-start'
                   }`}
                 >
                   {msg.sender === 'other' && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
                     </Avatar>
                   )}
                   <div
                     className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                       msg.sender === 'me'
                         ? 'bg-primary text-primary-foreground'
                         : 'bg-card border'
                     }`}
                   >
                     <p className="text-sm break-words">{msg.text}</p>
                     {/* Optional: Timestamp */}
                      {/* <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
                         {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p> */}
                   </div>
                     {msg.sender === 'me' && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground">Me</AvatarFallback>
                     </Avatar>
                   )}
                 </div>
               ))}
               {isTyping && (
                   <div className="flex items-center justify-start space-x-2">
                       <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
                       </Avatar>
                       <div className="text-sm text-muted-foreground italic">typing...</div>
                   </div>
               )}
                {isConnected && !isPartnerConnected && messages.length > 0 && ( // Show if partner left mid-chat
                     <div className="flex items-center justify-center text-destructive p-4 gap-2">
                        <AlertTriangle className="h-4 w-4"/> Partner has disconnected.
                     </div>
                )}
             </div>
           </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t bg-card">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder={isPartnerConnected ? "Type your message..." : "Waiting for partner..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!isConnected || !isPartnerConnected}
              className="flex-1"
              aria-label="Chat message input"
            />
            <Button type="submit" size="icon" disabled={!isConnected || !isPartnerConnected || newMessage.trim() === ''} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
