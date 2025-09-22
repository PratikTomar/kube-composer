import { useEffect, useRef } from 'react';

/**
 * @description useClickOutside custom hook which will detect outside click 
 * @returns elmref ref to the element which will detect outside click
 */

const useClickOutside = (callback: () => void) => {

  const elmref = useRef<HTMLDivElement | null>(null);
  const clickHandler = (e: MouseEvent) => {
    if (e && elmref.current && elmref.current.contains(e.target as HTMLElement)) {
      callback();
    }
  };
  useEffect(() => {
    // Adding the event listener when comp mounts
    document.addEventListener("click", clickHandler);

    // Cleanup the event listener when the component unmounts
    return () => document.removeEventListener("click", clickHandler);
  }, []);

  return elmref;
}

export default useClickOutside;