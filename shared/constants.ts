// Webhook configuration
export const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby9oLYJI9mJqSDOEi6kQQELU7naTfjpesQIYyfRvS8/exec";
export const WEBHOOK_TOKEN = "DECATHLON-2026";

// Form constants
export const TIPOS_EQUIPE = ["Própria", "Terceirizada"] as const;
export const TIPOS_SERVICO = ["Preventiva", "Corretiva"] as const;
export const SISTEMAS_AFETADOS = ["HVAC", "Elétrica", "Hidráulica", "Civil", "PPCI", "Outros"] as const;
export const UNIDADES = ["un", "cx", "par", "m", "kg", "L", "rolo", "kit", "outro"] as const;
export const URGENCIAS = ["Alta", "Média", "Baixa"] as const;

// Validation
export const MAX_FOTO_SIZE = 5 * 1024 * 1024; // 5MB
export const FOTO_ACCEPT_TYPES = "image/*";

// Decathlon brand colors
export const BRAND_COLOR_PRIMARY = "#0082C3";
export const BRAND_COLOR_DARK = "#003d7a";
export const BRAND_COLOR_LIGHT = "#e8f4fb";
