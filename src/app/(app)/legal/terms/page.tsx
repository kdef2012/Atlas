
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-md">
        <CardHeader className="text-center border-b bg-secondary/20">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle className="font-headline text-4xl">ATLAS Terms of Service</CardTitle>
          <p className="text-muted-foreground">Effective Date: February 24, 2024</p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] p-8">
            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h3 className="text-xl font-bold text-primary">1. The Covenant of the Nebula</h3>
                <p>By entering the ATLAS, you agree to inhabit your digital signature (Twinskie) with integrity. ATLAS is a gamified environment where progress is tied to real-world effort. Attempting to bypass this through automation, false logging, or signal manipulation is a violation of the Covenant.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">2. Proof of Work & Verification</h3>
                <p>You acknowledge that high-tier rewards and "Pioneer" status require "Proof of Work" (visual data, device synchronization). You grant the ATLAS community (Vindicators) the right to review this data for the sole purpose of integrity validation. False signals may lead to XP penalties or status reversion.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">3. Digital Assets & Currency</h3>
                <p>Gems are a virtual currency used for aesthetic modifications. Gems have no real-world monetary value and cannot be exchanged for fiat currency. "Mastery" and "Stats" cannot be purchased and must be earned through real-world activity.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">4. Account Activation</h3>
                <p>Access to premium Nebula features may require a one-time activation fee. This fee grants lifetime access to the current version of the ATLAS environment. We do not use subscription models; your progress is yours forever.</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">5. Community Conduct</h3>
                <p>Fireteams and Guilds are spaces for growth. Harassment, discrimination, or disruptive behavior in communication channels (Comms) will result in immediate signal termination (Account Ban).</p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-primary">6. Liability</h3>
                <p>ATLAS is a tool for motivation. You are responsible for your own physical and mental well-being. Do not perform activities beyond your capability or in dangerous environments. The ATLAS Core is not liable for injuries sustained during real-world "Quests."</p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
