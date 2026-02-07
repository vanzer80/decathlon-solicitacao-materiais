import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface LoadingAnimationProps {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message?: string;
  errorMessage?: string;
}

export default function LoadingAnimation({
  isLoading,
  isSuccess,
  isError,
  message = 'Enviando solicitação...',
  errorMessage = 'Erro ao enviar solicitação',
}: LoadingAnimationProps) {
  if (!isLoading && !isSuccess && !isError) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg p-8 shadow-2xl max-w-sm mx-4"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            {/* Spinner Animation */}
            <div className="relative w-16 h-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-blue-500"
                style={{ borderTopColor: '#0082C3' }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border-4 border-gray-100 border-r-blue-400"
                style={{ borderRightColor: '#0082C3' }}
              />
            </div>

            {/* Loading Text */}
            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center font-semibold text-gray-700"
            >
              {message}
            </motion.p>

            {/* Progress Dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-blue-500"
                  style={{ backgroundColor: '#0082C3' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && !isLoading && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle2
                size={64}
                className="text-green-500"
                strokeWidth={1.5}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center font-semibold text-gray-700 text-lg"
            >
              Solicitação enviada com sucesso!
            </motion.p>
          </motion.div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AlertCircle
                size={64}
                className="text-red-500"
                strokeWidth={1.5}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center font-semibold text-gray-700 text-lg"
            >
              {errorMessage}
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
