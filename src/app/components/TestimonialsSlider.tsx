'use client';

import { useState, useEffect, useCallback } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Marcus Chen',
    vehicle: 'BMW M4 Competition',
    image: null,
    rating: 5,
    text: 'Absolutely phenomenal results. My M4 went from 503hp to 587hp with their Stage 2 tune. The power delivery is smooth, and the car feels completely transformed. The team at Toxic Tuning really knows their craft.',
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    vehicle: 'Audi RS3 Sportback',
    image: null,
    rating: 5,
    text: 'I was hesitant at first, but the dyno results speak for themselves. 120+ HP gain while maintaining reliability. They took the time to explain everything and the customer service was exceptional.',
  },
  {
    id: 3,
    name: 'David Rodriguez',
    vehicle: 'Mercedes-AMG C63 S',
    image: null,
    rating: 5,
    text: 'Third car I have brought to Toxic Tuning and they never disappoint. The Stage 1 tune on my C63 gave me exactly what I was looking for - more power, better throttle response, and improved fuel economy on highway cruises.',
  },
  {
    id: 4,
    name: 'James Thompson',
    vehicle: 'Porsche 911 Turbo S',
    image: null,
    rating: 5,
    text: 'These guys are the real deal. My 992 Turbo S is putting down over 750hp to the wheels with their E85 flex fuel tune. The attention to detail and professionalism is unmatched in the industry.',
  },
  {
    id: 5,
    name: 'Michelle Park',
    vehicle: 'Volkswagen Golf R',
    image: null,
    rating: 5,
    text: 'Best tuner in the area, hands down. My Golf R is now faster than most sports cars on the road. The DSG tune they did makes the car feel like a completely different vehicle. Highly recommend!',
  },
];

/**
 * TestimonialsSlider Component
 *
 * Auto-scrolling testimonial carousel with manual navigation.
 * Premium glassmorphism design with smooth transitions.
 */
export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Testimonial Card */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-full flex-shrink-0 px-4"
            >
              <div className="glass-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? 'text-red-primary'
                          : 'text-grey-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-pure-white leading-relaxed mb-8">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-grey-700 to-grey-800 flex items-center justify-center">
                    <span className="text-xl font-semibold text-pure-white">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-pure-white">
                      {testimonial.name}
                    </p>
                    <p className="text-grey-400 text-sm">
                      {testimonial.vehicle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-grey-700 flex items-center justify-center text-grey-400 hover:border-red-primary hover:text-red-primary transition-all duration-300"
          aria-label="Previous testimonial"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-red-primary'
                  : 'bg-grey-600 hover:bg-grey-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-grey-700 flex items-center justify-center text-grey-400 hover:border-red-primary hover:text-red-primary transition-all duration-300"
          aria-label="Next testimonial"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
