/**
 * @fileOverview Defines the options for the custom AI avatar generation flow.
 */

export interface VisualOption {
  name: string;
}

export const SKIN_TONES = [
  { name: 'Porcelain', hex: '#FDF0D5' },
  { name: 'Fair', hex: '#FFDBAC' },
  { name: 'Light', hex: '#F1C27D' },
  { name: 'Golden', hex: '#E0AC69' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Sienna', hex: '#C68642' },
  { name: 'Honey', hex: '#8D5524' },
  { name: 'Chestnut', hex: '#7C4700' },
  { name: 'Ebony', hex: '#5C3317' },
  { name: 'Deep Ebony', hex: '#3C2005' },
  { name: 'Espresso', hex: '#2B1608' },
  { name: 'Midnight', hex: '#1F1209' },
  { name: 'Warm Sand', hex: '#BE965C' },
  { name: 'Deep Bronze', hex: '#9C7248' },
  { name: 'Dark Cocoa', hex: '#4B3232' },
];

export const HAIR_COLORS = [
  { name: 'Jet Black', hex: '#000000' },
  { name: 'Dark Brown', hex: '#2B1608' },
  { name: 'Chestnut Brown', hex: '#4B2C20' },
  { name: 'Light Brown', hex: '#7B4B2A' },
  { name: 'Dirty Blonde', hex: '#B58B4C' },
  { name: 'Golden Blonde', hex: '#E5BE83' },
  { name: 'Platinum Blonde', hex: '#F5E1C8' },
  { name: 'Auburn', hex: '#7A3411' },
  { name: 'Ginger', hex: '#B3541E' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Salt and Pepper', hex: '#4A4A4A' },
  { name: 'Electric Blue', hex: '#0047AB' },
  { name: 'Neon Pink', hex: '#FF1493' },
];

export const EYE_COLORS = [
  { name: 'Deep Brown', hex: '#3E2723' },
  { name: 'Light Brown', hex: '#795548' },
  { name: 'Amber', hex: '#BF360C' },
  { name: 'Hazel', hex: '#556B2F' },
  { name: 'Forest Green', hex: '#1B5E20' },
  { name: 'Emerald Green', hex: '#00C853' },
  { name: 'Sky Blue', hex: '#4FC3F7' },
  { name: 'Deep Blue', hex: '#0D47A1' },
  { name: 'Grey', hex: '#78909C' },
  { name: 'Steel Grey', hex: '#455A64' },
];

export const MALE_HAIR_STYLES: VisualOption[] = [
  { name: 'Buzz Cut' },
  { name: 'Crew Cut' },
  { name: 'Pompadour' },
  { name: 'Undercut' },
  { name: 'Side Part' },
  { name: 'Slicked Back' },
  { name: 'Top Knot' },
  { name: 'Man Bun' },
  { name: 'Dreadlocks (Short)' },
  { name: 'Dreadlocks (Long)' },
  { name: 'Afro (Short)' },
  { name: 'Afro (Large)' },
  { name: 'Braids' },
  { name: 'Curly Fade' },
  { name: 'Bald' },
];

export const FEMALE_HAIR_STYLES: VisualOption[] = [
  { name: 'Pixie Cut' },
  { name: 'Bob (Chin Length)' },
  { name: 'Shoulder Length Straight' },
  { name: 'Long Straight' },
  { name: 'Long Wavy' },
  { name: 'Tight Curls' },
  { name: 'Afro' },
  { name: 'High Bun' },
  { name: 'Ponytail' },
  { name: 'French Braids' },
  { name: 'Dreadlocks' },
  { name: 'Side-swept Bangs' },
  { name: 'Wolf Cut' },
  { name: 'Box Braids' },
  { name: 'Space Buns' },
];

export const FACIAL_HAIR_STYLES: VisualOption[] = [
  { name: 'Clean Shaven' },
  { name: 'Stubble' },
  { name: 'Short Beard' },
  { name: 'Full Beard' },
  { name: 'Goatee' },
  { name: 'Mustache' },
  { name: 'Van Dyke' },
  { name: 'Mutton Chops' },
  { name: 'Anchor Beard' },
  { name: 'Imperial Mustache' },
  { name: 'Soul Patch' },
  { name: 'Bandholz' },
  { name: 'Viking Beard' },
  { name: 'Handlebar Mustache' },
  { name: 'Circular Beard' },
  { name: 'Sideburns' },
];

export const GLASSES_STYLES: VisualOption[] = [
  { name: 'None' },
  { name: 'Round Glasses' },
  { name: 'Square Glasses' },
  { name: 'Aviator Glasses' },
  { name: 'Rectangle Glasses' },
  { name: 'Cat-Eye Glasses' },
  { name: 'Wayfarer Glasses' },
  { name: 'Rimless Glasses' },
  { name: 'Sporty Sunglasses' },
  { name: 'Circular Wire-rims' },
];

export const AGE_RANGES = [
  'Young Adult',
  'Adult',
  'Middle-Aged',
  'Mature',
];

export const BODY_TYPES = ['Slender', 'Athletic', 'Average', 'Broad'];
export const HEIGHTS = ['Short', 'Medium', 'Tall'];
