'use client'

import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, type Skill, type SkillCategory, type User } from '@/lib/types';
import { useCollection, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillPopoverContent } from './SkillPopoverContent';
import { Loader2 } from 'lucide-react';

interface SkillNodeData extends Skill {
  category: SkillCategory;
  size: number;
  x: number;
  y: number;
}

interface Connection {
  from: SkillNodeData;
  to: SkillNodeData;
}

const SkillNodeComponent = ({ node, index, user }: { node: SkillNodeData, index: number, user: User }) => {
    const color = CATEGORY_COLORS[node.category] || 'gray';
    const isUnlocked = user.userSkills?.[node.id]?.isUnlocked === true;
    const prereqsMet = node.prerequisites?.every(prereqId => user.userSkills?.[prereqId]?.isUnlocked) ?? true;
    
    // Check if user has enough energy to unlock (considering potential discounts)
    let finalCost = node.cost?.points ?? 0;
    if (user.traits?.specialist && node.cost?.category === user.archetype) finalCost = Math.round(finalCost * 0.9);
    if (user.traits?.jack_of_all_trades) finalCost = Math.round(finalCost * 0.95);
    
    const userStat = user[`${node.cost?.category.toLowerCase()}Stat` as keyof User] as number || 0;
    const hasEnoughPoints = userStat >= finalCost;
    const canUnlock = !isUnlocked && prereqsMet && hasEnoughPoints;

    return (
       <Popover>
        <PopoverTrigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn(
                "absolute flex items-center justify-center rounded-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent border-2",
                isUnlocked ? "opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "opacity-40 grayscale-[50%]",
                canUnlock && "opacity-90 grayscale-0 animate-nebula-pulse"
            )}
            style={{
              width: node.size,
              height: node.size,
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              borderColor: isUnlocked ? 'white' : color,
              backgroundColor: color.replace(')', ' / 0.3)'),
            }}
          >
            <div 
              className={cn(
                "absolute inset-0 rounded-full",
                isUnlocked && "bg-white/10"
              )} 
              style={{ 
                boxShadow: isUnlocked ? `0 0 ${node.size / 2}px ${color}` : `0 0 ${node.size / 5}px ${color}`,
              }}
            ></div>
            <div className="z-10 text-center p-1">
              <p className="font-bold text-[10px] sm:text-xs text-white leading-tight drop-shadow-md">
                {node.name}
              </p>
              {isUnlocked && <div className="mt-0.5 h-1 w-1 bg-white rounded-full mx-auto shadow-sm" />}
            </div>
          </motion.button>
        </PopoverTrigger>
        <SkillPopoverContent node={node} />
      </Popover>
    )
}

export function NebulaView() {
  const [nodes, setNodes] = useState<SkillNodeData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const userRef = useMemoFirebase(() => authUser ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser]);
  const { data: user, isLoading: isUserLoading } = useDoc<User>(userRef);

  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  const { data: skills, isLoading: areSkillsLoading } = useCollection<Skill>(skillsCollectionRef);

  useEffect(() => {
    if (skills && user) {
      const maxXP = Math.max(...skills.map(s => s.xp || 10), 1);
      const skillMap = new Map<string, SkillNodeData>();

      // Fog of War Logic: 
      // Filter skills to only show those unlocked OR those whose prerequisites are met (neighboring skills)
      const visibleSkills = skills.filter(skill => {
          const isUnlocked = user.userSkills?.[skill.id]?.isUnlocked;
          if (isUnlocked) return true;
          
          // Show if it's a starting skill (no prereqs)
          if (!skill.prerequisites || skill.prerequisites.length === 0) return true;
          
          // Show if ANY of its prerequisites are unlocked (Fog of War neighbors)
          return skill.prerequisites.some(prereqId => user.userSkills?.[prereqId]?.isUnlocked);
      });

      const generatedNodes = visibleSkills.map((skill, i) => {
        const size = 40 + ((skill.xp || 10) / maxXP) * 80;
        // Seeded random for consistent layout per skill
        const seed = skill.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const x = 15 + ((seed % 70));
        const y = 15 + (((seed * 7) % 70));
        
        const node: SkillNodeData = {
          ...skill,
          size,
          x,
          y,
        };
        skillMap.set(skill.id, node);
        return node;
      });
      setNodes(generatedNodes);

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
  }, [skills, user]);

  const isLoading = areSkillsLoading || isUserLoading;

  if (isLoading) {
      return (
          <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-black/20 rounded-lg gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Syncing Nebula clusters...</p>
          </div>
      )
  }

  return (
    <div className="relative w-full h-[60vh] bg-black/40 rounded-lg overflow-hidden border border-border shadow-inner">
      {/* Starfield background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '100px 100px' }}></div>
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.4 }} />
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
                strokeWidth="1"
                strokeDasharray="5 5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            ))}
        </AnimatePresence>
      </svg>
      
      <AnimatePresence>
        {nodes.map((node, i) => (
          <SkillNodeComponent key={node.id} node={node} index={i} user={user!} />
        ))}
      </AnimatePresence>

       <style jsx>{`
        @keyframes nebula-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes nebula-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); filter: brightness(1.3); }
        }
        .animate-nebula-pulse {
            animation: nebula-pulse 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
