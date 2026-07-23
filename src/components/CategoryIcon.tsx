import React from 'react';
import { 
  Shirt, 
  Columns3, 
  Layers, 
  Sparkles, 
  Scissors, 
  Bookmark, 
  Maximize, 
  Shield, 
  Footprints, 
  Flame, 
  Tag, 
  LucideProps 
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-5 h-5", ...props }) => {
  const iconKey = name.toLowerCase().trim();

  switch (iconKey) {
    case 'shirt':
    case 'tshirt':
    case 't-shirt':
      return <Shirt className={className} {...props} />;
    case 'pant':
    case 'pants':
    case 'trouser':
    case 'columns3':
      return <Columns3 className={className} {...props} />;
    case 'jeans':
    case 'layers':
      return <Layers className={className} {...props} />;
    case 'kurta':
    case 'sparkles':
      return <Sparkles className={className} {...props} />;
    case 'shorts':
    case 'scissors':
      return <Scissors className={className} {...props} />;
    case 'towel':
    case 'bookmark':
      return <Bookmark className={className} {...props} />;
    case 'bedsheet':
    case 'maximize':
      return <Maximize className={className} {...props} />;
    case 'innerwear':
    case 'shield':
      return <Shield className={className} {...props} />;
    case 'socks':
    case 'footprints':
      return <Footprints className={className} {...props} />;
    case 'hoodie':
    case 'flame':
      return <Flame className={className} {...props} />;
    case 'jacket':
      return <Shirt className={className} {...props} />;
    default:
      return <Tag className={className} {...props} />;
  }
};
