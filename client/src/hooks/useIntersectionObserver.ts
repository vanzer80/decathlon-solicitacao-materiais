import { useEffect, useRef, useState } from 'react';

/**
 * Hook para detectar quando um elemento entra na viewport
 * Útil para lazy loading de imagens e conteúdo
 * 
 * @param options - Opções do IntersectionObserver
 * @returns Ref para o elemento e boolean indicando se está visível
 * 
 * @example
 * const { ref, isVisible } = useIntersectionObserver<HTMLImageElement>();
 * return <img ref={ref} src={isVisible ? imageUrl : placeholder} />;
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Parar de observar após elemento ficar visível (otimização)
        observer.unobserve(entry.target);
      }
    }, { 
      threshold: 0.1, // Ativar quando 10% do elemento está visível
      ...options 
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isVisible };
}
