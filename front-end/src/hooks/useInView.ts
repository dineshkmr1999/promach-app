import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Intersection Observer hook for scroll-triggered animations.
 * Returns a ref to attach to the element and a boolean indicating visibility.
 * 
 * @example
 * const { ref, isInView } = useInView({ triggerOnce: true });
 * <div ref={ref} className={isInView ? 'animate-fade-in-up' : 'opacity-0'}>
 */
export function useInView({
  threshold = 0.1,
  rootMargin = '0px 0px -60px 0px',
  triggerOnce = true,
}: UseInViewOptions = {}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  // Callback ref so the observer is (re-)created whenever the DOM node mounts
  const ref = useRef<HTMLDivElement | null>(null);
  const callbackRef = (el: HTMLDivElement | null) => {
    ref.current = el;
    setNode(el);
  };

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, threshold, rootMargin, triggerOnce]);

  return { ref: callbackRef, isInView };
}

export default useInView;
