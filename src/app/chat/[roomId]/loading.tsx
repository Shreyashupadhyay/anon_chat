import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoadingChat() {
  return (
    <div className="flex h-screen flex-col bg-secondary">
      <Card className="flex flex-1 flex-col m-4 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-card">
           <Skeleton className="h-6 w-40" /> {/* Title Skeleton */}
           <Skeleton className="h-8 w-8 rounded-full" /> {/* Button Skeleton */}
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-4 overflow-hidden">
           {/* Simulate a few messages */}
          <div className="flex items-end space-x-2 justify-start">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-3/5 rounded-lg" />
          </div>
           <div className="flex items-end space-x-2 justify-end">
              <Skeleton className="h-16 w-2/5 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-end space-x-2 justify-start">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-1/2 rounded-lg" />
          </div>
          {/* Loading Indicator */}
          <div className="flex items-center justify-center text-muted-foreground pt-8">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Chat...
          </div>
        </CardContent>

        <CardFooter className="p-4 border-t bg-card">
          <div className="flex w-full items-center space-x-2">
            <Skeleton className="h-10 flex-1 rounded-md" /> {/* Input Skeleton */}
            <Skeleton className="h-10 w-10 rounded-md" /> {/* Button Skeleton */}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
