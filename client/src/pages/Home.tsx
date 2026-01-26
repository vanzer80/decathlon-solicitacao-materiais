import { useLocation } from 'wouter';
import { useEffect } from 'react';

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirecionar para o formulário de solicitação
    setLocation('/solicitacao');
  }, [setLocation]);

  return null;
}
