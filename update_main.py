with open('client/src/main.tsx', 'r') as f:
    content = f.read()

old_query = 'const queryClient = new QueryClient();'

new_query = '''// Configuração otimizada de cache para React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Manter dados em cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache mesmo após sair da página (5 minutos)
      gcTime: 5 * 60 * 1000,
      // Não refetch automaticamente ao focar na janela
      refetchOnWindowFocus: false,
      // Não refetch ao reconectar
      refetchOnReconnect: false,
      // Retry 2 vezes em caso de erro
      retry: 2,
      // Delay de 1s entre retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry 1 vez em caso de erro
      retry: 1,
      // Delay de 1s entre retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});'''

content = content.replace(old_query, new_query)

with open('client/src/main.tsx', 'w') as f:
    f.write(content)

print("OK")
