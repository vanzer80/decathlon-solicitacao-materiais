import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Historico Router", () => {
  it("should return empty list when no requests exist", async () => {
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.historico.listar({
      pagina: 1,
      limite: 20,
    });

    expect(result).toHaveProperty("dados");
    expect(result).toHaveProperty("paginacao");
    expect(result.dados).toBeInstanceOf(Array);
    expect(result.paginacao).toHaveProperty("total");
    expect(result.paginacao).toHaveProperty("pagina");
    expect(result.paginacao).toHaveProperty("limite");
    expect(result.paginacao).toHaveProperty("totalPaginas");
  });

  it("should count total requests", async () => {
    const caller = appRouter.createCaller({} as any);
    
    const count = await caller.historico.contar();
    
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should validate pagination parameters", async () => {
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.historico.listar({
      pagina: 1,
      limite: 10,
    });

    expect(result.paginacao.pagina).toBe(1);
    expect(result.paginacao.limite).toBe(10);
  });

  it("should handle date filters", async () => {
    const caller = appRouter.createCaller({} as any);
    
    const dataInicio = new Date("2026-01-01");
    const dataFim = new Date("2026-12-31");
    
    const result = await caller.historico.listar({
      pagina: 1,
      limite: 20,
      dataInicio,
      dataFim,
    });

    expect(result).toHaveProperty("dados");
    expect(result.dados).toBeInstanceOf(Array);
  });

  it("should handle loja filter", async () => {
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.historico.listar({
      pagina: 1,
      limite: 20,
      loja_id: 1,
    });

    expect(result).toHaveProperty("dados");
    expect(result.dados).toBeInstanceOf(Array);
  });

  it("should handle request_id search", async () => {
    const caller = appRouter.createCaller({} as any);
    
    const result = await caller.historico.listar({
      pagina: 1,
      limite: 20,
      request_id: "TEST",
    });

    expect(result).toHaveProperty("dados");
    expect(result.dados).toBeInstanceOf(Array);
  });

  it("should support different sort orders", async () => {
    const caller = appRouter.createCaller({} as any);
    
    const resultDesc = await caller.historico.listar({
      pagina: 1,
      limite: 20,
      ordenarPor: "data_desc",
    });

    const resultAsc = await caller.historico.listar({
      pagina: 1,
      limite: 20,
      ordenarPor: "data_asc",
    });

    expect(resultDesc.dados).toBeInstanceOf(Array);
    expect(resultAsc.dados).toBeInstanceOf(Array);
  });
});
