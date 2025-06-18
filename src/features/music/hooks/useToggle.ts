import { useState } from 'react';

interface UseToggleReturn {
  isToggled: boolean;
  toggle: () => void;
  setToggle: (value: boolean) => void;
}

export const useToggle = (initialValue: boolean = false): UseToggleReturn => {
  const [isToggled, setIsToggled] = useState(initialValue);

  const toggle = () => {
    setIsToggled(prev => !prev);
  };

  const setToggle = (value: boolean) => {
    setIsToggled(value);
  };

  return {
    isToggled,
    toggle,
    setToggle
  };
};