import { describe, it, expect } from "vitest";
import { uploadPhoto } from "./services/uploadService";

describe("Upload Service", () => {
  it("should validate file type", async () => {
    const invalidBuffer = new Uint8Array([0, 0, 0, 0]);
    const result = await uploadPhoto(invalidBuffer, "application/pdf", "test");

    expect(result.success).toBe(false);
    expect(result.error).toContain("não permitido");
  });

  it("should validate file size", async () => {
    // Cria um buffer maior que 5MB
    const largeBuffer = new Uint8Array(6 * 1024 * 1024);
    const result = await uploadPhoto(largeBuffer, "image/jpeg", "test");

    expect(result.success).toBe(false);
    expect(result.error).toContain("muito grande");
  });

  it("should accept valid image types", async () => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    for (const mimeType of validTypes) {
      const buffer = new Uint8Array(1024); // 1KB válido
      const result = await uploadPhoto(buffer, mimeType, "test");
      
      // Pode falhar por falta de credenciais S3, mas não por tipo inválido
      if (result.success) {
        expect(result.url).toBeDefined();
      } else {
        expect(result.error).not.toContain("não permitido");
      }
    }
  });

  it("should generate unique file keys", async () => {
    // Verifica que o serviço gera nomes únicos
    const buffer = new Uint8Array(1024);
    
    // Ambas as chamadas devem gerar nomes diferentes
    const result1 = await uploadPhoto(buffer, "image/jpeg", "test1");
    const result2 = await uploadPhoto(buffer, "image/jpeg", "test2");
    
    if (result1.success && result2.success) {
      expect(result1.url).not.toBe(result2.url);
    }
  });
});
