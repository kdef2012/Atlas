
'use client';

import { useState, useMemo } from 'react';
import { TwinskieAvatar } from '@/components/twinskie-avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { COSMETIC_ITEMS, SKIN_TONES, BodyType, SkinTone } from '@/lib/avatar-system';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const MALE_STYLES = ['1', '2', '3'];
const FEMALE_STYLES = ['1', '2', '3'];

export default function AvatarGalleryPage() {
  const [dummyUser, setDummyUser] = useState<User>({
    id: 'gallery-user',
    archetype: 'Maverick',
    email: null,
    userName: 'Gallery Pilot',
    gender: 'Female',
    avatarStyle: 'female-average-medium-1',
    physicalStat: 50,
    mentalStat: 50,
    socialStat: 50,
    practicalStat: 50,
    creativeStat: 50,
    lastLogTimestamp: Date.now(),
    createdAt: Date.now(),
    level: 10,
    xp: 500,
    avatarLayers: {},
    momentumFlameActive: true,
    gems: 100,
    streakFreezes: 3,
    userSkills: {},
  });

  const handleLayerToggle = (itemId: string) => {
    setDummyUser(prevUser => {
      const newLayers = { ...prevUser.avatarLayers };
      newLayers[itemId] = !newLayers[itemId];
      return { ...prevUser, avatarLayers: newLayers };
    });
  };

  const handleBaseChange = (gender: 'Female' | 'Male', style: string) => {
    setDummyUser(prevUser => ({
        ...prevUser,
        gender,
        avatarStyle: `${gender.toLowerCase()}-average-medium-${style}` // Keeping body/skin constant for simplicity
    }));
  }

  const currentStyle = useMemo(() => {
    return dummyUser.avatarStyle?.split('-')[3] || '1';
  }, [dummyUser.avatarStyle]);

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-7xl">
      <Card>
          <CardHeader>
              <CardTitle className="font-headline text-3xl">Avatar Gallery & Storybook</CardTitle>
              <CardDescription>A development tool to preview all Twinskie styles and cosmetic layers.</CardDescription>
          </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left Column - Twinskie Display */}
        <div className="lg:col-span-1 flex justify-center">
            <TwinskieAvatar user={dummyUser} size="xl" />
        </div>

        {/* Right Column - Controls */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Base Styles</CardTitle>
                    <CardDescription>Select the base character portrait.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="font-bold text-lg">Female</Label>
                        <div className="flex gap-2 mt-2">
                           {FEMALE_STYLES.map(style => (
                               <Button 
                                    key={`female-${style}`}
                                    variant={dummyUser.gender === 'Female' && currentStyle === style ? 'default' : 'outline'}
                                    onClick={() => handleBaseChange('Female', style)}
                               >
                                   Style {style}
                               </Button>
                           ))}
                        </div>
                    </div>
                     <div>
                        <Label className="font-bold text-lg">Male</Label>
                        <div className="flex gap-2 mt-2">
                           {MALE_STYLES.map(style => (
                               <Button 
                                    key={`male-${style}`}
                                    variant={dummyUser.gender === 'Male' && currentStyle === style ? 'default' : 'outline'}
                                    onClick={() => handleBaseChange('Male', style)}
                               >
                                   Style {style}
                               </Button>
                           ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cosmetic Layers</CardTitle>
              <CardDescription>Toggle cosmetic items to preview them on the current base style.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {COSMETIC_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                        <Label htmlFor={item.id} className="font-semibold">{item.name}</Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                        id={item.id}
                        checked={dummyUser.avatarLayers?.[item.id] || false}
                        onCheckedChange={() => handleLayerToggle(item.id)}
                    />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
