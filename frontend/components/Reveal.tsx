import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in ms
  direction?: 'up' | 'down' | 'left' | 'right';
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  className = "", 
  delay = 0,
  direction = 'up' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransformClass = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up': return 'translate-y-12 opacity-0';
        case 'down': return '-translate-y-12 opacity-0';
        case 'left': return 'translate-x-12 opacity-0';
        case 'right': return '-translate-x-12 opacity-0';
        default: return 'translate-y-12 opacity-0';
      }
    }
    return 'translate-y-0 translate-x-0 opacity-100';
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform will-change-transform ${getTransformClass()} ${className}`}
    >
      {children}
    </div>
  );
};

export default Reveal;