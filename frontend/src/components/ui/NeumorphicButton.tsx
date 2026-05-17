// frontend/src/components/ui/NeumorphicButton.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface NeumorphicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const [ripple, setRipple] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, show: true });
    setTimeout(() => setRipple({ ...ripple, show: false }), 500);
  };

  const baseStyle = variant === 'primary'
    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200';

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onMouseDown={handleMouseDown}
      className={`relative overflow-hidden rounded-xl px-6 py-3 font-semibold transition-all duration-300
                  shadow-[6px_6px_12px_#b8bcc1,-6px_-6px_12px_#ffffff] 
                  dark:shadow-[6px_6px_12px_#0f0f11,-6px_-6px_12px_#2d2f33]
                  active:shadow-[inset_4px_4px_8px_#b8bcc1,inset_-4px_-4px_8px_#ffffff]
                  dark:active:shadow-[inset_4px_4px_8px_#0f0f11,inset_-4px_-4px_8px_#2d2f33]
                  ${baseStyle} ${className}`}
      onClick={onClick}
    >
      {children}
      {/* Efeito de Ondulação (Ripple) */}
      {ripple.show && (
        <span
          className="absolute block rounded-full bg-white/30 animate-ping"
          style={{ left: ripple.x, top: ripple.y, width: '10px', height: '10px', transform: 'translate(-50%, -50%)' }}
        />
      )}
    </motion.button>
  );
};

export default NeumorphicButton;