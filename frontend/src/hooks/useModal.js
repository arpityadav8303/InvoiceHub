import { useState, useCallback } from 'react';

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null); // Stores temporary data (like an ID to delete)

  // Open the modal and optionally pass data to it
  const open = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  // Close the modal and clear the data
  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  // Toggle state (useful for simple menus)
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    data // The component using this hook can access this data
  };
}
