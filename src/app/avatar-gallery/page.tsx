'use client';

import { TwinskieAvatar } from '@/components/twinskie-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { User, SkillCategory } from '@/lib/types';
import { SKIN_TONES, type BodyType, type SkinTone } from '@/lib/avatar-system';

// This is a dev/design tool to preview all avatar variations
export default function AvatarGalleryPage() {
  // Mock user creator
  const createMockUser = (
    gender: 'Male' | 'Female',
    bodyType: BodyType,
    skinTone: SkinTone,
    style: string,
    dominantSkill: SkillCategory,
    inactive = false,
    withCosmetics = false
  ): User => {
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
      gender,
      avatarStyle: `${gender.toLowerCase()}-${bodyType}-${skinTone}-${style}`,
      ...skillStats,
      lastLogTimestamp: inactive ? Date.now() - (25 * 60 * 60 * 1000) : Date.now(),
      createdAt: Date.now(),
      level: 5,
      xp: 250,
      userSkills: {},
      avatarLayers: withCosmetics ? {
        'newbie_sweatband': true,
        'shadow_cloak': true,
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
          <TabsTrigger value="bodies">Body Types</TabsTrigger>
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
                      user={createMockUser('Female', 'average', 'medium', '1', skill)}
                      size="md"
                    />
                    <p className="font-semibold">{skill}</p>
                    <p className="text-xs text-muted-foreground">
                      {skill === 'Physical' && 'Athletic build, red aura'}
                      {skill === 'Mental' && 'Focused, blue aura'}
                      {skill === 'Social' && 'Open, purple aura'}
                      {skill === 'Practical' && 'Grounded, green aura'}
                      {skill === 'Creative' && 'Expressive, yellow aura'}
                    </p>
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
              <CardTitle>All Body Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {(['slim', 'average', 'athletic', 'plus'] as BodyType[]).map((bodyType) => (
                  <div key={bodyType} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser('Female', bodyType, 'medium', '1', 'Physical')}
                      size="md"
                    />
                    <p className="font-semibold capitalize">{bodyType}</p>
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
                {(Object.keys(SKIN_TONES) as SkinTone[]).map((tone) => (
                  <div key={tone} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser('Female', 'average', tone, '1', 'Mental')}
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
              <CardTitle>Hair Styles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {['1', '2', '3'].map((style) => (
                  <div key={style} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={createMockUser('Female', 'average', 'medium', style, 'Creative')}
                      size="md"
                    />
                    <p className="font-semibold">Style {style}</p>
                    <p className="text-xs text-muted-foreground">
                      {style === '1' && 'Brown hair'}
                      {style === '2' && 'Blonde hair'}
                      {style === '3' && 'Black hair'}
                    </p>
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
                    user={createMockUser('Female', 'average', 'medium', '1', 'Physical', false)}
                    size="md"
                  />
                  <p className="font-semibold">Active</p>
                  <p className="text-xs text-muted-foreground">Momentum flame on, colored</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={createMockUser('Female', 'average', 'medium', '1', 'Physical', true)}
                    size="md"
                  />
                  <p className="font-semibold">Inactive</p>
                  <p className="text-xs text-muted-foreground">24+ hours, grayscale</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Female', 'average', 'medium', '1', 'Physical'),
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

          <Card>
            <CardHeader>
              <CardTitle>Level Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                {[1, 5, 10, 25, 50].map((level) => (
                  <div key={level} className="text-center space-y-2">
                    <TwinskieAvatar
                      user={{
                        ...createMockUser('Female', 'average', 'medium', '1', 'Mental'),
                        level,
                      }}
                      size="sm"
                    />
                    <p className="font-semibold">Level {level}</p>
                  </div>
                ))}
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
                    user={{
                      ...createMockUser('Female', 'average', 'medium', '1', 'Physical'),
                      avatarLayers: { 'newbie_sweatband': true },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Newbie Sweatband</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Female', 'average', 'medium', '1', 'Physical'),
                      avatarLayers: { 'shadow_cloak': true },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Shadow Cloak</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Female', 'average', 'medium', '1', 'Mental'),
                      avatarLayers: { 'arcane_goggles': true },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Arcane Goggles</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Female', 'athletic', 'medium', '1', 'Physical'),
                      avatarLayers: { 'champion_pauldrons': true },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Champion Pauldrons</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Female', 'average', 'medium', '1', 'Creative'),
                      avatarLayers: { 'momentum_aura': true },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Momentum Aura</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layered Combinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Female', 'average', 'medium', '1', 'Physical'),
                      avatarLayers: {
                        'newbie_sweatband': true,
                        'champion_pauldrons': true,
                      },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Sweatband + Pauldrons</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Male', 'athletic', 'tan', '2', 'Physical'),
                      avatarLayers: {
                        'shadow_cloak': true,
                        'momentum_aura': true,
                      },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Cloak + Aura (Male)</p>
                </div>

                <div className="text-center space-y-2">
                  <TwinskieAvatar
                    user={{
                      ...createMockUser('Female', 'average', 'deep', '3', 'Mental'),
                      avatarLayers: {
                        'arcane_goggles': true,
                        'shadow_cloak': true,
                        'momentum_aura': true,
                      },
                    }}
                    size="md"
                  />
                  <p className="font-semibold">Full Gear</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Size Comparison */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Size Variations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-8">
            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <div key={size} className="text-center space-y-2">
                <TwinskieAvatar
                  user={createMockUser('Female', 'average', 'medium', '1', 'Physical', false, true)}
                  size={size}
                />
                <p className="text-sm font-semibold uppercase">{size}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
