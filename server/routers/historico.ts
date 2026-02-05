import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { materialRequests, materialItems } from "../../drizzle/schema";
import { desc, eq, gte, lte, like, and } from "drizzle-orm";
import { getDataLoader } from "../services/dataLoaderService";

const ListarSolicitacoesSchema = z.object({
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  loja_id: z.number().optional(),
  request_id: z.string().optional(),
  pagina: z.number().int().positive().default(1),
  limite: z.number().int().positive().max(100).default(20),
  ordenarPor: z.enum(["data_desc", "data_asc", "loja"]).default("data_desc"),
});

const DetalheSolicitacaoSchema = z.object({
  request_id: z.string(),
});

export const historicoRouter = router({
  listar: publicProcedure
    .input(ListarSolicitacoesSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const offset = (input.pagina - 1) * input.limite;
      const conditions: any[] = [];

      // Filtro por data
      if (input.dataInicio) {
        conditions.push(gte(materialRequests.createdAt, input.dataInicio));
      }
      if (input.dataFim) {
        const dataFimMeiodia = new Date(input.dataFim);
        dataFimMeiodia.setHours(23, 59, 59, 999);
        conditions.push(lte(materialRequests.createdAt, dataFimMeiodia));
      }

      // Filtro por loja
      if (input.loja_id !== undefined) {
        conditions.push(eq(materialRequests.lojaId, input.loja_id));
      }

      // Filtro por request_id
      if (input.request_id) {
        conditions.push(like(materialRequests.requestId, `%${input.request_id}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Ordenação
      let orderBy;
      switch (input.ordenarPor) {
        case "data_asc":
          orderBy = materialRequests.createdAt;
          break;
        case "loja":
          orderBy = materialRequests.lojaId;
          break;
        case "data_desc":
        default:
          orderBy = desc(materialRequests.createdAt);
          break;
      }

      // Buscar total
      const totalResult = await db
        .select({ count: materialRequests.id })
        .from(materialRequests)
        .where(whereClause);
      const total = totalResult[0]?.count || 0;

      // Buscar solicitações (apenas campos necessários para lista)
      const resultado = await db
        .select({
          requestId: materialRequests.requestId,
          lojaLabel: materialRequests.lojaLabel,
          solicitanteNome: materialRequests.solicitanteNome,
          tipoServico: materialRequests.tipoServico,
          sistemaAfetado: materialRequests.sistemaAfetado,
          timestampEnvio: materialRequests.timestampEnvio,
        })
        .from(materialRequests)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(input.limite)
        .offset(offset);

      return {
        dados: resultado,
        paginacao: {
          total,
          pagina: input.pagina,
          limite: input.limite,
          totalPaginas: Math.ceil(total / input.limite),
        },
      };
    }),

  detalhe: publicProcedure
    .input(DetalheSolicitacaoSchema)
    .query(async ({ input }) => {
      const dataLoader = getDataLoader();

      // Buscar solicitação e itens em paralelo com batching
      const [solicitacao, itens] = await Promise.all([
        dataLoader.loadMaterialRequest(input.request_id),
        dataLoader.loadMaterialItems(input.request_id),
      ]);

      if (!solicitacao) {
        throw new Error("Solicitação não encontrada");
      }

      return {
        solicitacao,
        itens,
      };
    }),

  contar: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const result = await db.select({ count: materialRequests.id }).from(materialRequests);
    return result[0]?.count || 0;
  }),
});
