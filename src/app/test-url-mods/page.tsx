
'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { TwinskieAvatar } from '@/components/TwinskieAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestUrlModsPage() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading } = useDoc<User>(userRef);

  if (isLoading || !user) {
    return <div className="p-8">Loading...</div>;
  }

  // Test different URL modification combinations
  const testVariations = [
    {
      name: 'Default (No Mods)',
      avatarLayers: {},
      description: 'Standard avatar rendering'
    },
    {
      name: 'Performance Mode',
      avatarLayers: { performance_mode: true },
      description: 'Low quality, fast loading (512px, LOD 2)'
    },
    {
      name: 'Balanced Mode',
      avatarLayers: { balanced_mode: true },
      description: 'Medium quality (1024px, LOD 1)'
    },
    {
      name: 'Ultra HD Mode',
      avatarLayers: { ultra_quality: true },
      description: 'Maximum quality (2048px, LOD 0)'
    },
    {
      name: 'Expressive Face',
      avatarLayers: { expressive_mode: true },
      description: 'With facial expression morphTargets'
    },
    {
      name: 'A-Pose',
      avatarLayers: { a_pose: true },
      description: 'Power stance with arms out'
    },
    {
      name: 'T-Pose',
      avatarLayers: { t_pose: true },
      description: 'Classic T-pose'
    },
    {
      name: 'Ultra + Expressive',
      avatarLayers: { ultra_quality: true, expressive_mode: true },
      description: 'Combined: High quality + expressions'
    },
    {
      name: 'With Newbie Glow',
      avatarLayers: { newbie_glow: true, newbie_border: true },
      description: 'Visual effects: glow + border'
    },
    {
      name: 'Everything!',
      avatarLayers: { 
        ultra_quality: true, 
        expressive_mode: true,
        newbie_glow: true,
        newbie_border: true,
        fire_background: true
      },
      description: 'All cosmetics combined'
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">URL Modification Test</h1>
          <p className="text-muted-foreground">
            Testing Ready Player Me URL parameters for avatar customization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testVariations.map((variation) => {
            const testUser = {
              ...user,
              avatarLayers: variation.avatarLayers,
            };

            return (
              <Card key={variation.name} className="bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {variation.name}
                    {Object.keys(variation.avatarLayers).length > 0 && (
                      <Badge variant="secondary">
                        {Object.keys(variation.avatarLayers).length} active
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {variation.description}
                  </p>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <TwinskieAvatar 
                    user={testUser as any} 
                    size="md" 
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-blue-900/20 border-blue-500">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">URL Modifications:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><code>textureAtlas</code>: Controls texture quality (512, 1024, 2048)</li>
                <li><code>lod</code>: Level of detail (0=high, 1=med, 2=low)</li>
                <li><code>morphTargets</code>: Enable facial expressions (ARKit, Oculus)</li>
                <li><code>pose</code>: Body pose (A or T)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Example URLs:</h3>
              <div className="bg-black p-3 rounded text-xs font-mono overflow-x-auto">
                <div className="mb-2">
                  <span className="text-gray-500">Performance:</span>
                  <br />
                  <span className="text-green-400">{user.avatarUrl}?textureAtlas=512&lod=2</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-500">Ultra HD:</span>
                  <br />
                  <span className="text-blue-400">{user.avatarUrl}?textureAtlas=2048&lod=0</span>
                </div>
                <div>
                  <span className="text-gray-500">Expressive:</span>
                  <br />
                  <span className="text-purple-400">{user.avatarUrl}?morphTargets=ARKit,Oculus</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-green-400">Benefits:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>✅ FREE - No gem cost, instant availability</li>
                <li>✅ INSTANT - No image files needed</li>
                <li>✅ OFFICIAL - Uses Ready Player Me API</li>
                <li>✅ STACKABLE - Can combine with visual effects</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
