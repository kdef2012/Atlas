'use client'

import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, type Skill, type SkillCategory } from '@/lib/types';

// In a real app, this would come from a database.
const mockSkills: (Skill & { category: SkillCategory })[] = [
  { id: '1', name: 'Running', xp: 500, level: 5, category: 'Physical' },
  { id: '2', name: 'React', xp: 1200, level: 12, category: 'Mental' },
  { id: '3', name: 'Public Speaking', xp: 300, level: 3, category: 'Social' },
  { id: '4', name: 'Cooking', xp: 750, level: 7, category: 'Practical' },
  { id: '5', name: 'Guitar', xp: 900, level: 9, category: 'Creative' },
  { id: '6', name: 'Weightlifting', xp: 1500, level: 15, category: 'Physical' },
  { id: '7', name: 'Meditation', xp: 250, level: 2, category: 'Mental' },
  { id: '8', name: 'Networking', xp: 400, level: 4, category: 'Social' },
  { id: '9', name: 'Budgeting', xp: 600, level: 6, category: 'Practical' },
  { id: '10', name: 'Spearfishing', xp: 150, level: 1, category: 'Physical', pioneer: true }, // Pioneer skill
  { id: '11', name: 'Python', xp: 1100, level: 11, category: 'Mental' },
];

interface SkillNode extends Skill {
  category: SkillCategory;
  size: number;
  x: string;
  y: string;
}

export function NebulaView() {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // This needs to run on the client to avoid hydration mismatch from Math.random()
    const maxXP = Math.max(...mockSkills.map(s => s.xp), 1);
    const generatedNodes = mockSkills.map(skill => {
      const size = 30 + (skill.xp / maxXP) * 120; // min 30px, max 150px
      return {
        ...skill,
        size,
        x: `${Math.random() * 80 + 10}%`,
        y: `${Math.random() * 80 + 10}%`,
      };
    });
    setNodes(generatedNodes);
  }, []);

  if (!isClient) {
      return (
          <div className="w-full h-[60vh] flex items-center justify-center bg-black/20 rounded-lg">
              <p className="text-muted-foreground">Generating your Nebula...</p>
          </div>
      )
  }

  return (
    <div className="relative w-full h-[60vh] bg-black/20 rounded-lg overflow-hidden border border-border">
      {/* Background stars */}
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {nodes.map((node, i) => (
        <div
          key={node.name}
          className="absolute flex items-center justify-center rounded-full cursor-pointer group animate-fade-in-scale"
          style={{
            width: node.size,
            height: node.size,
            left: node.x,
            top: node.y,
            transform: 'translate(-50%, -50%)',
            backgroundColor: CATEGORY_COLORS[node.category].replace(')', ' / 0.2)'),
            border: `2px solid ${CATEGORY_COLORS[node.category]}`,
            boxShadow: `0 0 ${node.size / 5}px ${CATEGORY_COLORS[node.category]}`,
            animationDelay: `${i * 0.1}s`
          }}
        >
          <div 
            className="absolute inset-0 rounded-full" 
            style={{ 
              backgroundColor: CATEGORY_COLORS[node.category],
              animation: `pulse-nebula 3s infinite ease-in-out`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
          <div className="z-10 text-center p-1">
            <p className="font-bold text-xs sm:text-sm text-white truncate" style={{ textShadow: '0 0 5px black' }}>
              {node.name}
            </p>
            <p className="text-xs text-white/80" style={{ textShadow: '0 0 5px black' }}>
              Lvl {node.level}
            </p>
            {node.pioneer && <p className="text-xs font-bold text-accent neon-text">PIONEER</p>}
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
