// frontend/src/components/ui/AuroraText.tsx
import React from 'react';

interface AuroraTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}

const AuroraText: React.FC<AuroraTextProps> = ({ children, as: Tag = 'h1', className = '' }) => {
  return (
    <Tag
      className={`bg-gradient-to-r from-primary-400 via-secondary-500 to-purple-500 
                  bg-clip-text text-transparent animate-aurora font-bold ${className}`}
    >
      {children}
    </Tag>
  );
};

export default AuroraText;