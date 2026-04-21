import { useEffect, useState } from 'react';

export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const savedValue = window.localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
