with open('client/src/pages/SolicitacaoForm.tsx', 'r') as f:
    content = f.read()

# Adicionar import do DiagnosticModal
old_imports = '''import { lazy, Suspense } from "react";'''
new_imports = '''import { lazy, Suspense } from "react";
import { DiagnosticModal } from "@/components/DiagnosticModal";'''

content = content.replace(old_imports, new_imports)

# Substituir modal inline
old_modal = '''      {/* MODAL DIAGNÓSTICO */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Diagnosticar Webhook</h3>
            {diagnosticResult ? (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto text-sm">
                <div>
                  <p className="font-medium text-slate-700">URL:</p>
                  <p className="text-slate-600 break-all">{diagnosticResult.url}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Status:</p>
                  <p className={diagnosticResult.status === 200 ? "text-green-600" : "text-red-600"}>
                    {diagnosticResult.status}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Content-Type:</p>
                  <p className="text-slate-600">{diagnosticResult.contentType}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Snippet:</p>
                  <p className="text-slate-600 bg-slate-100 p-2 rounded font-mono text-xs">
                    {diagnosticResult.bodySnippet}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 mb-4">Clique em "Diagnosticar" para testar a conexão com o webhook.</p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {}}
                disabled={isDiagnosing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isDiagnosing ? "Diagnosticando..." : "Diagnosticar"}
              </Button>
              <Button
                onClick={() => setShowDiagnosticModal(false)}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}'''

new_modal = '''      {/* MODAL DIAGNÓSTICO */}
      <DiagnosticModal
        isOpen={showDiagnosticModal}
        isDiagnosing={isDiagnosing}
        diagnosticResult={diagnosticResult}
        onDiagnose={() => {}}
        onClose={() => setShowDiagnosticModal(false)}
      />'''

content = content.replace(old_modal, new_modal)

with open('client/src/pages/SolicitacaoForm.tsx', 'w') as f:
    f.write(content)

print("OK")
