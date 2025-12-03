
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Guild, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.').max(500, 'Message is too long.'),
});

interface GuildChatProps {
  guild: Guild;
}

function ChatMessage({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) {
  return (
    <div className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xs md:max-w-md rounded-lg px-3 py-2',
          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {!isCurrentUser && <p className="text-xs font-bold mb-1 opacity-70">{message.userName}</p>}
        <p className="text-sm">{message.text}</p>
        <p className="text-xs opacity-60 mt-1 text-right">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function GuildChat({ guild }: GuildChatProps) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();
  const [isSending, setIsSending] = useState(false);

  const messagesCollectionRef = useMemoFirebase(
    () => collection(firestore, `guilds/${guild.id}/messages`),
    [firestore, guild.id]
  );
  
  const messagesQuery = useMemoFirebase(
      () => query(messagesCollectionRef, orderBy('timestamp', 'asc')),
      [messagesCollectionRef]
  );

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: '' },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof chatSchema>) {
    if (!authUser || !messagesCollectionRef) return;
    setIsSending(true);

    const newMessage: Omit<Message, 'id'> = {
      text: values.message,
      timestamp: Date.now(),
      userId: authUser.uid,
      userName: authUser.displayName || 'Anonymous',
    };

    try {
      addDocumentNonBlocking(messagesCollectionRef, newMessage);
      form.reset();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
        setIsSending(false);
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Guild Comms</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="h-[400px] flex-grow pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-3/4"/>
                        <Skeleton className="h-12 w-1/2 ml-auto"/>
                        <Skeleton className="h-20 w-2/3"/>
                    </div>
                ) : messages && messages.length > 0 ? (
                     messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.userId === authUser?.uid} />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground pt-12">No messages yet. Be the first to speak!</p>
                )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
          <Input 
            {...form.register('message')} 
            placeholder="Type a message..." 
            autoComplete="off"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

    