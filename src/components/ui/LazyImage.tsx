// src/components/ui/LazyImage.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderClassName?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export const LazyImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  placeholderClassName, 
  priority = false,
  fallbackSrc = 'https://ui-avatars.com/api/?background=6366f1&color=fff&size=200'
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {!isLoaded && (
        <div className={cn('absolute inset-0 bg-neutral-800 animate-pulse', placeholderClassName)} />
      )}
      {(isInView || priority) && (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  );
};