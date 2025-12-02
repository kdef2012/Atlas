
'use client'

import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, type Skill, type SkillCategory, type User } from '@/lib/types';
import { useCollection, useUser, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { SkillPopoverContent } from './SkillPopoverContent';

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
    const isPioneer = node.pioneerUserId === user?.id;
    const color = CATEGORY_COLORS[node.category] || 'gray';
    const isUnlocked = user.userSkills?.[node.id]?.isUnlocked === true;
    const prereqsMet = node.prerequisites?.every(prereqId => user.userSkills?.[prereqId]?.isUnlocked) ?? true;
    const userStat = user[`${node.cost?.category.toLowerCase()}Stat` as keyof User] as number || 0;
    const hasEnoughPoints = node.cost ? userStat >= node.cost.points : true;
    const canUnlock = !isUnlocked && prereqsMet && hasEnoughPoints;

    let statusStyles = 'opacity-40 grayscale-[50%]';
    if(isUnlocked) statusStyles = 'opacity-100 grayscale-0';
    if(canUnlock) statusStyles = 'opacity-80 grayscale-0 animate-pulse-glow';

    return (
       <Popover>
        <PopoverTrigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn(
                "absolute flex items-center justify-center rounded-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
                statusStyles
            )}
            style={{
              width: node.size,
              height: node.size,
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              borderColor: color,
              boxShadow: `0 0 ${node.size / 5}px ${color}`,
            }}
          >
            <div 
              className="absolute inset-0 rounded-full" 
              style={{ 
                backgroundColor: color.replace(')', ' / 0.2)'),
                animation: isUnlocked ? `pulse-nebula 3s infinite ease-in-out` : undefined,
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
    if (skills) {
      const maxXP = Math.max(...skills.map(s => s.xp || 10), 1);
      const skillMap = new Map<string, SkillNodeData>();

      const generatedNodes = skills.map(skill => {
        const size = 30 + ((skill.xp || 10) / maxXP) * 120; // min 30px, max 150px
        const node: SkillNodeData = {
          ...skill,
          size,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
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
  }, [skills]);

  const isLoading = areSkillsLoading || isUserLoading;

  if (isLoading || nodes.length === 0 || !user) {
      return (
          <div className="w-full h-[60vh] flex items-center justify-center bg-black/20 rounded-lg">
              <p className="text-muted-foreground">
                {isLoading ? 'Generating your Nebula...' : 'No skills logged yet. Start your journey!'}
              </p>
          </div>
      )
  }

  return (
    <div className="relative w-full h-[60vh] bg-black/20 rounded-lg overflow-hidden border border-border">
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
          <SkillNodeComponent key={node.id} node={node} index={i} user={user} />
        ))}
      </AnimatePresence>

       <style jsx>{`
        @keyframes pulse-nebula {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 10px ${'hsl(var(--accent))'}; }
          50% { box-shadow: 0 0 25px ${'hsl(var(--accent))'}; }
          100% { box-shadow: 0 0 10px ${'hsl(var(--accent))'}; }
        }
        .animate-pulse-glow {
            animation: pulse-glow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
