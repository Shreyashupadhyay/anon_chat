'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { matchUsers } from '@/services/matchmaking'; // Assuming matchmaking logic exists
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isMatching, setIsMatching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFindChat = async () => {
    setIsMatching(true);
    try {
      // TODO: In a real app, we'd get unique user IDs and create a chat room ID.
      // For now, we simulate matching and generate a simple room ID.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate matchmaking delay
      const roomId = `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      router.push(`/chat/${roomId}`);
    } catch (error) {
      console.error("Matchmaking failed:", error);
      toast({
        title: "Matchmaking Failed",
        description: "Could not find a chat partner. Please try again.",
        variant: "destructive",
      });
      setIsMatching(false);
    }
    // No need to set isMatching false on success, as we navigate away
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">AnonChat</CardTitle>
          <CardDescription className="text-muted-foreground">
            Connect and chat anonymously with a random person.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-center text-foreground">
            Ready to talk? Click the button below to find someone to chat with.
          </p>
          <Button
            onClick={handleFindChat}
            disabled={isMatching}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isMatching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding a Chat Partner...
              </>
            ) : (
              'Find a Chat Partner'
            )}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
