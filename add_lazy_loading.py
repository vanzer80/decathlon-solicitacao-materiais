with open('client/src/pages/SolicitacaoForm.tsx', 'r') as f:
    content = f.read()

# Encontrar imports dos componentes
old_imports = '''import { MainDataSection } from "@/components/MainDataSection";
import { TeamServiceSection } from "@/components/TeamServiceSection";
import { MaterialsSection } from "@/components/MaterialsSection";'''

new_imports = '''import { lazy, Suspense } from "react";

const MainDataSection = lazy(() => import("@/components/MainDataSection").then(m => ({ default: m.MainDataSection })));
const TeamServiceSection = lazy(() => import("@/components/TeamServiceSection").then(m => ({ default: m.TeamServiceSection })));
const MaterialsSection = lazy(() => import("@/components/MaterialsSection").then(m => ({ default: m.MaterialsSection })));

// Loading fallback para seções
const SectionSkeleton = () => (
  <div className="mb-6 border border-slate-200 rounded-lg p-6 bg-slate-50 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-200 rounded"></div>
      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
    </div>
  </div>
);'''

content = content.replace(old_imports, new_imports)

# Envolver componentes com Suspense
section1_old = '''        {/* SEÇÃO 1: DADOS PRINCIPAIS */}
        <MainDataSection'''

section1_new = '''        {/* SEÇÃO 1: DADOS PRINCIPAIS */}
        <Suspense fallback={<SectionSkeleton />}>
          <MainDataSection'''

content = content.replace(section1_old, section1_new)

# Fechar Suspense para seção 1
section1_close = '''          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
        />

        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}'''

section1_close_new = '''          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />
        </Suspense>

        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}'''

content = content.replace(section1_close, section1_close_new)

# Envolver seção 2
section2_old = '''        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}
        <TeamServiceSection'''

section2_new = '''        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}
        <Suspense fallback={<SectionSkeleton />}>
          <TeamServiceSection'''

content = content.replace(section2_old, section2_new)

# Fechar Suspense para seção 2
section2_close = '''          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
        />

        {/* SEÇÃO 3: MATERIAIS */}'''

section2_close_new = '''          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />
        </Suspense>

        {/* SEÇÃO 3: MATERIAIS */}'''

content = content.replace(section2_close, section2_close_new)

# Envolver seção 3
section3_old = '''        {/* SEÇÃO 3: MATERIAIS */}
        <MaterialsSection'''

section3_new = '''        {/* SEÇÃO 3: MATERIAIS */}
        <Suspense fallback={<SectionSkeleton />}>
          <MaterialsSection'''

content = content.replace(section3_old, section3_new)

# Fechar Suspense para seção 3
section3_close = '''          onRemovePhoto={handleRemovePhoto}
        />
        {/* BOTÃO STICKY BOTTOM */}'''

section3_close_new = '''          onRemovePhoto={handleRemovePhoto}
          />
        </Suspense>

        {/* BOTÃO STICKY BOTTOM */}'''

content = content.replace(section3_close, section3_close_new)

with open('client/src/pages/SolicitacaoForm.tsx', 'w') as f:
    f.write(content)

print("OK")
