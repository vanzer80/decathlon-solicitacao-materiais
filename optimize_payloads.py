with open('server/routers/historico.ts', 'r') as f:
    content = f.read()

# Substituir select completo por select otimizado
old_select = '''      // Buscar solicitações
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
        .offset(offset);'''

new_select = '''      // Buscar solicitações (apenas campos necessários para lista)
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
        .offset(offset);'''

content = content.replace(old_select, new_select)

with open('server/routers/historico.ts', 'w') as f:
    f.write(content)

print("OK")
