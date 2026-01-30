import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { materialRequests, materialItems } from "../../drizzle/schema";
import { desc, eq, gte, lte, like, and } from "drizzle-orm";

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

      // Buscar solicitações
      const resultado = await db
        .select({
          id: materialRequests.id,
          requestId: materialRequests.requestId,
          lojaId: materialRequests.lojaId,
          lojaLabel: materialRequests.lojaLabel,
          solicitanteNome: materialRequests.solicitanteNome,
          solicitanteTelefone: materialRequests.solicitanteTelefone,
          numeroChamado: materialRequests.numeroChamado,
          tipoEquipe: materialRequests.tipoEquipe,
          tipoServico: materialRequests.tipoServico,
          sistemaAfetado: materialRequests.sistemaAfetado,
          descricaoGeralServico: materialRequests.descricaoGeralServico,
          timestampEnvio: materialRequests.timestampEnvio,
          createdAt: materialRequests.createdAt,
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
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Buscar solicitação
      const solicitacao = await db
        .select()
        .from(materialRequests)
        .where(eq(materialRequests.requestId, input.request_id))
        .limit(1);

      if (solicitacao.length === 0) {
        throw new Error("Solicitação não encontrada");
      }

      // Buscar itens
      const itens = await db
        .select()
        .from(materialItems)
        .where(eq(materialItems.requestId, input.request_id));

      return {
        solicitacao: solicitacao[0],
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
