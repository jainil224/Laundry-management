import { ClothingCategory, WardrobeItem, LaundryBatch, ActivityLogItem } from '../types';

export const SEED_CATEGORIES: ClothingCategory[] = [
  {
    id: 'shirt',
    name: 'Shirt',
    icon: 'Shirt',
    careNote: 'Wash cold (30°C), hanger dry, medium iron',
    tempWashType: 'Gentle Cycle'
  },
  {
    id: 'tshirt',
    name: 'T-Shirt',
    icon: 'Shirt',
    careNote: 'Machine wash warm, do not bleach, tumble dry low',
    tempWashType: 'Normal Wash'
  },
  {
    id: 'pant',
    name: 'Pant',
    icon: 'Columns3',
    careNote: 'Wash inside out, warm water, line dry in shade',
    tempWashType: 'Normal Wash'
  },
  {
    id: 'jeans',
    name: 'Jeans',
    icon: 'Layers',
    careNote: 'Heavy wash cold, line dry, do not dry clean',
    tempWashType: 'Heavy Duty'
  },
  {
    id: 'kurta',
    name: 'Kurta',
    icon: 'Sparkles',
    careNote: 'Hand wash or gentle cycle cold, low heat iron',
    tempWashType: 'Delicate Wash'
  },
  {
    id: 'shorts',
    name: 'Shorts',
    icon: 'Scissors',
    careNote: 'Standard warm wash, tumble dry low',
    tempWashType: 'Normal Wash'
  },
  {
    id: 'towel',
    name: 'Towel',
    icon: 'Bookmark',
    careNote: 'Hot wash (60°C), no fabric softeners, high tumble dry',
    tempWashType: 'Sanitize Wash'
  },
  {
    id: 'bedsheet',
    name: 'Bedsheet',
    icon: 'Maximize',
    careNote: 'Hot wash with detergent, line dry, fold immediately',
    tempWashType: 'Heavy Duty'
  },
  {
    id: 'jacket',
    name: 'Jacket',
    icon: 'Shield',
    careNote: 'Dry clean only or cold gentle wipe',
    tempWashType: 'Dry Clean'
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    icon: 'Flame',
    careNote: 'Wash inside out, tumble dry low heat',
    tempWashType: 'Normal Wash'
  },
  {
    id: 'innerwear',
    name: 'Innerwear',
    icon: 'Heart',
    careNote: 'Warm wash with disinfectant, tumble dry medium',
    tempWashType: 'Sanitize Wash'
  },
  {
    id: 'socks',
    name: 'Socks',
    icon: 'Footprints',
    careNote: 'Wash in laundry bag, tumble dry high',
    tempWashType: 'Normal Wash'
  }
];

// Default items set to empty arrays so new users start at 0
export const DEFAULT_WARDROBE_ITEMS: WardrobeItem[] = [];
export const DEFAULT_BATCHES: LaundryBatch[] = [];
export const DEFAULT_ACTIVITY_LOGS: ActivityLogItem[] = [];
