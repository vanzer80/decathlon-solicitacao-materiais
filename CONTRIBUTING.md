# Guia de Contribuição - Decathlon Solicitação de Materiais

Este documento descreve como contribuir para o projeto e as melhores práticas de desenvolvimento.

---

## 🎯 Antes de Começar

1. **Leia o README.md** - Entenda a arquitetura e funcionalidades
2. **Configure o ambiente** - Siga as instruções de setup
3. **Crie uma branch** - Para cada feature/fix: `git checkout -b feature/sua-feature`
4. **Escreva testes** - Toda nova funcionalidade deve ter testes

---

## 📋 Workflow de Desenvolvimento

### 1. Criar Feature Branch

```bash
# Atualize main
git checkout main
git pull origin main

# Crie branch para sua feature
git checkout -b feature/nova-funcionalidade
# ou para bug fix
git checkout -b fix/nome-do-bug
```

### 2. Desenvolver Localmente

```bash
# Inicie o servidor
pnpm dev

# Em outro terminal, rode testes em watch mode
pnpm test:watch

# Verifique tipos TypeScript
pnpm check
```

### 3. Commit com Mensagens Claras

```bash
# Commits semânticos
git commit -m "feat: adicionar nova funcionalidade X"
git commit -m "fix: corrigir bug em componente Y"
git commit -m "docs: atualizar documentação"
git commit -m "test: adicionar testes para função Z"
git commit -m "refactor: melhorar performance de X"
```

### 4. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nova-funcionalidade

# Abra PR no GitHub com descrição clara
# - O que foi mudado?
# - Por quê?
# - Como testar?
# - Screenshots (se UI)
```

---

## 🏗️ Estrutura de Código

### Convenções de Nomenclatura

```typescript
// Componentes React: PascalCase
export default function MeuComponente() { }

// Funções/variáveis: camelCase
const minhaFuncao = () => { }
const meuValor = 42;

// Constantes: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Tipos: PascalCase com prefixo T ou sufixo Type
type TUsuario = { id: number; nome: string };
type SolicitacaoType = { ... };

// Interfaces: PascalCase com prefixo I
interface IFormData { ... }
```

### Organização de Arquivos

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── MeuComponente.tsx      # Componente reutilizável
│   └── MeuComponente.test.ts  # Testes do componente
├── pages/
│   ├── MinhaPage.tsx          # Página/rota
│   └── MinhaPage.test.ts      # Testes da página
├── hooks/
│   ├── useMeuHook.ts          # Custom hook
│   └── useMeuHook.test.ts     # Testes do hook
└── lib/
    ├── minhaFuncao.ts         # Função utilitária
    └── minhaFuncao.test.ts    # Testes da função
```

---

## 🧪 Escrevendo Testes

### Estrutura de Teste

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { minhaFuncao } from './minhaFuncao';

describe('minhaFuncao', () => {
  let resultado: any;
  
  beforeEach(() => {
    resultado = null;
  });
  
  it('deve fazer algo quando X', () => {
    resultado = minhaFuncao('input');
    expect(resultado).toBe('esperado');
  });
  
  it('deve lançar erro quando Y', () => {
    expect(() => minhaFuncao('inválido')).toThrow();
  });
  
  it('deve retornar array vazio quando Z', () => {
    resultado = minhaFuncao([]);
    expect(resultado).toEqual([]);
  });
});
```

### Checklist de Testes

- [ ] Caso de sucesso principal
- [ ] Casos de erro/exceção
- [ ] Valores limite (vazio, nulo, muito grande)
- [ ] Tipos incorretos (se aplicável)
- [ ] Efeitos colaterais (se aplicável)

### Executar Testes

```bash
# Todos os testes
pnpm test

# Teste específico
pnpm test minhaFuncao.test.ts

# Watch mode
pnpm test:watch

# Com cobertura
pnpm test:coverage
```

---

## 📝 Código Limpo

### Princípios

1. **DRY (Don't Repeat Yourself)** - Evite duplicação
2. **KISS (Keep It Simple, Stupid)** - Código simples é melhor
3. **SOLID** - Aplique princípios SOLID quando possível
4. **Nomes significativos** - Nomes claros e descritivos

### Exemplo: Antes vs Depois

```typescript
// ❌ Ruim
const f = (x: any) => {
  const a = x.map((i: any) => i * 2);
  const b = a.filter((i: any) => i > 10);
  return b.length > 0 ? b : null;
};

// ✅ Bom
const filterDoubledNumbers = (numbers: number[]): number[] | null => {
  const doubled = numbers.map(num => num * 2);
  const filtered = doubled.filter(num => num > 10);
  return filtered.length > 0 ? filtered : null;
};
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] Validar entrada do usuário (frontend + backend)
- [ ] Usar variáveis de ambiente para secrets
- [ ] Nunca commitar `.env.local` ou secrets
- [ ] Usar HTTPS em produção
- [ ] Implementar rate limiting para APIs
- [ ] Escapar output HTML (XSS prevention)
- [ ] Usar parameterized queries (SQL injection prevention)
- [ ] Validar CORS headers
- [ ] Implementar CSRF protection

### Exemplo: Validação

```typescript
// ❌ Inseguro
const handleSubmit = (data: any) => {
  api.post('/submit', data); // Sem validação!
};

// ✅ Seguro
import { z } from 'zod';

const FormSchema = z.object({
  email: z.string().email(),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/),
  quantidade: z.number().positive().int(),
});

const handleSubmit = (data: unknown) => {
  const validado = FormSchema.parse(data); // Valida!
  api.post('/submit', validado);
};
```

---

## 🎨 Estilo de Código

### TypeScript

```typescript
// Sempre use tipos explícitos
const usuario: IUsuario = { id: 1, nome: 'João' };

// Evite `any`
const dados: any = {}; // ❌ Ruim
const dados: Record<string, unknown> = {}; // ✅ Bom

// Use const por padrão
const x = 1; // ✅
let y = 2; // Apenas quando necessário
var z = 3; // ❌ Nunca use var
```

### React

```typescript
// Use functional components
export default function MeuComponente() {
  const [estado, setEstado] = useState(false);
  
  useEffect(() => {
    // Effect logic
  }, [estado]);
  
  return <div>Conteúdo</div>;
}

// Destructure props
interface Props {
  titulo: string;
  onClick: () => void;
}

export default function Botao({ titulo, onClick }: Props) {
  return <button onClick={onClick}>{titulo}</button>;
}

// Use custom hooks para lógica reutilizável
const useFormData = (initialData) => {
  const [data, setData] = useState(initialData);
  // ...
  return { data, setData };
};
```

### CSS/Tailwind

```typescript
// Use classes Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  {/* Conteúdo */}
</div>

// Evite inline styles
<div style={{ color: 'red' }}> {/* ❌ */}
<div className="text-red-500"> {/* ✅ */}

// Use componentes shadcn/ui
import { Button } from '@/components/ui/button';
<Button variant="outline">Clique aqui</Button>
```

---

## 🚀 Performance

### Checklist de Performance

- [ ] Use `React.memo` para componentes puros
- [ ] Implemente lazy loading com `React.lazy`
- [ ] Otimize imagens (compressão, WebP)
- [ ] Use `useMemo` para cálculos pesados
- [ ] Use `useCallback` para funções em props
- [ ] Evite re-renders desnecessários
- [ ] Bundle size: verifique com `npm run build`

### Exemplo: Otimização

```typescript
// ❌ Re-renderiza toda vez
const ListaItem = ({ item, onDelete }) => (
  <div onClick={() => onDelete(item.id)}>
    {item.nome}
  </div>
);

// ✅ Otimizado
const ListaItem = React.memo(
  ({ item, onDelete }: Props) => (
    <div onClick={() => onDelete(item.id)}>
      {item.nome}
    </div>
  ),
  (prev, next) => prev.item.id === next.item.id
);
```

---

## 📚 Documentação

### Comentários de Código

```typescript
// ✅ Bom: Explica o "porquê"
// Usamos debounce para evitar múltiplas requisições enquanto o usuário digita
const handleSearch = debounce((query: string) => {
  api.search(query);
}, 300);

// ❌ Ruim: Óbvio demais
// Incrementa x
x++;

// ✅ Bom: JSDoc para funções públicas
/**
 * Comprime uma imagem para o tamanho máximo especificado
 * @param file - Arquivo de imagem
 * @param maxWidth - Largura máxima em pixels (padrão: 1200)
 * @param maxHeight - Altura máxima em pixels (padrão: 1200)
 * @param quality - Qualidade JPEG (0-1, padrão: 0.8)
 * @returns Objeto com blob comprimido e tamanhos
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<CompressionResult> {
  // ...
}
```

### README de Features

Ao adicionar uma nova feature, atualize o README com:

```markdown
### Nova Feature: [Nome da Feature]

**Descrição:** O que faz

**Uso:**
\`\`\`typescript
// Exemplo de código
\`\`\`

**Configuração:** Variáveis de ambiente necessárias

**Limitações:** O que não faz ou limitações conhecidas
```

---

## 🔄 Code Review

### O que Esperar

1. **Feedback construtivo** - Melhorar o código, não criticar
2. **Sugestões** - "Você considerou usar X em vez de Y?"
3. **Aprovação** - Quando tudo está ok

### Como Revisar

1. Leia o PR description
2. Verifique a lógica
3. Procure por bugs óbvios
4. Verifique testes
5. Valide performance
6. Aprove ou sugira mudanças

---

## 🐛 Reportar Bugs

### Template de Issue

```markdown
## Descrição do Bug
[Descrição clara do problema]

## Passos para Reproduzir
1. [Primeiro passo]
2. [Segundo passo]
3. [...]

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que realmente acontece]

## Screenshots
[Se aplicável]

## Ambiente
- Navegador: [ex: Chrome 120]
- SO: [ex: Windows 11]
- Versão da App: [ex: v1.0.0]

## Logs
[Erros do console, se houver]
```

---

## 💡 Solicitar Features

### Template de Feature Request

```markdown
## Descrição da Feature
[O que você quer adicionar]

## Caso de Uso
[Por que é necessário]

## Benefícios
[Como isso melhora a app]

## Possível Implementação
[Sua ideia de como implementar, se tiver]
```

---

## 📦 Deployment Checklist

Antes de fazer deploy:

- [ ] Todos os testes passam (`pnpm test`)
- [ ] Sem erros TypeScript (`pnpm check`)
- [ ] Build bem-sucedido (`pnpm build`)
- [ ] Sem warnings no console
- [ ] Testado em mobile
- [ ] Testado em diferentes navegadores
- [ ] Performance aceitável
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco de dados feito

---

## 🆘 Precisa de Ajuda?

- **Dúvidas sobre código:** Abra uma Discussion
- **Bugs:** Abra uma Issue
- **Sugestões:** Abra uma Discussion
- **Emergência:** Contate o Tech Lead

---

## 📚 Recursos Úteis

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [tRPC Documentation](https://trpc.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Vitest](https://vitest.dev)

---

**Obrigado por contribuir! 🎉**
