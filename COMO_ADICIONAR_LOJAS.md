# 📍 Como Adicionar Mais Lojas/Clusters ao Sistema

**Versão:** 1.0  
**Data:** 28 de Fevereiro de 2026  
**Status:** ✅ Pronto para uso

---

## 🎯 Visão Geral

Existem **2 formas** para adicionar mais lojas/clusters:

| Método | Dificuldade | Tempo | Melhor Para |
|--------|-----------|-------|-----------|
| **Método 1: Excel/JSON** | ⭐ Fácil | 5 min | Adicionar lojas rapidamente |
| **Método 2: Painel Admin** | ⭐⭐⭐ Médio | 15 min | Gerenciar lojas em tempo real |

---

## ✅ Método 1: Adicionar via Excel/JSON (Recomendado para Rápido)

### Passo 1: Editar a Planilha Excel

**Arquivo:** `SolicitaçõesdeMateriais.xlsx` (na pasta raiz do projeto)

1. Abra o arquivo Excel
2. Vá para a aba **"Lojas"**
3. Adicione uma nova linha com:
   - **Loja_ID:** Número único (ex: 53, 54, 55...)
   - **Loja_Label:** Nome da loja (ex: "Loja Brasília", "Loja Salvador")

**Exemplo:**
```
Loja_ID | Loja_Label
--------|------------------
52      | Loja Curitiba
53      | Loja Brasília      ← Nova loja
54      | Loja Salvador      ← Nova loja
```

### Passo 2: Converter Excel para JSON

Execute o script Python para converter:

```bash
cd /home/ubuntu/decathlon-solicitacao-materiais
python3 << 'EOF'
import openpyxl
import json

# Carregar planilha
wb = openpyxl.load_workbook('SolicitaçõesdeMateriais.xlsx')
ws = wb['Lojas']

# Extrair dados
lojas = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0] is not None:  # Se Loja_ID não for vazio
        lojas.append({
            'id': str(row[0]),
            'label': row[1]
        })

# Salvar em JSON
with open('client/public/lojas.json', 'w', encoding='utf-8') as f:
    json.dump(lojas, f, ensure_ascii=False, indent=2)

print(f"✅ {len(lojas)} lojas carregadas em lojas.json")
EOF
```

### Passo 3: Reiniciar o Servidor

```bash
cd /home/ubuntu/decathlon-solicitacao-materiais
pnpm dev
```

### Passo 4: Testar

1. Abra o formulário no navegador
2. Clique no dropdown de lojas
3. Verifique se as novas lojas aparecem

---

## 🔧 Método 2: Painel Admin (Recomendado para Gerenciamento)

### Visão Geral

Criar um **painel admin protegido** onde você pode:
- ✅ Adicionar novas lojas
- ✅ Editar lojas existentes
- ✅ Deletar lojas
- ✅ Exportar lista de lojas

### Arquitetura

```
Frontend (React)
    ↓
Painel Admin (Protegido)
    ↓
tRPC Procedure (lojas.list, lojas.create, lojas.update, lojas.delete)
    ↓
Banco de Dados (Tabela: lojas)
    ↓
JSON em tempo real
```

### Passo 1: Criar Tabela de Lojas no Banco

**Arquivo:** `drizzle/schema.ts`

```typescript
import { int, varchar, mysqlTable, timestamp } from "drizzle-orm/mysql-core";

export const lojas = mysqlTable("lojas", {
  id: int("id").autoincrement().primaryKey(),
  lojaId: varchar("loja_id", { length: 10 }).notNull().unique(),
  lojaLabel: varchar("loja_label", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Loja = typeof lojas.$inferSelect;
export type InsertLoja = typeof lojas.$inferInsert;
```

### Passo 2: Executar Migração

```bash
cd /home/ubuntu/decathlon-solicitacao-materiais
pnpm db:push
```

### Passo 3: Criar Helpers de Banco

**Arquivo:** `server/db.ts` (adicionar ao final)

```typescript
import { eq } from "drizzle-orm";
import { lojas, Loja, InsertLoja } from "../drizzle/schema";

export async function getAllLojas(): Promise<Loja[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(lojas).orderBy(lojas.lojaId);
}

export async function createLoja(data: InsertLoja): Promise<Loja> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(lojas).values(data);
  const created = await db.select().from(lojas).where(eq(lojas.id, result[0])).limit(1);
  return created[0];
}

export async function updateLoja(id: number, data: Partial<InsertLoja>): Promise<Loja> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(lojas).set(data).where(eq(lojas.id, id));
  const updated = await db.select().from(lojas).where(eq(lojas.id, id)).limit(1);
  return updated[0];
}

export async function deleteLoja(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(lojas).where(eq(lojas.id, id));
}
```

### Passo 4: Criar Procedures tRPC

**Arquivo:** `server/routers.ts` (adicionar ao appRouter)

```typescript
lojas: router({
  list: publicProcedure.query(async () => {
    const lojas = await getAllLojas();
    return lojas.map(l => ({ id: l.lojaId, label: l.lojaLabel }));
  }),
  
  create: protectedProcedure
    .input(z.object({
      lojaId: z.string(),
      lojaLabel: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode criar
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      const loja = await createLoja({
        lojaId: input.lojaId,
        lojaLabel: input.lojaLabel,
      });
      
      return { id: loja.lojaId, label: loja.lojaLabel };
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      lojaLabel: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      const loja = await updateLoja(input.id, {
        lojaLabel: input.lojaLabel,
      });
      
      return { id: loja.lojaId, label: loja.lojaLabel };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      await deleteLoja(input.id);
      return { success: true };
    }),
}),
```

### Passo 5: Criar Componente Admin

**Arquivo:** `client/src/pages/AdminLojas.tsx` (novo)

```typescript
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminLojas() {
  const [novaLojaId, setNovaLojaId] = useState("");
  const [novaLojaLabel, setNovaLojaLabel] = useState("");
  
  const { data: lojas, refetch } = trpc.lojas.list.useQuery();
  const createMutation = trpc.lojas.create.useMutation();
  const deleteMutation = trpc.lojas.delete.useMutation();
  
  const handleCreate = async () => {
    if (!novaLojaId || !novaLojaLabel) {
      toast.error("Preencha ID e nome da loja");
      return;
    }
    
    try {
      await createMutation.mutateAsync({
        lojaId: novaLojaId,
        lojaLabel: novaLojaLabel,
      });
      
      setNovaLojaId("");
      setNovaLojaLabel("");
      refetch();
      toast.success("Loja adicionada com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar loja");
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      toast.success("Loja removida com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover loja");
    }
  };
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Lojas</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Adicionar Nova Loja</h2>
        <div className="space-y-3">
          <Input
            placeholder="ID da Loja (ex: 53)"
            value={novaLojaId}
            onChange={(e) => setNovaLojaId(e.target.value)}
          />
          <Input
            placeholder="Nome da Loja (ex: Loja Brasília)"
            value={novaLojaLabel}
            onChange={(e) => setNovaLojaLabel(e.target.value)}
          />
          <Button onClick={handleCreate} className="w-full">
            Adicionar Loja
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Lojas Existentes</h2>
        <div className="space-y-2">
          {lojas?.map((loja: any) => (
            <div key={loja.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-semibold">{loja.label}</p>
                <p className="text-sm text-gray-500">ID: {loja.id}</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDelete(loja.id)}
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Passo 6: Adicionar Rota

**Arquivo:** `client/src/App.tsx`

```typescript
import AdminLojas from "@/pages/AdminLojas";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/solicitacao"} component={SolicitacaoForm} />
      <Route path={"/admin/lojas"} component={AdminLojas} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

---

## 📊 Comparação dos Métodos

| Aspecto | Método 1 (Excel) | Método 2 (Admin) |
|---------|-----------------|-----------------|
| **Tempo de setup** | 5 min | 30 min |
| **Facilidade** | Muito fácil | Médio |
| **Requer código** | Não | Sim |
| **Gerenciamento em tempo real** | Não | Sim |
| **Controle de acesso** | Não | Sim (admin only) |
| **Histórico de mudanças** | Não | Sim (banco de dados) |
| **Escalabilidade** | Limitada | Ilimitada |

---

## 🚀 Recomendação

**Para começar agora:** Use **Método 1 (Excel)** - é rápido e não requer mudanças de código.

**Para produção:** Implemente **Método 2 (Admin)** - oferece controle total e gerenciamento em tempo real.

---

## ❓ Perguntas Frequentes

### P: Posso ter lojas com o mesmo ID?
**R:** Não. O `Loja_ID` deve ser único. O sistema vai rejeitar duplicatas.

### P: Quantas lojas posso adicionar?
**R:** Ilimitadas. O sistema foi projetado para escalar.

### P: Como faço backup das lojas?
**R:** Se usar Método 1, o Excel é seu backup. Se usar Método 2, o banco de dados faz backup automático.

### P: Posso deletar uma loja?
**R:** Sim, mas com cuidado. Solicitações antigas ainda terão referência à loja deletada.

### P: Como sincronizar lojas entre Excel e Banco?
**R:** Execute o script de importação que converte Excel → JSON → Banco.

---

## 📞 Suporte

Se tiver dúvidas:

1. Verifique se o `Loja_ID` é único
2. Verifique se o `Loja_Label` não está vazio
3. Reinicie o servidor após adicionar lojas
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

---

**Fim do Guia**
