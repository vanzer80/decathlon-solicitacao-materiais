import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import "@testing-library/jest-dom";
import SolicitacaoForm from "../SolicitacaoForm";

// Mock dos sub-componentes
vi.mock("@/components/MainDataSection", () => ({
  MainDataSection: () => <div data-testid="main-data-section">Main Data Section</div>,
}));

vi.mock("@/components/TeamServiceSection", () => ({
  TeamServiceSection: () => <div data-testid="team-service-section">Team Service Section</div>,
}));

vi.mock("@/components/MaterialsSection", () => ({
  MaterialsSection: () => <div data-testid="materials-section">Materials Section</div>,
}));

vi.mock("@/components/DiagnosticModal", () => ({
  DiagnosticModal: () => <div data-testid="diagnostic-modal">Diagnostic Modal</div>,
}));

// Mock do fetch para lojas
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as any;

describe("SolicitacaoForm - Lazy Loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar com Suspense boundaries", async () => {
    render(<SolicitacaoForm />);

    // Verificar que o header está presente
    expect(screen.getByText("Solicitação de Materiais")).toBeDefined();

    // Aguardar que os componentes lazy carregarem
    await waitFor(() => {
      expect(screen.getByTestId("main-data-section")).toBeDefined();
    });
  });

  it("deve renderizar todos os 3 sub-componentes", async () => {
    render(<SolicitacaoForm />);

    await waitFor(() => {
      expect(screen.getByTestId("main-data-section")).toBeDefined();
      expect(screen.getByTestId("team-service-section")).toBeDefined();
      expect(screen.getByTestId("materials-section")).toBeDefined();
    });
  });

  it("deve renderizar botão de envio", async () => {
    render(<SolicitacaoForm />);

    await waitFor(() => {
      const submitButton = screen.getByText("Enviar Solicitação");
      expect(submitButton).toBeDefined();
    });
  });

  it("deve renderizar DiagnosticModal", async () => {
    render(<SolicitacaoForm />);

    await waitFor(() => {
      expect(screen.getByTestId("diagnostic-modal")).toBeDefined();
    });
  });
});
