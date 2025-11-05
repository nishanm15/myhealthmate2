import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageOrder = [
  '/dashboard',
  '/workouts',
  '/diet',
  '/sleep',
  '/water',
  '/mood',
  '/habits',
  '/analytics',
  '/profile',
];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const touchMoved = useRef<boolean>(false);
  const [isEnabled, setIsEnabled] = useState(false); // DISABLED BY DEFAULT to prevent random navigation

  useEffect(() => {
    if (!isEnabled) return; // Don't add listeners if disabled

    const handleTouchStart = (e: TouchEvent) => {
      // Reset state
      touchMoved.current = false;
      
      // Ignore touches on ANY interactive elements, bottom nav, or scrollable areas
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-fab]') ||
        target.closest('[data-bottom-nav]') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('a') ||
        target.closest('nav') ||
        target.closest('[data-scroll]') ||
        target.closest('.recharts-surface') || // Ignore charts
        target.closest('svg') // Ignore SVG elements
      ) {
        touchStartX.current = 0;
        touchStartY.current = 0;
        return;
      }
      
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchEndX.current = e.touches[0].clientX; // Initialize to start position
      touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only track move if we have a valid start position
      if (touchStartX.current !== 0) {
        touchMoved.current = true;
        touchEndX.current = e.touches[0].clientX;
        touchEndY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      if (!isEnabled || touchStartX.current === 0 || !touchMoved.current) {
        // Reset and ignore taps/clicks (no movement)
        touchStartX.current = 0;
        touchStartY.current = 0;
        touchEndX.current = 0;
        touchEndY.current = 0;
        touchMoved.current = false;
        return;
      }

      const swipeThreshold = 100; // Minimum horizontal distance
      const verticalThreshold = 50; // Maximum vertical distance
      const horizontalDistance = touchEndX.current - touchStartX.current;
      const verticalDistance = Math.abs(touchEndY.current - touchStartY.current);

      // Only trigger if:
      // 1. Horizontal movement exceeds threshold
      // 2. Vertical movement is minimal (not a scroll)
      // 3. Horizontal movement is significantly more than vertical (actual swipe gesture)
      if (
        Math.abs(horizontalDistance) > swipeThreshold &&
        verticalDistance < verticalThreshold &&
        Math.abs(horizontalDistance) > verticalDistance * 2
      ) {
        const currentIndex = pageOrder.indexOf(location.pathname);
        
        if (currentIndex !== -1) {
          // Swipe right - go to previous page
          if (horizontalDistance > 0 && currentIndex > 0) {
            navigate(pageOrder[currentIndex - 1]);
          }
          // Swipe left - go to next page
          else if (horizontalDistance < 0 && currentIndex < pageOrder.length - 1) {
            navigate(pageOrder[currentIndex + 1]);
          }
        }
      }

      // Always reset after touch end
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchEndX.current = 0;
      touchEndY.current = 0;
      touchMoved.current = false;
    };

    // Only add listeners on mobile devices
    if (window.innerWidth < 1024) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [navigate, location, isEnabled]);

  return { isEnabled, setIsEnabled };
}
