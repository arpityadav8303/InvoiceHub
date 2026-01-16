import { useState, useEffect } from 'react';

// Usage: const debouncedSearch = useDebounce(searchTerm, 500);
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 1. Set a timer to update the value after 'delay' milliseconds
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. If the user types again BEFORE the timer finishes, clear it!
    // This is the magic part that prevents 100 API calls while typing.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
