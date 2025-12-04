
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCollection, useUser, useMemoFirebase, addDocumentNonBlocking, useDoc } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import type { Guild, Message, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, Globe, MapPin, Building, LocateFixed } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.').max(500, 'Message is too long.'),
});

interface ChatChannelProps {
    guild: Guild;
    channelId: string;
    channelName: string;
    messages: Message[];
    currentUser: User | null;
    isLoading: boolean;
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

function ChatChannel({ guild, channelId, channelName, messages, currentUser, isLoading }: ChatChannelProps) {
    const firestore = useFirestore();
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    const messagesCollectionRef = useMemoFirebase(
      () => collection(firestore, `guilds/${guild.id}/messages`),
      [firestore, guild.id]
    );

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
        if (!currentUser || !messagesCollectionRef) return;
        setIsSending(true);

        const newMessage: Omit<Message, 'id'> = {
            text: values.message,
            timestamp: Date.now(),
            userId: currentUser.id,
            userName: currentUser.userName,
            channel: channelId,
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
        <div className="space-y-4">
             <ScrollArea className="h-64 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-3/4"/>
                            <Skeleton className="h-12 w-1/2 ml-auto"/>
                        </div>
                    ) : messages.length > 0 ? (
                        messages.map(msg => (
                            <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.userId === currentUser?.id} />
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground pt-12">No messages in {channelName} yet.</p>
                    )}
                </div>
            </ScrollArea>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
                <Input {...form.register('message')} placeholder={`Message #${channelName}`} autoComplete="off" disabled={isSending}/>
                <Button type="submit" size="icon" disabled={isSending}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    )
}

export function GuildChat({ guild }: { guild: Guild }) {
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: currentUserData } = useDoc<User>(userDocRef);

  const fireteamDocRef = useMemoFirebase(() => currentUserData?.fireteamId ? doc(firestore, 'fireteams', currentUserData.fireteamId) : null, [firestore, currentUserData?.fireteamId]);
  const { data: fireteamData } = useDoc<Fireteam>(fireteamDocRef);

  const messagesCollectionRef = useMemoFirebase(
    () => collection(firestore, `guilds/${guild.id}/messages`),
    [firestore, guild.id]
  );
  
  const messagesQuery = useMemoFirebase(
      () => query(messagesCollectionRef, orderBy('timestamp', 'asc')),
      [messagesCollectionRef]
  );

  const { data: allMessages, isLoading } = useCollection<Message>(messagesQuery);
  
  const channels = useMemo(() => {
      if (!fireteamData) return [];
      return [
          { id: 'global', name: 'Global', icon: Globe },
          { id: fireteamData.country, name: fireteamData.country, icon: MapPin },
          { id: fireteamData.state, name: fireteamData.state, icon: Building },
          { id: fireteamData.region, name: fireteamData.region, icon: LocateFixed }
      ]
  }, [fireteamData]);

  const messagesByChannel = useMemo(() => {
    const grouped: Record<string, Message[]> = {};
    channels.forEach(c => grouped[c.id] = []);
    allMessages?.forEach(msg => {
        if(grouped[msg.channel]) {
            grouped[msg.channel].push(msg);
        }
    });
    return grouped;
  }, [allMessages, channels]);


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Guild Comms</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Accordion type="single" collapsible defaultValue="global">
          {channels.map(channel => (
             <AccordionItem value={channel.id} key={channel.id}>
                <AccordionTrigger>
                    <div className="flex items-center gap-2">
                        <channel.icon className="w-4 h-4"/>
                        {channel.name}
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <ChatChannel 
                        guild={guild}
                        channelId={channel.id}
                        channelName={channel.name}
                        messages={messagesByChannel[channel.id] || []}
                        currentUser={currentUserData}
                        isLoading={isLoading}
                    />
                </AccordionContent>
             </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

    