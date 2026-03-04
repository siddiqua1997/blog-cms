'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

/**
 * AnimatedSection Component
 *
 * Intersection Observer-based scroll animation wrapper.
 * Animates children when they enter the viewport.
 */
export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getDelayClass = (delayMs: number) => {
    const normalized = Math.min(1500, Math.max(0, Math.round(delayMs / 100) * 100));
    return `transition-delay-${normalized}`;
  };

  return (
    <div
      ref={ref}
      className={`animated-section animated-section--${direction} ${isVisible ? 'animated-section--visible' : ''} ${getDelayClass(delay)} ${className}`}
    >
      {children}
    </div>
  );
}
