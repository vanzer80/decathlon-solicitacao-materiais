import re

with open('client/src/pages/SolicitacaoForm.tsx', 'r') as f:
    content = f.read()

section1_start = content.find('        {/* SEÇÃO 1: DADOS PRINCIPAIS */}')
section1_end = content.find('        </Card>\n\n        {/* SEÇÃO 2')

if section1_start != -1 and section1_end != -1:
    section1_replacement = '''        {/* SEÇÃO 1: DADOS PRINCIPAIS */}
        <MainDataSection
          selectedLoja={selectedLoja}
          searchLoja={searchLoja}
          filteredLojas={filteredLojas}
          isLojaDropdownOpen={isLojaDropdownOpen}
          formData={{
            solicitante_nome: formData.solicitante_nome,
            solicitante_telefone: formData.solicitante_telefone,
            numero_chamado: formData.numero_chamado,
          }}
          onSearchLoja={setSearchLoja}
          onOpenLojaDropdown={() => setIsLojaDropdownOpen(true)}
          onSelectLoja={(loja) => {
            setSelectedLoja(loja);
            setSearchLoja("");
            setIsLojaDropdownOpen(false);
          }}
          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
        />'''
    
    content = content[:section1_start] + section1_replacement + content[section1_end + len('        </Card>'):]

with open('client/src/pages/SolicitacaoForm.tsx', 'w') as f:
    f.write(content)

print("OK")
