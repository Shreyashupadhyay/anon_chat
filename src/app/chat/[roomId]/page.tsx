// src/app/chat/[roomId]/page.tsx
'use client';

import type { ChangeEvent } from 'react'; // Import ChangeEvent for input onChange type
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, DoorOpen, Loader2 } from 'lucide-react'; // Removed AlertTriangle as it's not used
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Define a constant key for the system welcome message prefix
const SYSTEM_WELCOME_PREFIX = 'system-welcome';
const SYSTEM_DISCONNECT_PREFIX = 'system-disconnect';

// Message structure
interface Message {
  id: string;
  sender: 'me' | 'other' | 'system'; // Added 'system' sender type
  text: string;
  timestamp: number;
}

// Helper to generate unique IDs
let messageCounter = 0;
const generateUniqueId = (prefix: string = 'msg'): string => {
    messageCounter++;
    // Ensure uniqueness even with rapid calls by adding a counter and random element
    return `${prefix}-${Date.now()}-${messageCounter}-${Math.random().toString(36).substring(2, 9)}`;
}


export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params?.roomId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null); // Start as null
  const [isPartnerConnected, setIsPartnerConnected] = useState<boolean | null>(null); // Use null for initial unknown state
  const [isTyping, setIsTyping] = useState(false);
  const [dynamicRoomId, setDynamicRoomId] = useState<string | null>(null); // State to hold dynamic ID
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageSimIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Connection Management ---
  useEffect(() => {
    // Avoid hydration mismatch by generating ID only on client
    setDynamicRoomId(roomId || `room-${Math.random().toString(36).substring(2, 9)}`);

    if (!roomId) {
        // Redirect immediately if roomId is missing
        router.push('/');
        toast({ title: "Error", description: "Invalid chat room.", variant: "destructive" });
        return; // Stop further execution in this effect
    }

    console.log(`Attempting to connect to room: ${roomId}`);
    // Simulate connection establishing
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);
      setIsPartnerConnected(false); // Start waiting for partner after connection
      toast({ title: "Connected", description: "You are connected to the chat." });
      console.log("Connected to room.");
    }, 1000);

    // Cleanup function for when the component unmounts or roomId changes
    return () => {
      console.log(`Cleaning up connection for room: ${roomId}`);
      clearTimeout(connectTimeout);
      if (messageSimIntervalRef.current) clearInterval(messageSimIntervalRef.current);
      if (disconnectTimeoutRef.current) clearTimeout(disconnectTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      setIsConnected(null); // Reset connection status
      setIsPartnerConnected(null); // Reset partner status
      setIsTyping(false);
      setMessages([]); // Clear messages on full disconnect/leave
      // TODO: Add actual WebSocket disconnection logic here
    };
  }, [roomId, router, toast]); // Add router and toast as dependencies

  // --- Partner Joining & Welcome Message ---
  useEffect(() => {
    // Only run if connected and partner status is explicitly false (waiting)
    if (!isConnected || isPartnerConnected !== false) return;

    console.log("Waiting for partner...");
    const partnerJoinTimeout = setTimeout(() => {
      // Check again if still connected and waiting before proceeding
      if (isConnected && isPartnerConnected === false) {
          setIsPartnerConnected(true);
          toast({ title: "Partner Found", description: "Someone has joined the chat." });
          console.log("Partner joined.");
          // Add a system welcome message only if it doesn't exist
          setMessages((prev) => {
            const welcomeMsgId = generateUniqueId(SYSTEM_WELCOME_PREFIX);
             // Check if a welcome message was the *last* system message. Avoid adding duplicates rapidly.
            const lastMessage = prev[prev.length -1];
            if (!lastMessage || !lastMessage.id.startsWith(SYSTEM_WELCOME_PREFIX)) {
                return [
                    ...prev,
                    { id: welcomeMsgId, sender: 'system', text: 'You are now connected. Say hello!', timestamp: Date.now() }
                ];
            }
            return prev; // Return previous state if welcome message already exists or was just added
          });
      }
    }, 2000); // Simulate partner joining after a delay

    return () => clearTimeout(partnerJoinTimeout);

  }, [isConnected, isPartnerConnected, toast]); // Depends on connection and partner status

   // --- Mock Message Simulation & Partner Disconnect ---
   useEffect(() => {
    // Only run if both are fully connected (isConnected=true, isPartnerConnected=true)
    if (!isConnected || !isPartnerConnected) {
        // Clear existing timers if connection drops or partner leaves
        if (messageSimIntervalRef.current) clearInterval(messageSimIntervalRef.current);
        if (disconnectTimeoutRef.current) clearTimeout(disconnectTimeoutRef.current);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false); // Ensure typing indicator is off
        return;
    }

    console.log("Starting message simulation and disconnect timer.");

    // Simulate receiving messages
    messageSimIntervalRef.current = setInterval(() => {
        // Simulate partner typing briefly
        setIsTyping(true);
        console.log("Partner typing...");
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            console.log("Partner stopped typing.");
        }, 1500); // Typing indicator lasts 1.5s

        // Simulate receiving a message after typing
        // Use another timeout to ensure typing indicator shows first
        const receiveTimeout = setTimeout(() => {
           const randomMessages = ["Hey!", "What's up?", "Nice weather today.", "Tell me a joke!", "How are you doing?", "Random thoughts...", "...", "lol", "brb"];
           const randomText = randomMessages[Math.floor(Math.random() * randomMessages.length)];
           const newMessageId = generateUniqueId('other-msg');
           console.log(`Simulating received message (ID: ${newMessageId}): ${randomText}`);
          setMessages((prev) => [
            ...prev,
            { id: newMessageId, sender: 'other', text: randomText, timestamp: Date.now() },
          ]);
        }, 2000); // Delay message receipt after typing indicator starts
        // Ensure this inner timeout is also cleared if needed
        typingTimeoutRef.current = receiveTimeout;


    }, 8000); // Receive a message every 8 seconds

     // Simulate partner disconnecting randomly
    disconnectTimeoutRef.current = setTimeout(() => {
        // Only disconnect if still connected to a partner
        // Use client-side Math.random
        if (isConnected && isPartnerConnected && Math.random() > 0.7) { // 30% chance
             console.log("Simulating partner disconnect.");
             setIsPartnerConnected(false); // Change status to false (partner left)
             // Add a system message indicating disconnect
             setMessages((prev) => {
                 const disconnectMsgId = generateUniqueId(SYSTEM_DISCONNECT_PREFIX);
                 // Avoid adding duplicate disconnect messages if one was just added
                 const lastMessage = prev[prev.length - 1];
                 if (!lastMessage || !lastMessage.id.startsWith(SYSTEM_DISCONNECT_PREFIX)) {
                      return [
                         ...prev,
                         { id: disconnectMsgId, sender: 'system', text: 'Partner has disconnected. Waiting for a new one...', timestamp: Date.now() }
                      ];
                 }
                 return prev;

             });
             toast({
                 title: "Partner Disconnected",
                 description: "Your chat partner has left.",
                 variant: "destructive"
             });
             // Immediately start waiting for a new partner
             // This triggers the partner joining effect again
        }
    }, Math.floor(Math.random() * 30000) + 15000); // Random disconnect between 15-45 seconds (Client-side Math.random)

    // Cleanup timers when dependencies change or component unmounts
    return () => {
        console.log("Stopping message simulation and disconnect timer.");
        if (messageSimIntervalRef.current) clearInterval(messageSimIntervalRef.current);
        if (disconnectTimeoutRef.current) clearTimeout(disconnectTimeoutRef.current);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setIsTyping(false); // Ensure typing indicator is off on cleanup
    };
  }, [isConnected, isPartnerConnected, toast]); // Re-run when connection or partner status changes

  // --- Scrolling ---
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
          requestAnimationFrame(() => {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
          });
      }
    }
  }, []);

  // Scroll when messages change or typing indicator appears/disappears
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]); // Added the closing parenthesis here

  // --- Actions ---
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newMessage.trim() === '' || !isConnected || isPartnerConnected !== true) return;

    const message: Message = {
      id: generateUniqueId('my-msg'),
      sender: 'me',
      text: newMessage.trim(),
      timestamp: Date.now(), // Safe to use Date.now() here as it's client-side interaction
    };

    // TODO: Send message via WebSocket/Firebase
    console.log('Sending message:', message);
    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Ensure scroll happens after state update
     setTimeout(scrollToBottom, 0);
  };

   const handleLeaveChat = () => {
    console.log('Leaving chat');
    router.push('/'); // Navigate back home, triggering cleanup via useEffect return
    toast({ title: "Chat Left", description: "You have left the chat." });
  };

  // Type guard for input change event
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };


  // --- Render Logic ---

  // Initial loading state before connection is attempted or known
  if (isConnected === null || (isConnected === true && isPartnerConnected === null)) {
     return (
         <div className="flex h-screen flex-col bg-secondary">
           <Card className="flex flex-1 flex-col m-4 shadow-lg overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-card">
                 <Skeleton className="h-6 w-40" />
                 <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent className="flex-1 p-4 space-y-4 overflow-auto flex items-center justify-center">
                 <div className="flex items-center justify-center text-muted-foreground">
                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                     {isConnected === null ? 'Initializing...' : 'Finding partner...'}
                 </div>
              </CardContent>
              <CardFooter className="p-4 border-t bg-card">
                 <div className="flex w-full items-center space-x-2">
                    <Skeleton className="h-10 flex-1 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                 </div>
              </CardFooter>
           </Card>
         </div>
     );
  }

  return (
    <div className="flex h-screen flex-col bg-secondary">
      <Card className="flex flex-1 flex-col m-4 shadow-lg overflow-hidden">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-card">
          <CardTitle className="text-xl font-semibold text-primary">AnonChat Room: {dynamicRoomId ? dynamicRoomId.split('-')[1] : '...'}</CardTitle>
           <Button variant="ghost" size="icon" onClick={handleLeaveChat} title="Leave Chat">
             <DoorOpen className="h-5 w-5 text-destructive" />
              <span className="sr-only">Leave Chat</span>
           </Button>
        </CardHeader>

        {/* Chat Area */}
        <CardContent ref={scrollAreaRef} className="flex-1 p-0 overflow-hidden">
           <ScrollArea className="h-full w-full p-4">
             <div className="space-y-4">
                {/* Connection/Waiting Status */}
                 {isConnected && isPartnerConnected === false && (
                 <div className="flex items-center justify-center text-muted-foreground p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Waiting for a partner...
                 </div>
                )}

                {/* Message List */}
               {messages.map((msg) => (
                 <div
                   key={msg.id} // Use guaranteed unique key
                   className={`flex items-end space-x-2 ${
                     msg.sender === 'me' ? 'justify-end' : 'justify-start'
                   } ${msg.sender === 'system' ? 'justify-center' : ''}`} // Center system messages
                 >
                   {msg.sender === 'other' && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-muted text-muted-foreground text-xs">?</AvatarFallback>
                     </Avatar>
                   )}
                   <div
                     className={`max-w-[70%] rounded-lg px-3 py-2 shadow-sm ${
                       msg.sender === 'me'
                         ? 'bg-primary text-primary-foreground'
                         : msg.sender === 'other'
                         ? 'bg-card border'
                         : 'bg-secondary text-secondary-foreground text-center italic text-sm' // System message style
                     }`}
                   >
                     <p className="text-sm break-words">{msg.text}</p>
                   </div>
                     {msg.sender === 'me' && (
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground text-xs">Me</AvatarFallback>
                     </Avatar>
                   )}
                 </div>
               ))}

               {/* Typing Indicator */}
               {isTyping && isPartnerConnected === true && ( // Only show if partner is connected
                   <div className="flex items-center justify-start space-x-2">
                       <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">?</AvatarFallback>
                       </Avatar>
                       <div className="text-sm text-muted-foreground italic animate-pulse">typing...</div>
                   </div>
               )}

             </div>
           </ScrollArea>
        </CardContent>

        {/* Input Area */}
        <CardFooter className="p-4 border-t bg-card">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder={
                  isPartnerConnected === false ? "Waiting for partner..." :
                  "Type your message..."
                }
              value={newMessage}
              onChange={handleInputChange} // Use typed handler
              disabled={isPartnerConnected !== true} // Only enable when fully connected
              className="flex-1"
              aria-label="Chat message input"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPartnerConnected !== true || newMessage.trim() === ''}
              className="bg-accent text-accent-foreground hover:bg-accent/90" // Use accent color for send button
              aria-label="Send message"
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
