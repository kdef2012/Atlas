
'use client';

import { useUser, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Wand2,
  Loader2
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { GeneratedCosmetic, EvolutionPathData, User, CosmeticItem, StoreItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { COSMETIC_ITEMS } from '@/lib/avatar-cosmetics';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateAvatarImage } from '@/actions/generateAvatarImage';


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

type AnyCosmetic = (GeneratedCosmetic & { source: 'ai' | 'static'; visualDescription: string; });

export default function WardrobePage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);
  const { toast } = useToast();

  const storeItemsCollection = useMemoFirebase(() => collection(firestore, 'store-items'), [firestore]);
  const { data: storeItems, isLoading: areStoreItemsLoading } = useCollection<StoreItem>(storeItemsCollection);
  
  const [equippedLayers, setEquippedLayers] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  const isLoading = isAuthLoading || isUserDocLoading || areStoreItemsLoading;

  useEffect(() => {
    if (user?.avatarLayers) {
      setEquippedLayers(user.avatarLayers);
    }
  }, [user]);

  const allOwnedCosmetics: AnyCosmetic[] = useMemo(() => {
    if (!user) return [];
    
    const cosmetics: AnyCosmetic[] = [];

    // Add AI-generated cosmetics
    if (user.aiGeneratedCosmetics) {
      Object.values(user.aiGeneratedCosmetics).forEach((cosmetic) => {
        cosmetics.push({ ...cosmetic, source: 'ai' });
      });
    }

    // Combine starter items with dynamic store items that are owned
    const allPurchasableCosmetics = [...COSMETIC_ITEMS, ...(storeItems || [])];
    
    allPurchasableCosmetics.forEach(item => {
      const isOwnedStarter = 'requirement' in item && item.requirement?.type === 'starter';
      const isOwnedPurchase = 'layerKey' in item && user.ownedCosmetics?.[item.layerKey];
      
      if (isOwnedStarter || isOwnedPurchase) {
           cosmetics.push({
              ...(item as any), // Cast to avoid type conflicts between StoreItem and CosmeticItem
              id: 'layerKey' in item ? item.layerKey : item.id,
              source: 'static',
              rarity: ('price' in item && item.price > 100) ? 'epic' : ('price' in item && item.price > 20) ? 'rare' : 'uncommon',
           });
      }
    });

    return cosmetics;
  }, [user, storeItems]);

  const handleToggleCosmetic = (cosmeticId: string) => {
    const newLayers = { ...equippedLayers };
    if (newLayers[cosmeticId]) {
      delete newLayers[cosmeticId];
    } else {
      newLayers[cosmeticId] = true;
    }
    setEquippedLayers(newLayers);
  };
  
  const handleApplyChanges = async () => {
    if (!user || !userRef) return;
    setIsGenerating(true);
    
    toast({
      title: 'Generating New Avatar...',
      description: 'The AI is rendering your new look. This may take a moment.',
    });

    try {
      // First, update the avatarLayers in Firestore so the server action can read them
      await updateDocumentNonBlocking(userRef, { avatarLayers: equippedLayers });

      // Fallback to avatarUrl if baseAvatarUrl is missing.
      const baseAvatar = user.baseAvatarUrl || user.avatarUrl;

      if (!baseAvatar) {
        throw new Error("Base avatar is missing. Cannot generate new image.");
      }

      // Collect visual descriptions
      const activeDescriptions = Object.keys(equippedLayers)
        .map(layerId => allOwnedCosmetics.find(c => c.id === layerId)?.visualDescription)
        .filter((d): d is string => !!d);

      // Call the server action to get the new image
      const result = await generateAvatarImage({
        baseAvatarDataUri: baseAvatar,
        cosmeticVisualDescriptions: activeDescriptions,
      });

      // Update the active avatarUrl with the generated image
      await updateDocumentNonBlocking(userRef, { avatarUrl: result.generatedAvatarDataUri });

      toast({
        title: '✨ Avatar Updated!',
        description: 'Your new look has been saved.',
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate your new avatar. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };


  if (isLoading || !user || !userRef) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
  }

  const suggestedCosmetics = (user.suggestedCosmetics as GeneratedCosmetic[]) || [];
  const evolutionPath = user.evolutionPath as EvolutionPathData;
  const filteredCosmetics = allOwnedCosmetics; 

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-headline">Your Wardrobe</h1>
           <p className="text-muted-foreground">
            Customize your Twinskie by equipping cosmetics. New AI-generated items are unlocked via activity milestones.
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-2xl font-bold">{allOwnedCosmetics.length}</div>
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
                 <Button onClick={handleApplyChanges} disabled={isGenerating} className="w-full">
                    {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <Wand2 className="mr-2"/>}
                    {isGenerating ? 'Generating...' : 'Apply & Generate Avatar'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="owned" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="owned">
                  <Check className="w-4 h-4 mr-2" />
                  Owned ({allOwnedCosmetics.length})
                </TabsTrigger>
                <TabsTrigger value="coming-soon">
                  <Lock className="w-4 h-4 mr-2" />
                  Coming Soon ({suggestedCosmetics.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="owned" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCosmetics.map((cosmetic) => {
                    const rarity = cosmetic.rarity || 'common';
                    const RarityIcon = RARITY_ICONS[rarity] || Star;
                    const isEquipped = equippedLayers[cosmetic.id] === true;
                    
                    return (
                      <Card 
                        key={cosmetic.id}
                        className={`bg-card border-2 transition-all cursor-pointer hover:scale-105 ${
                          isEquipped ? 'border-green-500 bg-green-900/20' : 'border-border'
                        }`}
                        onClick={() => handleToggleCosmetic(cosmetic.id)}
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
                          {(cosmetic as any).earnedThrough && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Activity className="w-3 h-3" />
                                <span>Earned through {(cosmetic as any).earnedThrough}</span>
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
                      <h3 className="text-xl font-bold mb-2">Wardrobe is Empty</h3>
                      <p className="text-muted-foreground">
                        Keep playing to earn new cosmetics!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

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
