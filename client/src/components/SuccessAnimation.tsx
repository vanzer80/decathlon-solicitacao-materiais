import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SuccessAnimationProps {
  show: boolean;
  requestId?: string;
}

// Confetti particle
interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

function generateConfetti(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1,
  }));
}

export function SuccessAnimation({ show, requestId }: SuccessAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      setParticles(generateConfetti(30));
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
      {/* Confetti */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-blue-500 rounded-full animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: "-10px",
            animation: `fall ${particle.duration}s linear ${particle.delay}s forwards`,
            opacity: Math.random() > 0.5 ? 0.8 : 0.6,
          }}
        />
      ))}

      {/* Checkmark animado */}
      <div className="animate-in zoom-in duration-500 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-20" />
          <CheckCircle2 className="h-24 w-24 text-green-600 animate-bounce" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-700">Sucesso!</h2>
          {requestId && (
            <p className="text-sm text-slate-600 mt-2">
              Solicitação #{requestId}
            </p>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
