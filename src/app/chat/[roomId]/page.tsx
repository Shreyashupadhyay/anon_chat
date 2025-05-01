'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, DoorOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Mock message structure - Replace with actual data structure
interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: number;
}

// Helper to generate more robust unique IDs
const generateUniqueId = (prefix: string = 'msg'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

  // Connection management effect
  useEffect(() => {
    if (!roomId) return;

    console.log(`Attempting to connect to room: ${roomId}`);
    // Simulate connection establishing
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      toast({ title: "Connected", description: "You are connected to the chat." });
      console.log("Connected to room.");
    }, 1000);

    return () => {
      clearTimeout(connectTimeout);
      console.log(`Disconnecting from room: ${roomId}`);
      // Simulate disconnection cleanup
      setIsConnected(false);
      setIsPartnerConnected(false); // Ensure partner status resets on disconnect
      setMessages([]); // Clear messages on disconnect/leave
      // TODO: Add actual WebSocket disconnection logic here
    };
  }, [roomId, toast]); // Only depends on roomId and toast

  // Partner joining and initial message effect
  useEffect(() => {
    if (!isConnected || isPartnerConnected) return; // Only run if connected but partner hasn't joined yet

    console.log("Waiting for partner...");
    const partnerJoinTimeout = setTimeout(() => {
      setIsPartnerConnected(true);
      toast({ title: "Partner Found", description: "Someone has joined the chat." });
      console.log("Partner joined.");
      // Add a welcome message *only once* when partner joins
      setMessages((prev) => {
          // Prevent adding multiple welcome messages if this somehow re-runs
          if (prev.some(msg => msg.id.startsWith('system-welcome'))) return prev;
          return [
              ...prev,
              { id: generateUniqueId('system-welcome'), sender: 'other', text: 'Hello! 👋', timestamp: Date.now() }
            ];
      });
    }, 2000); // Simulate partner joining after a delay

    return () => clearTimeout(partnerJoinTimeout);

  }, [isConnected, isPartnerConnected, toast]); // Depends on connection and partner status

   // Message simulation and partner disconnect effect
   useEffect(() => {
    if (!isConnected || !isPartnerConnected) return; // Only run if both are connected

    console.log("Starting message simulation and disconnect timer.");

    // Simulate receiving messages
    const messageInterval = setInterval(() => {
        // Simulate partner typing
        setIsTyping(true);
        console.log("Partner typing...");
        setTimeout(() => {
            setIsTyping(false);
            console.log("Partner stopped typing.");
        }, 1500);

        // Simulate receiving a message
        setTimeout(() => {
           const randomMessages = ["Hey!", "What's up?", "Nice weather today.", "Tell me a joke!", "How are you doing?"];
           const randomText = randomMessages[Math.floor(Math.random() * randomMessages.length)];
           const newMessageId = generateUniqueId('other-msg'); // Use helper for unique ID
           console.log(`Simulating received message (ID: ${newMessageId}): ${randomText}`);
          setMessages((prev) => [
            ...prev,
            { id: newMessageId, sender: 'other', text: randomText, timestamp: Date.now() },
          ]);
        }, 2000); // Delay message receipt after typing indicator
    }, 8000); // Receive a message every 8 seconds

     // Simulate partner disconnecting randomly
    const disconnectTimeout = setTimeout(() => {
        // Only disconnect if still connected
        if (isPartnerConnected && Math.random() > 0.7) { // 30% chance of disconnect
             console.log("Simulating partner disconnect.");
             setIsPartnerConnected(false);
             toast({
                 title: "Partner Disconnected",
                 description: "Your chat partner has left.",
                 variant: "destructive"
                });
        }
    }, Math.random() * 30000 + 15000); // Random disconnect between 15-45 seconds

    return () => {
        console.log("Stopping message simulation and disconnect timer.");
        clearInterval(messageInterval);
        clearTimeout(disconnectTimeout);
        setIsTyping(false); // Ensure typing indicator is off on cleanup
    };
  }, [isConnected, isPartnerConnected, toast]); // Runs when connection or partner status changes


  // --- End Mock Section ---

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
          // Use requestAnimationFrame for smoother scrolling after render
          requestAnimationFrame(() => {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
          });
      }
    }
  }, []);


  useEffect(() => {
    // Scroll whenever messages change, or when typing indicator appears/disappears
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);


  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newMessage.trim() === '' || !isConnected || !isPartnerConnected) return;

    const message: Message = {
      id: generateUniqueId('my-msg'), // Use helper for unique ID
      sender: 'me',
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    // TODO: Send message via WebSocket/Firebase
    console.log('Sending message:', message);
    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Ensure scroll happens after state update has likely rendered
     setTimeout(scrollToBottom, 0);
  };

   const handleLeaveChat = () => {
    // TODO: Add actual disconnection logic here (WebSocket/Firebase)
    console.log('Leaving chat');
    // Trigger the cleanup in the main connection useEffect by navigating away,
    // which changes roomId implicitly or unmounts the component.
    router.push('/'); // Navigate back to home page
    // Show toast immediately
    toast({ title: "Chat Left", description: "You have left the chat." });
  };

  if (!roomId) {
    // Redirect or show error if roomId is missing on initial load
     useEffect(() => {
        router.push('/');
        toast({ title: "Error", description: "Invalid chat room.", variant: "destructive" });
     },[router, toast]);
     return (
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redirecting...
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
                   key={msg.id} // Key is now guaranteed to be unique
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
              placeholder={!isConnected ? "Connecting..." : !isPartnerConnected ? "Waiting for partner..." : "Type your message..."}
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
