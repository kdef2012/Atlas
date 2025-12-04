
'use client';

import { TwinskieAvatar } from '@/components/twinskie-avatar-openpeeps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { User, SkillCategory } from '@/lib/types';
import { SKIN_TONE_COLORS, HAIR_COLOR_VALUES, type OpenPeepsConfig, encodeAvatarConfig } from '@/lib/avatar-system-openpeeps';
import type { BodyPose, HairStyle, SkinTone, HairColor, EyeStyle, MouthStyle } from '@/lib/avatar-system-openpeeps';

// This is a dev/design tool to preview all avatar variations
export default function AvatarGalleryPage() {
  // Mock user creator
  const createMockUser = (
    config: Partial<OpenPeepsConfig>,
    dominantSkill: SkillCategory,
    inactive = false,
    withCosmetics = false
  ): User => {
    
    const fullConfig: OpenPeepsConfig = {
        gender: 'Female',
        skinTone: 'light',
        body: 'standing',
        head: 'default',
        eyes: 'normal',
        eyebrows: 'up',
        mouth: 'smile',
        hair: 'short1',
        hairColor: 'brown',
        ...config
    };

    const skillStats = {
      Physical: { physicalStat: 100, mentalStat: 20, socialStat: 20, practicalStat: 20, creativeStat: 20 },
      Mental: { physicalStat: 20, mentalStat: 100, socialStat: 20, practicalStat: 20, creativeStat: 20 },
      Social: { physicalStat: 20, mentalStat: 20, socialStat: 100, practicalStat: 20, creativeStat: 20 },
      Practical: { physicalStat: 20, mentalStat: 20, socialStat: 20, practicalStat: 100, creativeStat: 20 },
      Creative: { physicalStat: 20, mentalStat: 20, socialStat: 20, practicalStat: 20, creativeStat: 100 },
    }[dominantSkill];

    return {
      id: 'preview',
      archetype: 'Sage',
      email: null,
      userName: 'Preview',
      ...skillStats,
      avatarStyle: encodeAvatarConfig(fullConfig),
      lastLogTimestamp: inactive ? Date.now() - (25 * 60 * 60 * 1000) : Date.now(),
      createdAt: Date.now(),
      level: 5,
      xp: 250,
      userSkills: {},
      avatarLayers: withCosmetics ? {
        'newbie_glow': true,
        'shadow_aura': true,
      } : undefined,
      momentumFlameActive: !inactive,
      gems: 100,
      streakFreezes: 0,
    };
  };

  return (
    <main className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold mb-2">Twinskie Avatar Gallery</h1>
        <p className="text-muted-foreground">
          Preview all avatar variations for development and design reference
        </p>
      </div>

      <Tabs defaultValue="evolution" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evolution">Skill Evolution</TabsTrigger>
          <TabsTrigger value="bodies">Poses & Colors</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="cosmetics">Cosmetics</TabsTrigger>
        </TabsList>

        {/* Skill Evolution Tab */}
        <TabsContent value="evolution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolution by Dominant Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {(['Physical', 'Mental', 'Social', 'Practical', 'Creative'] as SkillCategory[]).map((skill) => (
                  <div key={skill} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser({}, skill)}
                      size="md"
                    />
                    <p className="font-semibold">{skill}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Types Tab */}
        <TabsContent value="bodies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Body Poses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {(['standing', 'sitting', 'arms-crossed', 'hands-in-pockets'] as BodyPose[]).map((bodyPose) => (
                  <div key={bodyPose} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser({ body: bodyPose }, 'Physical')}
                      size="md"
                    />
                    <p className="font-semibold capitalize">{bodyPose.replace('-', ' ')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Skin Tones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                {(Object.keys(SKIN_TONE_COLORS) as SkinTone[]).map((tone) => (
                  <div key={tone} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser({ skinTone: tone }, 'Mental')}
                      size="sm"
                    />
                    <p className="text-sm font-semibold capitalize">{tone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hair Styles & Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                {(['none', 'short1', 'long1', 'bun', 'afro'] as HairStyle[]).map((style) => (
                  <div key={style} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser({ hair: style }, 'Creative')}
                      size="md"
                    />
                    <p className="font-semibold capitalize">{style}</p>
                  </div>
                ))}
                {(Object.keys(HAIR_COLOR_VALUES) as HairColor[]).map((color) => (
                   <div key={color} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser({ hairColor: color }, 'Creative')}
                      size="md"
                    />
                    <p className="font-semibold capitalize">{color}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* States Tab */}
        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avatar States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={createMockUser({}, 'Physical', false)}
                    size="md"
                  />
                  <p className="font-semibold">Active</p>
                  <p className="text-xs text-muted-foreground">Momentum flame on, colored</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={createMockUser({}, 'Physical', true)}
                    size="md"
                  />
                  <p className="font-semibold">Inactive</p>
                  <p className="text-xs text-muted-foreground">24+ hours, grayscale</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser({}, 'Physical'),
                      momentumFlameActive: false,
                    }}
                    size="md"
                  />
                  <p className="font-semibold">No Flame</p>
                  <p className="text-xs text-muted-foreground">Active but no streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cosmetics Tab */}
        <TabsContent value="cosmetics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Cosmetic Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={createMockUser({}, 'Physical', false, true)}
                    size="md"
                  />
                  <p className="font-semibold">All Items Equipped</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
