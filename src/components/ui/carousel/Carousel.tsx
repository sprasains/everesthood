import React, { useEffect, useRef, useState } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  visible?: number;
  gap?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  visible = 1,
  gap = 12,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
}) => {
  const [index, setIndex] = useState(0);
  const count = children.length;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % count);
      }, autoPlayInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, autoPlayInterval, count]);

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${(index * 100) / visible}%)`, gap: `${gap}px` }}
        >
          {children.map((child, i) => (
            <div key={i} style={{ flex: `0 0 ${100 / visible}%` }}>
              {child}
            </div>
          ))}
        </div>
      </div>

      <button onClick={prev} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow">
        ‹
      </button>
      <button onClick={next} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow">
        ›
      </button>

      {showDots && (
        <div className="flex justify-center mt-3 space-x-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full ${i === index ? 'bg-blue-600' : 'bg-gray-300'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
