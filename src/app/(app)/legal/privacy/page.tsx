
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-md">
        <CardHeader className="text-center border-b bg-secondary/20">
          <Eye className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle className="font-headline text-4xl">Privacy Protocol</CardTitle>
          <p className="text-muted-foreground">Your Data, Your Signal.</p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] p-8">
            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h3 className="text-xl font-bold text-primary">1. Data Minimization</h3>
                <p>We only collect data necessary to maintain your Twinskie signature and verify your achievements. This includes your email, chosen archetype, and the activity logs you choose to provide.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">2. Proof of Work Data</h3>
                <p>Photos and videos uploaded as "Proof of Work" are stored securely in the ATLAS Core (Firebase Storage). These are only visible to other citizens if you submit them for verification. You can delete your logs at any time from your settings.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">3. Geographic Signals</h3>
                <p>We use your Region, State, and Country to provide local leaderboards and regional sharding. We do not track your precise GPS coordinates or real-time location.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">4. No Third-Party Selling</h3>
                <p>Your signal is private. We do not sell your personal data or activity logs to third-party advertisers. ATLAS is funded by user activations and Gem purchases, not by your data.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">5. Right to Erase</h3>
                <p>You have full control over your existence in the ATLAS. You may reset your onboarding or delete your entire profile permanently from the Settings menu.</p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
