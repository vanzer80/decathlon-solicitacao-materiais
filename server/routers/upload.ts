import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { uploadPhoto } from "../services/uploadService";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const uploadRouter = router({
  uploadPhoto: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.instanceof(Buffer),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Validar tipo
      if (!ALLOWED_TYPES.includes(input.mimeType)) {
        throw new Error(
          `Tipo de arquivo não permitido. Aceitos: ${ALLOWED_TYPES.join(", ")}`
        );
      }

      // Validar tamanho
      if (input.fileData.length > MAX_FILE_SIZE) {
        throw new Error(
          `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
      }

      // Fazer upload
      const result = await uploadPhoto(
        input.fileData,
        input.mimeType,
        input.fileName
      );

      if (!result.success) {
        throw new Error(result.error || "Erro ao fazer upload");
      }

      return {
        success: true,
        url: result.url,
      };
    }),
});
