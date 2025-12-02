'use client'

import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, type Skill, type SkillCategory } from '@/lib/types';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

interface SkillNode extends Skill {
  category: SkillCategory;
  size: number;
  x: string;
  y: string;
}

export function NebulaView() {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const { user } = useUser();
  const firestore = useFirestore();

  const skillsCollectionRef = useMemoFirebase(() => collection(firestore, 'skills'), [firestore]);
  // In a real app, you might want to fetch only skills the user has logs for.
  // This fetches all skills for simplicity.
  const { data: skills, isLoading } = useCollection<Skill>(skillsCollectionRef);

  useEffect(() => {
    if (skills) {
      const maxXP = Math.max(...skills.map(s => s.xp), 1);
      const generatedNodes = skills.map(skill => {
        const size = 30 + (skill.xp / maxXP) * 120; // min 30px, max 150px
        return {
          ...skill,
          size,
          x: `${Math.random() * 80 + 10}%`,
          y: `${Math.random() * 80 + 10}%`,
        };
      });
      setNodes(generatedNodes);
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

  return (
    <div className="relative w-full h-[60vh] bg-black/20 rounded-lg overflow-hidden border border-border">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {nodes.map((node, i) => (
        <div
          key={node.id}
          className="absolute flex items-center justify-center rounded-full cursor-pointer group animate-fade-in-scale"
          style={{
            width: node.size,
            height: node.size,
            left: node.x,
            top: node.y,
            transform: 'translate(-50%, -50%)',
            backgroundColor: CATEGORY_COLORS[node.category]?.replace(')', ' / 0.2)') || 'rgba(128, 128, 128, 0.2)',
            border: `2px solid ${CATEGORY_COLORS[node.category] || 'gray'}`,
            boxShadow: `0 0 ${node.size / 5}px ${CATEGORY_COLORS[node.category] || 'gray'}`,
            animationDelay: `${i * 0.1}s`
          }}
        >
          <div 
            className="absolute inset-0 rounded-full" 
            style={{ 
              backgroundColor: CATEGORY_COLORS[node.category] || 'gray',
              animation: `pulse-nebula 3s infinite ease-in-out`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
          <div className="z-10 text-center p-1">
            <p className="font-bold text-xs sm:text-sm text-white truncate" style={{ textShadow: '0 0 5px black' }}>
              {node.name}
            </p>
            <p className="text-xs text-white/80" style={{ textShadow: '0 0 5px black' }}>
              XP {node.xp}
            </p>
            {node.pioneer && node.pioneerUserId === user?.uid && <p className="text-xs font-bold text-accent neon-text">PIONEER</p>}
          </div>
        </div>
      ))}
       <style jsx>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.5s ease-out forwards;
          opacity: 0;
          transform-origin: center;
        }
        @keyframes pulse-nebula {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.5; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
