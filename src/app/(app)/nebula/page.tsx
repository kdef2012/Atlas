import { NebulaView } from '@/components/nebula/NebulaView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NebulaPage() {
  return (
    <div className="h-full">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">The Nebula</CardTitle>
          <CardDescription>Your constellation of skills. Brighter stars are your strengths.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <NebulaView />
        </CardContent>
      </Card>
    </div>
  );
}
