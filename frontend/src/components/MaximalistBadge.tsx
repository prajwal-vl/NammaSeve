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
  const baseClasses = 'inline-flex items-center gap-1.5 font-semibold tracking-normal rounded-full border transition-all select-none';
  
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs sm:text-sm px-3 py-1',
  };

  const variantClasses = {
    saffron: 'bg-saffron-50 text-saffron-900 border-saffron-200',
    green: 'bg-indian-green-50 text-indian-green-900 border-indian-green-200',
    dark: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'bg-white text-dark-text border-gray-200',
    yellow: 'bg-amber-50 text-amber-900 border-amber-200',
  };

  return (
    <span className={clsx(baseClasses, sizeClasses[size], variantClasses[variant], className)}>
      {icon && <span className="inline-block shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
