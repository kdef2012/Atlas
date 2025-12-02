'use client'

import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, type Skill, type SkillCategory } from '@/lib/types';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../ui/button';
import { CATEGORY_ICONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillNode extends Skill {
  category: SkillCategory;
  size: number;
  x: number; // Use numbers for position
  y: number; // Use numbers for position
}

interface Connection {
  from: SkillNode;
  to: SkillNode;
}

export function NebulaView() {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const { user } = useUser();
  const firestore = useFirestore();

  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const { data: skills, isLoading } = useCollection<Skill>(skillsCollectionRef);

  useEffect(() => {
    if (skills) {
      const maxXP = Math.max(...skills.map(s => s.xp || 10), 1);
      const skillMap = new Map<string, SkillNode>();

      const generatedNodes = skills.map(skill => {
        const size = 30 + ((skill.xp || 10) / maxXP) * 120; // min 30px, max 150px
        const node = {
          ...skill,
          size,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
        };
        skillMap.set(skill.id, node);
        return node;
      });
      setNodes(generatedNodes);

      // Generate connections based on prerequisites
      const generatedConnections: Connection[] = [];
      generatedNodes.forEach(node => {
        if (node.prerequisites) {
          node.prerequisites.forEach(prereqId => {
            const prereqNode = skillMap.get(prereqId);
            if (prereqNode) {
              generatedConnections.push({ from: prereqNode, to: node });
            }
          });
        }
      });
      setConnections(generatedConnections);
    }
  }, [skills]);

  if (isLoading || nodes.length === 0) {
      return (
          <div className="w-full h-[60vh] flex items-center justify-center bg-black/20 rounded-lg">
              <p className="text-muted-foreground">
                {isLoading ? 'Generating your Nebula...' : 'No skills logged yet. Start your journey!'}
              </p>
          </div>
      )
  }
  
  const SkillNodeComponent = ({ node, index }: { node: SkillNode, index: number }) => {
    const Icon = CATEGORY_ICONS[node.category];
    const color = CATEGORY_COLORS[node.category] || 'gray';
    const isPioneer = node.pioneerUserId === user?.uid;

    return (
       <Popover>
        <PopoverTrigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="absolute flex items-center justify-center rounded-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-accent"
            style={{
              width: node.size,
              height: node.size,
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: color.replace(')', ' / 0.2)') ,
              border: `2px solid ${color}`,
              boxShadow: `0 0 ${node.size / 5}px ${color}`,
            }}
          >
            <div 
              className="absolute inset-0 rounded-full" 
              style={{ 
                backgroundColor: color,
                animation: `pulse-nebula 3s infinite ease-in-out`,
                animationDelay: `${Math.random() * 3}s`
              }}
            ></div>
            <div className="z-10 text-center p-1">
              <p className="font-bold text-xs sm:text-sm text-white truncate" style={{ textShadow: '0 0 5px black' }}>
                {node.name}
              </p>
              {isPioneer && <p className="text-xs font-bold text-accent neon-text">PIONEER</p>}
            </div>
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="w-80 border-primary bg-background/80 backdrop-blur-sm">
          <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                 <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                  <h3 className="text-lg font-bold font-headline">{node.name}</h3>
                  <p className="text-sm text-muted-foreground">{node.description || "A skill waiting to be mastered."}</p>
                  <p className="text-xs text-accent mt-2 font-bold">XP Earned: {node.xp || 10}</p>
              </div>
          </div>
          <div className="mt-4">
             {/* Unlock button will go here in a future step */}
             <Button variant="outline" size="sm" className="w-full" disabled>Unlock (Coming Soon)</Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="relative w-full h-[60vh] bg-black/20 rounded-lg overflow-hidden border border-border">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.8 }} />
          </linearGradient>
        </defs>
        <AnimatePresence>
            {connections.map((conn, i) => (
              <motion.line
                key={`${conn.from.id}-${conn.to.id}`}
                x1={`${conn.from.x}%`}
                y1={`${conn.from.y}%`}
                x2={`${conn.to.x}%`}
                y2={`${conn.to.y}%`}
                stroke="url(#line-gradient)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
              />
            ))}
        </AnimatePresence>
      </svg>
      
      <AnimatePresence>
        {nodes.map((node, i) => (
          <SkillNodeComponent key={node.id} node={node} index={i} />
        ))}
      </AnimatePresence>

       <style jsx>{`
        @keyframes pulse-nebula {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
