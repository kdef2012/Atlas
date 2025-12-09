
/**
 * ULTIMATE Evolution Path System for ATLAS
 * 50 unique character archetypes based on user activities
 */

export type EvolutionPath = 
  // Academic Paths (8)
  | 'scholar'           // Reading, studying, research
  | 'scientist'         // Experiments, problem-solving, STEM
  | 'mathematician'     // Math challenges, logic puzzles
  | 'historian'         // History, social studies, analysis
  | 'linguist'          // Languages, translation, communication
  | 'philosopher'       // Critical thinking, ethics, debate
  | 'librarian'         // Organization, research, knowledge management
  | 'researcher'        // Deep investigation, academic pursuit
  
  // Creative Paths (8)
  | 'artist'            // Drawing, design, visual arts
  | 'musician'          // Music, rhythm, performance
  | 'writer'            // Writing, storytelling, journalism
  | 'filmmaker'         // Video, multimedia, production
  | 'animator'          // Animation, motion graphics
  | 'sculptor'          // 3D art, physical creation
  | 'poet'              // Poetry, creative expression
  | 'actor'             // Performance, drama, theater
  
  // Physical Paths (6)
  | 'athlete'           // Sports, fitness, competition
  | 'dancer'            // Dance, movement, choreography
  | 'explorer'          // Outdoor activities, adventure
  | 'martial_artist'    // Combat sports, discipline
  | 'yogi'              // Yoga, mindfulness, flexibility
  | 'swimmer'           // Swimming, aquatics
  
  // Practical Paths (7)
  | 'chef'              // Cooking, nutrition, food science
  | 'builder'           // Construction, engineering, making
  | 'gardener'          // Plants, nature, sustainability
  | 'mechanic'          // Fixing, tinkering, technology
  | 'tailor'            // Sewing, fashion, textiles
  | 'carpenter'         // Woodworking, craftsmanship
  | 'electrician'       // Electrical work, wiring, tech
  
  // Social & Leadership Paths (8)
  | 'leader'            // Leadership, organizing, management
  | 'entrepreneur'      // Business, finance, innovation
  | 'diplomat'          // Negotiation, communication, teamwork
  | 'mentor'            // Teaching, helping others, guidance
  | 'volunteer'         // Community service, charity, activism
  | 'counselor'         // Therapy, listening, mental health support
  | 'politician'        // Governance, policy, public service
  | 'social_worker'     // Community aid, social justice
  
  // Tech Paths (7)
  | 'gamer'             // Gaming, strategy, competition
  | 'coder'             // Programming, tech, development
  | 'designer'          // UI/UX, product design, innovation
  | 'hacker'            // Cybersecurity, ethical hacking
  | 'data_scientist'    // Data analysis, statistics, AI
  | 'roboticist'        // Robotics, automation, engineering
  | 'web_developer'     // Web development, frontend/backend
  
  // Professional Paths (8)
  | 'doctor'            // Medicine, healthcare, healing
  | 'lawyer'            // Law, justice, legal studies
  | 'architect'         // Architecture, building design
  | 'engineer'          // Engineering, problem-solving
  | 'journalist'        // News, reporting, investigation
  | 'detective'         // Investigation, mystery-solving
  | 'veterinarian'      // Animal care, biology
  | 'pharmacist'        // Pharmacy, chemistry, medicine
  
  // Creative Professional (6)
  | 'photographer'      // Photography, visual documentation
  | 'fashion_designer'  // Fashion, style, trends
  | 'interior_designer' // Interior design, aesthetics
  | 'graphic_designer'  // Graphic design, branding
  | 'game_designer'     // Game design, mechanics, UX
  | 'sound_engineer'    // Audio, music production, tech
  
  // Environmental & Science (4)
  | 'environmentalist'  // Sustainability, eco-conscious
  | 'biologist'         // Biology, life sciences
  | 'astronomer'        // Space, stars, cosmology
  | 'geologist'         // Earth science, rocks, minerals
  
  // Hybrid/Special (2)
  | 'polymath'          // Excellence in multiple areas
  | 'balanced'          // Moderate activity across all areas

/**
 * Extended activity mapping
 */
export interface ActivityStats {
  // Academic
  reading?: number;
  studying?: number;
  research?: number;
  math?: number;
  science?: number;
  history?: number;
  languages?: number;
  philosophy?: number;
  library?: number;
  
  // Creative
  art?: number;
  music?: number;
  writing?: number;
  video?: number;
  animation?: number;
  sculpture?: number;
  poetry?: number;
  acting?: number;
  
  // Physical
  workout?: number;
  sports?: number;
  dance?: number;
  outdoor?: number;
  martial_arts?: number;
  yoga?: number;
  swimming?: number;
  
  // Practical
  cooking?: number;
  building?: number;
  gardening?: number;
  fixing?: number;
  sewing?: number;
  woodworking?: number;
  electrical?: number;
  
  // Social
  leadership?: number;
  business?: number;
  teamwork?: number;
  teaching?: number;
  volunteering?: number;
  counseling?: number;
  politics?: number;
  social_work?: number;
  
  // Tech
  gaming?: number;
  coding?: number;
  design?: number;
  cybersecurity?: number;
  data_science?: number;
  robotics?: number;
  web_dev?: number;
  
  // Professional
  medicine?: number;
  law?: number;
  architecture?: number;
  engineering?: number;
  journalism?: number;
  investigation?: number;
  veterinary?: number;
  pharmacy?: number;
  
  // Creative Professional
  photography?: number;
  fashion?: number;
  interior_design?: number;
  graphic_design?: number;
  game_design?: number;
  audio?: number;
  
  // Environmental
  sustainability?: number;
  biology?: number;
  astronomy?: number;
  geology?: number;
}

/**
 * Path-specific themes - ALL 50 PATHS!
 */
export const PATH_THEMES: Record<EvolutionPath, {
  colors: string[];
  accessories: string[];
  auras: string[];
  personality: string;
  category: string;
}> = {
  // Academic (8)
  scholar: {
    colors: ['#3B82F6', '#8B5CF6', '#1E40AF'],
    accessories: ['glasses', 'books', 'quill', 'scroll', 'mortarboard'],
    auras: ['book pages floating', 'glowing wisdom', 'constellation pattern'],
    personality: 'Thoughtful, analytical, knowledge-seeking',
    category: 'Academic',
  },
  scientist: {
    colors: ['#10B981', '#06B6D4', '#059669'],
    accessories: ['lab coat', 'goggles', 'beaker', 'atom symbol', 'microscope'],
    auras: ['chemical reactions', 'molecular patterns', 'electric sparks'],
    personality: 'Curious, experimental, methodical',
    category: 'Academic',
  },
  mathematician: {
    colors: ['#6366F1', '#8B5CF6', '#4F46E5'],
    accessories: ['calculator', 'geometric shapes', 'pi symbol', 'protractor'],
    auras: ['floating equations', 'fractal patterns', 'golden ratio spiral'],
    personality: 'Logical, precise, pattern-recognizing',
    category: 'Academic',
  },
  historian: {
    colors: ['#92400E', '#78350F', '#A16207'],
    accessories: ['ancient scroll', 'hourglass', 'quill pen', 'historical map'],
    auras: ['timeline traces', 'ancient runes', 'historical documents'],
    personality: 'Reflective, contextual, story-focused',
    category: 'Academic',
  },
  linguist: {
    colors: ['#EC4899', '#8B5CF6', '#3B82F6'],
    accessories: ['dictionary', 'translation book', 'globe', 'language symbols'],
    auras: ['floating words', 'multilingual text', 'communication waves'],
    personality: 'Communicative, culturally aware, articulate',
    category: 'Academic',
  },
  philosopher: {
    colors: ['#6366F1', '#8B5CF6', '#374151'],
    accessories: ['thinking cap', 'ancient texts', 'yin-yang', 'question mark'],
    auras: ['thought bubbles', 'philosophical symbols', 'wisdom glow'],
    personality: 'Contemplative, ethical, deep-thinking',
    category: 'Academic',
  },
  librarian: {
    colors: ['#92400E', '#B45309', '#3B82F6'],
    accessories: ['book cart', 'reading glasses', 'library card', 'bookshelf'],
    auras: ['organized shelves', 'dewey decimal', 'quiet zone glow'],
    personality: 'Organized, helpful, knowledge-keeper',
    category: 'Academic',
  },
  researcher: {
    colors: ['#3B82F6', '#10B981', '#6366F1'],
    accessories: ['magnifying glass', 'clipboard', 'research notes', 'lab badge'],
    auras: ['investigation lines', 'data points', 'discovery sparkles'],
    personality: 'Thorough, dedicated, detail-oriented',
    category: 'Academic',
  },

  // Creative (8)
  artist: {
    colors: ['#EC4899', '#F59E0B', '#8B5CF6'],
    accessories: ['paintbrush', 'palette', 'beret', 'easel', 'sketchbook'],
    auras: ['paint splatters', 'rainbow waves', 'creative sparks'],
    personality: 'Expressive, imaginative, visual',
    category: 'Creative',
  },
  musician: {
    colors: ['#F59E0B', '#EF4444', '#8B5CF6'],
    accessories: ['headphones', 'music notes', 'guitar', 'microphone', 'vinyl'],
    auras: ['sound waves', 'musical notes floating', 'rhythm pulses'],
    personality: 'Rhythmic, expressive, harmonious',
    category: 'Creative',
  },
  writer: {
    colors: ['#6366F1', '#EC4899', '#14B8A6'],
    accessories: ['typewriter', 'fountain pen', 'manuscript', 'ink bottle'],
    auras: ['flowing words', 'story threads', 'poetic verses'],
    personality: 'Articulate, imaginative, narrative',
    category: 'Creative',
  },
  filmmaker: {
    colors: ['#EF4444', '#F59E0B', '#3B82F6'],
    accessories: ['camera', 'clapperboard', 'film reel', 'director chair'],
    auras: ['film frames', 'spotlight beams', 'cinematic effects'],
    personality: 'Visual storyteller, dramatic, technical',
    category: 'Creative',
  },
  animator: {
    colors: ['#EC4899', '#F59E0B', '#3B82F6'],
    accessories: ['drawing tablet', 'storyboard', 'frame counter', 'character sheet'],
    auras: ['animated sparkles', 'motion lines', 'frame-by-frame'],
    personality: 'Patient, creative, technical',
    category: 'Creative',
  },
  sculptor: {
    colors: ['#78350F', '#92400E', '#6B7280'],
    accessories: ['chisel', 'clay', 'sculpting tools', 'wire frame'],
    auras: ['marble dust', '3D forms', 'creative energy'],
    personality: 'Tactile, patient, three-dimensional thinker',
    category: 'Creative',
  },
  poet: {
    colors: ['#8B5CF6', '#EC4899', '#3B82F6'],
    accessories: ['feather quill', 'poetry book', 'rose', 'moonlight'],
    auras: ['floating verses', 'rhyme patterns', 'lyrical glow'],
    personality: 'Romantic, expressive, emotional',
    category: 'Creative',
  },
  actor: {
    colors: ['#EF4444', '#F59E0B', '#8B5CF6'],
    accessories: ['theater masks', 'spotlight', 'script', 'stage curtain'],
    auras: ['dramatic flair', 'stage presence', 'character aura'],
    personality: 'Charismatic, expressive, versatile',
    category: 'Creative',
  },

  // Physical (6)
  athlete: {
    colors: ['#EF4444', '#F59E0B', '#10B981'],
    accessories: ['sweatband', 'medal', 'trophy', 'running shoes', 'water bottle'],
    auras: ['lightning bolts', 'energy trails', 'champion glow'],
    personality: 'Competitive, disciplined, energetic',
    category: 'Physical',
  },
  dancer: {
    colors: ['#EC4899', '#8B5CF6', '#F59E0B'],
    accessories: ['ballet shoes', 'ribbon', 'spotlight', 'music note'],
    auras: ['motion trails', 'graceful swirls', 'rhythm waves'],
    personality: 'Graceful, expressive, rhythmic',
    category: 'Physical',
  },
  explorer: {
    colors: ['#10B981', '#059669', '#14B8A6'],
    accessories: ['compass', 'map', 'backpack', 'binoculars', 'hiking boots'],
    auras: ['trail markers', 'mountain peaks', 'adventure spirit'],
    personality: 'Adventurous, curious, brave',
    category: 'Physical',
  },
  martial_artist: {
    colors: ['#EF4444', '#374151', '#F59E0B'],
    accessories: ['black belt', 'gi', 'bo staff', 'dojo symbol', 'discipline badge'],
    auras: ['energy strikes', 'martial aura', 'focused chi'],
    personality: 'Disciplined, focused, respectful',
    category: 'Physical',
  },
  yogi: {
    colors: ['#8B5CF6', '#EC4899', '#14B8A6'],
    accessories: ['yoga mat', 'lotus flower', 'om symbol', 'meditation cushion'],
    auras: ['peaceful energy', 'chakra glow', 'zen circles'],
    personality: 'Balanced, mindful, peaceful',
    category: 'Physical',
  },
  swimmer: {
    colors: ['#06B6D4', '#3B82F6', '#14B8A6'],
    accessories: ['swim goggles', 'swimming cap', 'medal', 'water droplets'],
    auras: ['water ripples', 'flowing waves', 'aquatic glow'],
    personality: 'Fluid, determined, aquatic',
    category: 'Physical',
  },

  // Practical (7)
  chef: {
    colors: ['#F59E0B', '#EF4444', '#EC4899'],
    accessories: ['chef hat', 'apron', 'whisk', 'rolling pin', 'chef knife'],
    auras: ['steam wisps', 'spice sparkles', 'delicious glow'],
    personality: 'Creative, precise, nurturing',
    category: 'Practical',
  },
  builder: {
    colors: ['#F97316', '#EA580C', '#78350F'],
    accessories: ['hard hat', 'hammer', 'wrench', 'blueprint', 'toolbelt'],
    auras: ['construction sparks', 'blueprint lines', 'building blocks'],
    personality: 'Practical, systematic, constructive',
    category: 'Practical',
  },
  gardener: {
    colors: ['#10B981', '#22C55E', '#84CC16'],
    accessories: ['gardening gloves', 'watering can', 'flower crown', 'seeds'],
    auras: ['growing vines', 'blooming flowers', 'nature essence'],
    personality: 'Patient, nurturing, growth-minded',
    category: 'Practical',
  },
  mechanic: {
    colors: ['#64748B', '#475569', '#F97316'],
    accessories: ['wrench', 'gear', 'oil can', 'work gloves', 'toolbox'],
    auras: ['mechanical gears', 'oil drops', 'tech sparks'],
    personality: 'Technical, problem-solving, hands-on',
    category: 'Practical',
  },
  tailor: {
    colors: ['#EC4899', '#8B5CF6', '#F59E0B'],
    accessories: ['sewing needle', 'thread spool', 'measuring tape', 'scissors'],
    auras: ['thread patterns', 'fabric swirls', 'creative stitching'],
    personality: 'Precise, creative, detail-oriented',
    category: 'Practical',
  },
  carpenter: {
    colors: ['#92400E', '#78350F', '#F97316'],
    accessories: ['saw', 'hammer', 'wood planks', 'level', 'pencil'],
    auras: ['wood shavings', 'sawdust sparkles', 'craftsmanship glow'],
    personality: 'Skilled, patient, craftsmanlike',
    category: 'Practical',
  },
  electrician: {
    colors: ['#F59E0B', '#EF4444', '#3B82F6'],
    accessories: ['voltage tester', 'wire', 'circuit board', 'electrical tape'],
    auras: ['electric sparks', 'power lines', 'voltage glow'],
    personality: 'Technical, careful, problem-solving',
    category: 'Practical',
  },

  // Social & Leadership (8)
  leader: {
    colors: ['#F59E0B', '#EF4444', '#8B5CF6'],
    accessories: ['megaphone', 'flag', 'crown', 'badge', 'podium'],
    auras: ['commanding presence', 'inspiring light', 'charisma waves'],
    personality: 'Charismatic, decisive, inspiring',
    category: 'Social',
  },
  entrepreneur: {
    colors: ['#10B981', '#F59E0B', '#3B82F6'],
    accessories: ['briefcase', 'tie', 'chart', 'lightbulb', 'money symbol'],
    auras: ['golden opportunity', 'innovation sparks', 'success glow'],
    personality: 'Innovative, risk-taking, strategic',
    category: 'Social',
  },
  diplomat: {
    colors: ['#3B82F6', '#8B5CF6', '#14B8A6'],
    accessories: ['peace dove', 'handshake symbol', 'world globe', 'scales'],
    auras: ['harmony waves', 'peaceful glow', 'unity circles'],
    personality: 'Diplomatic, empathetic, balanced',
    category: 'Social',
  },
  mentor: {
    colors: ['#F59E0B', '#EC4899', '#8B5CF6'],
    accessories: ['wise owl', 'teaching pointer', 'open book', 'guiding star'],
    auras: ['wisdom glow', 'guiding light', 'teaching aura'],
    personality: 'Supportive, knowledgeable, patient',
    category: 'Social',
  },
  volunteer: {
    colors: ['#EC4899', '#F59E0B', '#10B981'],
    accessories: ['heart symbol', 'helping hands', 'ribbon', 'service badge'],
    auras: ['compassion glow', 'helping light', 'community spirit'],
    personality: 'Compassionate, selfless, community-focused',
    category: 'Social',
  },
  counselor: {
    colors: ['#8B5CF6', '#EC4899', '#3B82F6'],
    accessories: ['couch', 'notebook', 'empathy symbol', 'listening ear'],
    auras: ['calming presence', 'understanding glow', 'safe space'],
    personality: 'Empathetic, patient, supportive',
    category: 'Social',
  },
  politician: {
    colors: ['#EF4444', '#3B82F6', '#F59E0B'],
    accessories: ['podium', 'flag', 'voting ballot', 'capitol building'],
    auras: ['patriotic glow', 'public service', 'democratic spirit'],
    personality: 'Persuasive, public-minded, strategic',
    category: 'Social',
  },
  social_worker: {
    colors: ['#EC4899', '#10B981', '#3B82F6'],
    accessories: ['helping hands', 'clipboard', 'community symbol', 'care badge'],
    auras: ['community care', 'social justice', 'helping aura'],
    personality: 'Caring, dedicated, justice-oriented',
    category: 'Social',
  },

  // Tech (7)
  gamer: {
    colors: ['#8B5CF6', '#EC4899', '#06B6D4'],
    accessories: ['controller', 'headset', 'pixel art', 'achievement badge'],
    auras: ['pixel particles', 'game UI', 'victory effects'],
    personality: 'Strategic, competitive, skilled',
    category: 'Tech',
  },
  coder: {
    colors: ['#10B981', '#3B82F6', '#8B5CF6'],
    accessories: ['laptop', 'code brackets', 'bug symbol', 'coffee mug'],
    auras: ['code matrix', 'binary rain', 'compile success'],
    personality: 'Logical, creative, problem-solving',
    category: 'Tech',
  },
  designer: {
    colors: ['#EC4899', '#8B5CF6', '#F59E0B'],
    accessories: ['pen tablet', 'color wheel', 'wireframe', 'design tools'],
    auras: ['creative grid', 'color swatches', 'design lines'],
    personality: 'Creative, user-focused, aesthetic',
    category: 'Tech',
  },
  hacker: {
    colors: ['#10B981', '#000000', '#22C55E'],
    accessories: ['terminal', 'lock pick', 'binary code', 'security badge'],
    auras: ['green code rain', 'security breach', 'ethical hacker glow'],
    personality: 'Clever, ethical, security-minded',
    category: 'Tech',
  },
  data_scientist: {
    colors: ['#3B82F6', '#8B5CF6', '#10B981'],
    accessories: ['graph', 'AI brain', 'data nodes', 'statistics symbol'],
    auras: ['data visualization', 'neural network', 'insights glow'],
    personality: 'Analytical, insightful, data-driven',
    category: 'Tech',
  },
  roboticist: {
    colors: ['#6B7280', '#3B82F6', '#F59E0B'],
    accessories: ['robot', 'circuit board', 'gears', 'automation symbol'],
    auras: ['mechanical precision', 'AI consciousness', 'future tech'],
    personality: 'Innovative, technical, futuristic',
    category: 'Tech',
  },
  web_developer: {
    colors: ['#F59E0B', '#3B82F6', '#10B981'],
    accessories: ['browser window', 'HTML tag', 'CSS symbol', 'responsive design'],
    auras: ['web elements', 'responsive grid', 'internet glow'],
    personality: 'Technical, creative, user-focused',
    category: 'Tech',
  },

  // Professional (8)
  doctor: {
    colors: ['#EF4444', '#FFFFFF', '#3B82F6'],
    accessories: ['stethoscope', 'medical cross', 'clipboard', 'surgical mask'],
    auras: ['healing light', 'medical cross glow', 'life saver aura'],
    personality: 'Caring, precise, life-saving',
    category: 'Professional',
  },
  lawyer: {
    colors: ['#374151', '#F59E0B', '#3B82F6'],
    accessories: ['gavel', 'law book', 'scales of justice', 'briefcase'],
    auras: ['justice scales', 'legal wisdom', 'courtroom presence'],
    personality: 'Argumentative, ethical, detail-oriented',
    category: 'Professional',
  },
  architect: {
    colors: ['#6B7280', '#3B82F6', '#F59E0B'],
    accessories: ['blueprint', 'ruler', 'compass', 'building model'],
    auras: ['architectural lines', 'design vision', 'structure glow'],
    personality: 'Creative, technical, visionary',
    category: 'Professional',
  },
  engineer: {
    colors: ['#F97316', '#3B82F6', '#10B981'],
    accessories: ['gear', 'calculator', 'blueprint', 'safety helmet'],
    auras: ['engineering precision', 'mechanical harmony', 'innovation spark'],
    personality: 'Analytical, practical, solution-oriented',
    category: 'Professional',
  },
  journalist: {
    colors: ['#374151', '#EF4444', '#F59E0B'],
    accessories: ['press badge', 'notebook', 'microphone', 'camera'],
    auras: ['breaking news', 'truth seeker', 'story lines'],
    personality: 'Curious, ethical, articulate',
    category: 'Professional',
  },
  detective: {
    colors: ['#374151', '#F59E0B', '#EF4444'],
    accessories: ['magnifying glass', 'detective hat', 'clue board', 'badge'],
    auras: ['investigation lines', 'mystery solving', 'detective glow'],
    personality: 'Observant, logical, determined',
    category: 'Professional',
  },
  veterinarian: {
    colors: ['#10B981', '#3B82F6', '#EC4899'],
    accessories: ['pet paw', 'stethoscope', 'animal badge', 'bandage'],
    auras: ['animal care', 'healing paws', 'veterinary love'],
    personality: 'Caring, patient, animal-loving',
    category: 'Professional',
  },
  pharmacist: {
    colors: ['#10B981', '#3B82F6', '#FFFFFF'],
    accessories: ['pill bottle', 'mortar and pestle', 'prescription', 'lab coat'],
    auras: ['medicine glow', 'pharmaceutical precision', 'health care'],
    personality: 'Precise, knowledgeable, helpful',
    category: 'Professional',
  },

  // Creative Professional (6)
  photographer: {
    colors: ['#6366F1', '#EC4899', '#F59E0B'],
    accessories: ['camera', 'lens', 'tripod', 'photo frame', 'flash'],
    auras: ['camera flash', 'photo frames', 'captured moments'],
    personality: 'Observant, artistic, technical',
    category: 'Creative Professional',
  },
  fashion_designer: {
    colors: ['#EC4899', '#8B5CF6', '#F59E0B'],
    accessories: ['dress form', 'fabric swatches', 'sewing machine', 'runway'],
    auras: ['fashion sparkles', 'style waves', 'trendsetter glow'],
    personality: 'Stylish, creative, trendsetting',
    category: 'Creative Professional',
  },
  interior_designer: {
    colors: ['#8B5CF6', '#F59E0B', '#10B981'],
    accessories: ['color swatches', 'furniture', 'floor plan', 'mood board'],
    auras: ['aesthetic harmony', 'space transformation', 'design vision'],
    personality: 'Aesthetic, spatial, creative',
    category: 'Creative Professional',
  },
  graphic_designer: {
    colors: ['#EC4899', '#F59E0B', '#3B82F6'],
    accessories: ['pen tool', 'color palette', 'vector shapes', 'brand logo'],
    auras: ['design elements', 'creative grid', 'branding glow'],
    personality: 'Creative, technical, brand-focused',
    category: 'Creative Professional',
  },
  game_designer: {
    colors: ['#8B5CF6', '#F59E0B', '#10B981'],
    accessories: ['game controller', 'level design', 'character sheet', 'dice'],
    auras: ['game mechanics', 'playful spirit', 'innovation sparks'],
    personality: 'Creative, analytical, playful',
    category: 'Creative Professional',
  },
  sound_engineer: {
    colors: ['#6366F1', '#F59E0B', '#10B981'],
    accessories: ['mixing board', 'headphones', 'sound wave', 'microphone'],
    auras: ['audio waves', 'sound frequencies', 'acoustic perfection'],
    personality: 'Technical, auditory, precise',
    category: 'Creative Professional',
  },

  // Environmental & Science (4)
  environmentalist: {
    colors: ['#10B981', '#22C55E', '#3B82F6'],
    accessories: ['recycling symbol', 'earth', 'tree', 'solar panel', 'water drop'],
    auras: ['nature energy', 'eco glow', 'sustainability circle'],
    personality: 'Conscious, activist, forward-thinking',
    category: 'Environmental',
  },
  biologist: {
    colors: ['#10B981', '#3B82F6', '#8B5CF6'],
    accessories: ['microscope', 'DNA helix', 'petri dish', 'biology book'],
    auras: ['cell division', 'life essence', 'biological glow'],
    personality: 'Curious, scientific, life-focused',
    category: 'Environmental',
  },
  astronomer: {
    colors: ['#1E1B4B', '#8B5CF6', '#F59E0B'],
    accessories: ['telescope', 'star map', 'planet', 'constellation'],
    auras: ['starlight', 'cosmic energy', 'universe glow'],
    personality: 'Wonder-filled, scientific, cosmic',
    category: 'Environmental',
  },
  geologist: {
    colors: ['#78350F', '#6B7280', '#F59E0B'],
    accessories: ['rock hammer', 'mineral', 'fossil', 'earth layers'],
    auras: ['earth energy', 'mineral glow', 'geological time'],
    personality: 'Patient, observant, earth-focused',
    category: 'Environmental',
  },

  // Hybrid (2)
  polymath: {
    colors: ['#F59E0B', '#8B5CF6', '#10B981', '#3B82F6'],
    accessories: ['multiple symbols', 'versatile tools', 'achievement collection'],
    auras: ['rainbow mastery', 'multi-colored excellence', 'universal glow'],
    personality: 'Versatile, curious, multi-talented',
    category: 'Hybrid',
  },
  balanced: {
    colors: ['#8B5CF6', '#3B82F6', '#10B981'],
    accessories: ['yin-yang', 'scale', 'harmony symbol', 'balance beam'],
    auras: ['balanced energy', 'harmony glow', 'equilibrium'],
    personality: 'Well-rounded, adaptable, harmonious',
    category: 'Hybrid',
  },
};

/**
 * Determine evolution path from activity stats
 */
export function determineEvolutionPath(stats: Partial<ActivityStats>): EvolutionPath {
  const activities = Object.entries(stats).filter(([_, value]) => value && value > 0);
  
  if (activities.length === 0) return 'balanced';
  
  // Check for polymath (5+ areas with 25+ activities each)
  const highActivityCount = activities.filter(([_, value]) => (value || 0) >= 25).length;
  if (highActivityCount >= 5) return 'polymath';
  
  // Find dominant activity
  const dominant = activities.reduce((max, [key, value]) => 
    (value || 0) > (max[1] || 0) ? [key, value] : max
  , ['', 0]);
  
  const [dominantActivity, dominantValue] = dominant;
  
  // Direct mapping for specific activities
  const directMapping: Record<string, EvolutionPath> = {
    // Academic
    languages: 'linguist',
    philosophy: 'philosopher',
    library: 'librarian',
    research: 'researcher',
    
    // Creative
    animation: 'animator',
    sculpture: 'sculptor',
    poetry: 'poet',
    acting: 'actor',
    
    // Physical
    martial_arts: 'martial_artist',
    yoga: 'yogi',
    swimming: 'swimmer',
    
    // Practical
    sewing: 'tailor',
    woodworking: 'carpenter',
    electrical: 'electrician',
    
    // Social
    counseling: 'counselor',
    politics: 'politician',
    social_work: 'social_worker',
    
    // Tech
    cybersecurity: 'hacker',
    data_science: 'data_scientist',
    robotics: 'roboticist',
    web_dev: 'web_developer',
    
    // Professional
    medicine: 'doctor',
    law: 'lawyer',
    architecture: 'architect',
    engineering: 'engineer',
    journalism: 'journalist',
    investigation: 'detective',
    veterinary: 'veterinarian',
    pharmacy: 'pharmacist',
    
    // Creative Professional
    photography: 'photographer',
    fashion: 'fashion_designer',
    interior_design: 'interior_designer',
    graphic_design: 'graphic_designer',
    game_design: 'game_designer',
    audio: 'sound_engineer',
    
    // Environmental
    biology: 'biologist',
    astronomy: 'astronomer',
    geology: 'geologist',
  };
  
  if (directMapping[dominantActivity]) {
    return directMapping[dominantActivity];
  }
  
  // Fallback to category-based determination
  if (dominantActivity === 'reading' || dominantActivity === 'studying') return 'scholar';
  if (dominantActivity === 'math') return 'mathematician';
  if (dominantActivity === 'science') return 'scientist';
  if (dominantActivity === 'history') return 'historian';
  
  if (dominantActivity === 'art') return 'artist';
  if (dominantActivity === 'music') return 'musician';
  if (dominantActivity === 'writing') return 'writer';
  if (dominantActivity === 'video') return 'filmmaker';
  
  if (dominantActivity === 'workout' || dominantActivity === 'sports') return 'athlete';
  if (dominantActivity === 'dance') return 'dancer';
  if (dominantActivity === 'outdoor') return 'explorer';
  
  if (dominantActivity === 'cooking') return 'chef';
  if (dominantActivity === 'building') return 'builder';
  if (dominantActivity === 'gardening') return 'gardener';
  if (dominantActivity === 'fixing') return 'mechanic';
  
  if (dominantActivity === 'leadership') return 'leader';
  if (dominantActivity === 'business') return 'entrepreneur';
  if (dominantActivity === 'teamwork') return 'diplomat';
  if (dominantActivity === 'teaching') return 'mentor';
  if (dominantActivity === 'volunteering') return 'volunteer';
  
  if (dominantActivity === 'gaming') return 'gamer';
  if (dominantActivity === 'coding') return 'coder';
  if (dominantActivity === 'design') return 'designer';
  
  if (dominantActivity === 'sustainability') return 'environmentalist';
  
  return 'balanced';
}

/**
 * Get cosmetic suggestions based on evolution path
 */
export function getCosmeticSuggestionsForPath(
  path: EvolutionPath,
  level: number
): string[] {
  const theme = PATH_THEMES[path];
  const suggestions: string[] = [];
  
  if (level >= 5) suggestions.push(`${path} Beginner Badge`);
  if (level >= 10) suggestions.push(...theme.accessories.slice(0, 2));
  if (level >= 25) suggestions.push(...theme.accessories.slice(2, 4));
  if (level >= 25) suggestions.push(`${theme.auras[0]} Aura`);
  if (level >= 50) suggestions.push(`Master ${path} Crown`);
  if (level >= 50) suggestions.push(...theme.auras.slice(1));
  if (level >= 100) suggestions.push(`Legendary ${path} Title`);
  if (level >= 100) suggestions.push(`Ultimate ${path} Transformation`);
  
  return suggestions;
}

/**
 * Get all paths by category
 */
export function getPathsByCategory(): Record<string, EvolutionPath[]> {
  const categories: Record<string, EvolutionPath[]> = {};
  
  Object.entries(PATH_THEMES).forEach(([path, theme]) => {
    if (!categories[theme.category]) {
      categories[theme.category] = [];
    }
    categories[theme.category].push(path as EvolutionPath);
  });
  
  return categories;
}

    