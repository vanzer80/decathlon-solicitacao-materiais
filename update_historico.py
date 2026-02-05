with open('server/routers/historico.ts', 'r') as f:
    content = f.read()

# Adicionar import
old_import = '''import { desc, eq, gte, lte, like, and } from "drizzle-orm";'''
new_import = '''import { desc, eq, gte, lte, like, and } from "drizzle-orm";
import { getDataLoader } from "../services/dataLoaderService";'''

content = content.replace(old_import, new_import)

# Substituir detalhe query
old_detalhe = '''  detalhe: publicProcedure
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
    }),'''

new_detalhe = '''  detalhe: publicProcedure
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
    }),'''

content = content.replace(old_detalhe, new_detalhe)

with open('server/routers/historico.ts', 'w') as f:
    f.write(content)

print("OK")
