import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`
      bg-white rounded-xl shadow-lg p-6 transition-all duration-300
      ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}