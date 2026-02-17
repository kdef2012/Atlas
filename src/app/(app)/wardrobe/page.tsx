
'use client';

import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Crown, 
  Star, 
  Lock, 
  Check, 
  TrendingUp,
  Activity,
  Zap,
  Loader2
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { GeneratedCosmetic, EvolutionPathData, User, CosmeticItem as StaticCosmeticItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { COSMETIC_ITEMS } from '@/lib/avatar-cosmetics';

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400 border-gray-400',
  uncommon: 'text-green-400 border-green-400',
  rare: 'text-blue-400 border-blue-400',
  epic: 'text-purple-400 border-purple-400',
  legendary: 'text-yellow-400 border-yellow-400',
};

const RARITY_ICONS: Record<string, React.ElementType> = {
  common: Star,
  uncommon: Sparkles,
  rare: Crown,
  epic: Zap,
  legendary: Crown,
};

// Unified type for any cosmetic item
type AnyCosmetic = (GeneratedCosmetic & { source: 'ai' }) | (StaticCosmeticItem & { source: 'static', rarity: string, visualDescription: string });

export default function WardrobePage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

  const [equippedCosmetics, setEquippedCosmetics] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const isLoading = isAuthLoading || isUserDocLoading;

  useEffect(() => {
    if (user?.avatarLayers) {
      const equipped = new Set(
        Object.entries(user.avatarLayers)
          .filter(([_, enabled]) => enabled)
          .map(([id]) => id)
      );
      setEquippedCosmetics(equipped);
    }
  }, [user]);

  const allOwnedCosmetics = useMemo(() => {
    const cosmetics: AnyCosmetic[] = [];

    // Add AI-generated cosmetics
    if (user?.aiGeneratedCosmetics) {
      Object.values(user.aiGeneratedCosmetics).forEach(cosmetic => {
        cosmetics.push({ ...cosmetic, source: 'ai' });
      });
    }

    // Add static starter cosmetics if user has them (level >= 1)
    if (user && user.level >= 1) {
        const starterItems = COSMETIC_ITEMS.filter(item => item.requirement?.type === 'starter');
        starterItems.forEach(item => {
            // Adapt the static item to the AnyCosmetic shape
            cosmetics.push({
                ...item,
                id: item.id,
                name: item.name,
                description: item.description,
                rarity: 'uncommon', // Assign a default rarity for display
                visualDescription: item.description,
                source: 'static',
                position: item.type, // Map type to position
            });
        });
    }

    return cosmetics;
  }, [user]);


  if (isLoading || !user || !userRef) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  const aiGeneratedCosmetics = (user.aiGeneratedCosmetics as Record<string, GeneratedCosmetic>) || {};
  const suggestedCosmetics = (user.suggestedCosmetics as GeneratedCosmetic[]) || [];
  const evolutionPath = user.evolutionPath as EvolutionPathData;

  const ownedCosmetics = allOwnedCosmetics;
  
  // Filter by category
  const filteredCosmetics = selectedCategory === 'all' 
    ? ownedCosmetics 
    : ownedCosmetics.filter(c => c.position === selectedCategory);

  // Toggle cosmetic
  const toggleCosmetic = async (cosmeticId: string) => {
    if (!userRef) return;
    const newEquipped = new Set(equippedCosmetics);
    
    if (newEquipped.has(cosmeticId)) {
      newEquipped.delete(cosmeticId);
    } else {
      newEquipped.add(cosmeticId);
    }
    
    setEquippedCosmetics(newEquipped);
    
    // Update Firestore
    try {
      await updateDoc(userRef, {
        [`avatarLayers.${cosmeticId}`]: !equippedCosmetics.has(cosmeticId),
      });
    } catch (error) {
      console.error('Failed to update cosmetic:', error);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-headline">Your Wardrobe</h1>
          <p className="text-muted-foreground">
            Customize your Twinskie by equipping cosmetics earned on your journey. New AI-generated cosmetics are unlocked by hitting activity milestones, not by leveling up. Your Evolution Level tracks your overall progress.
          </p>
        </div>

        {/* Stats Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">{ownedCosmetics.length}</div>
                <div className="text-sm text-muted-foreground">Cosmetics Owned</div>
              </div>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold">{user.evolutionLevel || user.level || 1}</div>
                <div className="text-sm text-muted-foreground">Evolution Level</div>
              </div>
              <div className="text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold capitalize">{evolutionPath?.primaryPath || 'Balanced'}</div>
                <div className="text-sm text-muted-foreground">Evolution Path</div>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold">{suggestedCosmetics.length}</div>
                <div className="text-sm text-muted-foreground">Coming Soon</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-card">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Your current look</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <TwinskieAvatar user={user} size="lg" />
              </CardContent>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center">
                  {equippedCosmetics.size} cosmetics equipped
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cosmetics Grid */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="owned" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="owned">
                  <Check className="w-4 h-4 mr-2" />
                  Owned ({ownedCosmetics.length})
                </TabsTrigger>
                <TabsTrigger value="coming-soon">
                  <Lock className="w-4 h-4 mr-2" />
                  Coming Soon ({suggestedCosmetics.length})
                </TabsTrigger>
              </TabsList>

              {/* Owned Cosmetics */}
              <TabsContent value="owned" className="space-y-6">
                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {['head', 'face', 'body', 'background', 'aura', 'border', 'glow'].map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Cosmetics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCosmetics.map((cosmetic) => {
                    const rarity = cosmetic.rarity || 'common';
                    const RarityIcon = RARITY_ICONS[rarity] || Star;
                    const isEquipped = equippedCosmetics.has(cosmetic.id);
                    
                    return (
                      <Card 
                        key={cosmetic.id}
                        className={`bg-card border-2 transition-all cursor-pointer hover:scale-105 ${
                          isEquipped ? 'border-green-500 bg-green-900/20' : 'border-border'
                        }`}
                        onClick={() => toggleCosmetic(cosmetic.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {cosmetic.name}
                                {isEquipped && <Check className="w-4 h-4 text-green-500" />}
                              </CardTitle>
                              <Badge variant="outline" className={`mt-2 ${RARITY_COLORS[rarity]}`}>
                                <RarityIcon className="w-3 h-3 mr-1" />
                                {rarity}
                              </Badge>
                            </div>
                            {cosmetic.source === 'ai' && cosmetic.svgCode && (
                              <div 
                                className="w-16 h-16 flex-shrink-0"
                                dangerouslySetInnerHTML={{ __html: cosmetic.svgCode }}
                              />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {cosmetic.description}
                          </p>
                          {cosmetic.earnedThrough && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Activity className="w-3 h-3" />
                                <span>Earned through {cosmetic.earnedThrough}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {filteredCosmetics.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">No cosmetics here</h3>
                      <p className="text-muted-foreground">
                        No cosmetics in the '{selectedCategory}' category. Keep playing to earn more!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Coming Soon Cosmetics */}
              <TabsContent value="coming-soon" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedCosmetics.map((cosmetic, index) => {
                    const RarityIcon = RARITY_ICONS[cosmetic.rarity] || Star;
                    
                    return (
                      <Card 
                        key={index}
                        className="bg-card border-2 border-border opacity-75"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" />
                                {cosmetic.name}
                              </CardTitle>
                              <Badge variant="outline" className={`mt-2 ${RARITY_COLORS[cosmetic.rarity]}`}>
                                <RarityIcon className="w-3 h-3 mr-1" />
                                {cosmetic.rarity}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {cosmetic.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-yellow-400">
                            <TrendingUp className="w-3 h-3" />
                            <span>Unlock by: {cosmetic.earnedThrough}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {suggestedCosmetics.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">Keep playing!</h3>
                      <p className="text-muted-foreground">
                        New cosmetics will be suggested as you progress
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

    