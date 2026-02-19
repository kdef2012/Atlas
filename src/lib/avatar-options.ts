
/**
 * @fileOverview Defines the options for the custom AI avatar generation flow.
 */

export interface VisualOption {
  name: string;
  imageUrl: string;
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
  { name: 'Buzz Cut', imageUrl: 'https://picsum.photos/seed/buzz/100/100' },
  { name: 'Crew Cut', imageUrl: 'https://picsum.photos/seed/crew/100/100' },
  { name: 'Pompadour', imageUrl: 'https://picsum.photos/seed/pomp/100/100' },
  { name: 'Undercut', imageUrl: 'https://picsum.photos/seed/under/100/100' },
  { name: 'Side Part', imageUrl: 'https://picsum.photos/seed/side/100/100' },
  { name: 'Slicked Back', imageUrl: 'https://picsum.photos/seed/slick/100/100' },
  { name: 'Top Knot', imageUrl: 'https://picsum.photos/seed/top/100/100' },
  { name: 'Man Bun', imageUrl: 'https://picsum.photos/seed/bun/100/100' },
  { name: 'Dreadlocks (Short)', imageUrl: 'https://picsum.photos/seed/dreadshort/100/100' },
  { name: 'Dreadlocks (Long)', imageUrl: 'https://picsum.photos/seed/dreadlong/100/100' },
  { name: 'Afro (Short)', imageUrl: 'https://picsum.photos/seed/afroshort/100/100' },
  { name: 'Afro (Large)', imageUrl: 'https://picsum.photos/seed/afrolarge/100/100' },
  { name: 'Braids', imageUrl: 'https://picsum.photos/seed/braids/100/100' },
  { name: 'Curly Fade', imageUrl: 'https://picsum.photos/seed/curly/100/100' },
  { name: 'Bald', imageUrl: 'https://picsum.photos/seed/bald/100/100' },
];

export const FEMALE_HAIR_STYLES: VisualOption[] = [
  { name: 'Pixie Cut', imageUrl: 'https://picsum.photos/seed/pixie/100/100' },
  { name: 'Bob (Chin Length)', imageUrl: 'https://picsum.photos/seed/bob/100/100' },
  { name: 'Shoulder Length Straight', imageUrl: 'https://picsum.photos/seed/shoulders/100/100' },
  { name: 'Long Straight', imageUrl: 'https://picsum.photos/seed/straight/100/100' },
  { name: 'Long Wavy', imageUrl: 'https://picsum.photos/seed/wavy/100/100' },
  { name: 'Tight Curls', imageUrl: 'https://picsum.photos/seed/tightcurls/100/100' },
  { name: 'Afro', imageUrl: 'https://picsum.photos/seed/afro/100/100' },
  { name: 'High Bun', imageUrl: 'https://picsum.photos/seed/highbun/100/100' },
  { name: 'Ponytail', imageUrl: 'https://picsum.photos/seed/pony/100/100' },
  { name: 'French Braids', imageUrl: 'https://picsum.photos/seed/french/100/100' },
  { name: 'Dreadlocks', imageUrl: 'https://picsum.photos/seed/dreads/100/100' },
  { name: 'Side-swept Bangs', imageUrl: 'https://picsum.photos/seed/bangs/100/100' },
  { name: 'Wolf Cut', imageUrl: 'https://picsum.photos/seed/wolf/100/100' },
  { name: 'Box Braids', imageUrl: 'https://picsum.photos/seed/box/100/100' },
  { name: 'Space Buns', imageUrl: 'https://picsum.photos/seed/space/100/100' },
];

export const FACIAL_HAIR_STYLES: VisualOption[] = [
  { name: 'Clean Shaven', imageUrl: 'https://picsum.photos/seed/shaven/100/100' },
  { name: 'Stubble', imageUrl: 'https://picsum.photos/seed/stubble/100/100' },
  { name: 'Short Beard', imageUrl: 'https://picsum.photos/seed/shortb/100/100' },
  { name: 'Full Beard', imageUrl: 'https://picsum.photos/seed/fullb/100/100' },
  { name: 'Goatee', imageUrl: 'https://picsum.photos/seed/goatee/100/100' },
  { name: 'Mustache', imageUrl: 'https://picsum.photos/seed/mustache/100/100' },
  { name: 'Van Dyke', imageUrl: 'https://picsum.photos/seed/vandyke/100/100' },
  { name: 'Mutton Chops', imageUrl: 'https://picsum.photos/seed/mutton/100/100' },
  { name: 'Anchor Beard', imageUrl: 'https://picsum.photos/seed/anchor/100/100' },
  { name: 'Imperial Mustache', imageUrl: 'https://picsum.photos/seed/imperial/100/100' },
  { name: 'Soul Patch', imageUrl: 'https://picsum.photos/seed/soul/100/100' },
  { name: 'Bandholz', imageUrl: 'https://picsum.photos/seed/bandholz/100/100' },
  { name: 'Viking Beard', imageUrl: 'https://picsum.photos/seed/viking/100/100' },
  { name: 'Handlebar Mustache', imageUrl: 'https://picsum.photos/seed/handlebar/100/100' },
  { name: 'Circular Beard', imageUrl: 'https://picsum.photos/seed/circular/100/100' },
  { name: 'Sideburns', imageUrl: 'https://picsum.photos/seed/sideburns/100/100' },
];

export const GLASSES_STYLES: VisualOption[] = [
  { name: 'None', imageUrl: 'https://picsum.photos/seed/noglasses/100/100' },
  { name: 'Round Glasses', imageUrl: 'https://picsum.photos/seed/roundg/100/100' },
  { name: 'Square Glasses', imageUrl: 'https://picsum.photos/seed/squareg/100/100' },
  { name: 'Aviator Glasses', imageUrl: 'https://picsum.photos/seed/aviatorg/100/100' },
  { name: 'Rectangle Glasses', imageUrl: 'https://picsum.photos/seed/rectg/100/100' },
  { name: 'Cat-Eye Glasses', imageUrl: 'https://picsum.photos/seed/cateye/100/100' },
  { name: 'Wayfarer Glasses', imageUrl: 'https://picsum.photos/seed/wayfarer/100/100' },
  { name: 'Rimless Glasses', imageUrl: 'https://picsum.photos/seed/rimless/100/100' },
  { name: 'Sporty Sunglasses', imageUrl: 'https://picsum.photos/seed/sporty/100/100' },
  { name: 'Circular Wire-rims', imageUrl: 'https://picsum.photos/seed/wire/100/100' },
];

export const AGE_RANGES = [
  'Young Adult',
  'Adult',
  'Middle-Aged',
  'Mature',
];

export const BODY_TYPES = ['Slender', 'Athletic', 'Average', 'Broad'];
export const HEIGHTS = ['Short', 'Medium', 'Tall'];
