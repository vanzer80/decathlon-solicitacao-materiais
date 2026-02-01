import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';

// Estender tipo Request para incluir rateLimit
declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: number;
        key: string;
      };
    }
  }
}

/**
 * Middleware de Rate Limiting para proteção contra spam e abuso
 * Implementa diferentes limiters para diferentes endpoints
 */

/**
 * Limiter Global: 100 requisições por 15 minutos por IP
 * Protege contra DDoS e abuso geral
 */
export const globalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições
  message: 'Muitas requisições deste IP, tente novamente mais tarde',
  standardHeaders: true, // Retorna info de rate limit em `RateLimit-*` headers
  legacyHeaders: false, // Desativa `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Não aplicar rate limit a health checks
    return req.path === '/health' || req.path === '/api/health';
  },
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return ip;
  },
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] Global limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

/**
 * Limiter para Solicitações: 10 por minuto
 * Protege contra spam de solicitações de materiais
 * Usa telefone do solicitante como chave quando disponível
 */
export const solicitacaoLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // limite de 10 requisições
  message: 'Limite de solicitações excedido. Tente novamente em 1 minuto.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Preferir telefone do solicitante como chave
    const telefone = (req.body as any)?.solicitante_telefone;
    if (telefone) {
      return `telefone:${telefone}`;
    }
    // Fallback para IP
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `ip:${ip}`;
  },
  handler: (req: Request, res: Response) => {
    const key = (req as any).rateLimit?.key || 'unknown';
    console.warn(`[RateLimit] Solicitacao limit exceeded for: ${key}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Você enviou muitas solicitações. Aguarde um minuto antes de tentar novamente.',
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

/**
 * Limiter para Upload: 5 por 5 minutos
 * Protege contra abuso de upload de fotos
 */
export const uploadLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // limite de 5 uploads
  message: 'Limite de uploads excedido. Tente novamente em 5 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return ip;
  },
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] Upload limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Você enviou muitos uploads. Aguarde 5 minutos antes de tentar novamente.',
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

/**
 * Limiter Estrito para Histórico: 30 por minuto
 * Protege contra scraping de dados
 */
export const historicoLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // limite de 30 requisições
  message: 'Limite de requisições ao histórico excedido.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return ip;
  },
  handler: (req: Request, res: Response) => {
    console.warn(`[RateLimit] Historico limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Limite de requisições ao histórico excedido.',
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

/**
 * Função auxiliar para verificar violações de rate limit
 * Envia alertas ao admin quando limite é atingido
 */
export async function checkRateLimitViolation(
  key: string,
  count: number,
  limit: number,
  type: string
): Promise<void> {
  // Alertar se atingir 80% do limite
  if (count > limit * 0.8) {
    console.warn(`[RateLimit Alert] ${type} limit warning for ${key}: ${count}/${limit}`);
  }

  // Alertar se exceder limite
  if (count > limit) {
    console.error(`[RateLimit Violation] ${type} limit exceeded for ${key}: ${count}/${limit}`);
  }
}

/**
 * Configuração de rate limit para diferentes ambientes
 */
export const rateLimitConfig = {
  development: {
    globalLimiter: false, // Desativar em desenvolvimento
    solicitacaoLimiter: false,
    uploadLimiter: false,
    historicoLimiter: false,
  },
  production: {
    globalLimiter: true,
    solicitacaoLimiter: true,
    uploadLimiter: true,
    historicoLimiter: true,
  },
  test: {
    globalLimiter: false,
    solicitacaoLimiter: false,
    uploadLimiter: false,
    historicoLimiter: false,
  },
};
