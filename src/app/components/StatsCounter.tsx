'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 2500, suffix: '+', label: 'Vehicles Tuned' },
  { value: 15000, suffix: '+', label: 'Horsepower Added' },
  { value: 98, suffix: '%', label: 'Customer Satisfaction' },
  { value: 12, suffix: '', label: 'Years Experience' },
];

interface StatsCounterProps {
  variant?: 'dark' | 'light';
}

/**
 * StatsCounter Component
 *
 * Animated counter display with scroll-triggered animation.
 * Numbers count up when entering the viewport.
 */
export default function StatsCounter({ variant = 'dark' }: StatsCounterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
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

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);

    let frame = 0;
    const countInterval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out

      setCounts(
        stats.map((stat) => Math.round(stat.value * easeOutProgress))
      );

      if (frame === totalFrames) {
        clearInterval(countInterval);
      }
    }, frameDuration);

    return () => clearInterval(countInterval);
  }, [isVisible]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={variant === 'light' ? 'stat-card-light' : 'stat-card'}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)`,
            transitionDelay: `${index * 100}ms`,
          }}
        >
          <div className="stat-value">
            {formatNumber(counts[index])}{stat.suffix}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
