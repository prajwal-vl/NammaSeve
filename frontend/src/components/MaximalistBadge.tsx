import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant?: 'saffron' | 'green' | 'dark' | 'outline' | 'yellow';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const MaximalistBadge: React.FC<BadgeProps> = ({
  variant = 'saffron',
  size = 'md',
  children,
  icon,
  className,
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-neo border-2 border-dark-text transition-transform';
  
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 shadow-[2px_2px_0px_#20241F]',
    md: 'text-xs md:text-sm px-3.5 py-1 shadow-[3px_3px_0px_#20241F]',
  };

  const variantClasses = {
    saffron: 'bg-saffron text-white',
    green: 'bg-indian-green text-white',
    dark: 'bg-dark-text text-white',
    outline: 'bg-warm-white text-dark-text',
    yellow: 'bg-[#FFDE59] text-dark-text',
  };

  return (
    <span className={clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)}>
      {icon && <span className="inline-block shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
