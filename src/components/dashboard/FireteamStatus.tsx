import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, Shield, Users } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function FireteamStatus() {
    const youAvatar = PlaceHolderImages.find(p => p.id === 'avatar');
    const user1Avatar = PlaceHolderImages.find(p => p.id === 'fireteam-user1');
    const user2Avatar = PlaceHolderImages.find(p => p.id === 'fireteam-user2');
    const user3Avatar = PlaceHolderImages.find(p => p.id === 'fireteam-user3');
    
    const fireteam = {
        name: "Quantum Leapers",
        streakActive: true,
        xpMultiplier: 1.2,
        members: [
            { name: "Cypher", avatar: user1Avatar },
            { name: "Glitch", avatar: user2Avatar },
            { name: "Rogue", avatar: user3Avatar },
            { name: "You", avatar: youAvatar },
        ]
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Users />
                    Fireteam
                </CardTitle>
                <CardDescription>Your current squad and status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">{fireteam.name}</h3>
                    {fireteam.streakActive ? (
                         <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 border-accent-foreground/20">
                            <Link className="h-3 w-3 mr-1"/>
                            Soul Link Active
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <Shield className="h-3 w-3 mr-1"/>
                            Link Broken
                        </Badge>
                    )}
                </div>
                <div className="flex -space-x-2 overflow-hidden mb-4">
                    {fireteam.members.map(member => (
                        <Avatar key={member.name} className="border-2 border-background">
                            <AvatarImage src={member.avatar?.imageUrl} data-ai-hint={member.avatar?.imageHint} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                     <Avatar className="border-2 border-dashed border-muted-foreground">
                        <AvatarFallback>+</AvatarFallback>
                    </Avatar>
                </div>
                <div className="text-sm text-muted-foreground">
                    <p>XP Multiplier: <span className="font-bold text-accent">{fireteam.xpMultiplier}x</span></p>
                    <p className="text-xs mt-1">Keep the daily streak alive to maintain the bonus!</p>
                </div>
            </CardContent>
        </Card>
    )
}
