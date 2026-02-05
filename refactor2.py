with open('client/src/pages/SolicitacaoForm.tsx', 'r') as f:
    content = f.read()

# Seção 2
section2_start = content.find('        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}')
section2_end = content.find('        </Card>\n\n        {/* SEÇÃO 3: MATERIAIS */}')

if section2_start != -1 and section2_end != -1:
    section2_replacement = '''        {/* SEÇÃO 2: EQUIPE E SERVIÇO */}
        <TeamServiceSection
          formData={{
            tipo_equipe: formData.tipo_equipe,
            empresa_terceira: formData.empresa_terceira,
            tipo_servico: formData.tipo_servico,
            sistema_afetado: formData.sistema_afetado,
            descricao_geral_servico: formData.descricao_geral_servico,
          }}
          onFormChange={(field, value) => setFormData({ ...formData, [field]: value })}
        />'''
    
    content = content[:section2_start] + section2_replacement + content[section2_end + len('        </Card>'):]

# Seção 3
section3_start = content.find('        {/* SEÇÃO 3: MATERIAIS */}')
section3_end = content.find('        </Card>\n\n        {/* BOTÃO STICKY BOTTOM */}')

if section3_start != -1 and section3_end != -1:
    section3_replacement = '''        {/* SEÇÃO 3: MATERIAIS */}
        <MaterialsSection
          materials={materials}
          onMaterialChange={(materialId, field, value) => {
            setMaterials((prev) =>
              prev.map((m) =>
                m.id === materialId ? { ...m, [field]: value } : m
              )
            );
          }}
          onAddMaterial={addMaterial}
          onRemoveMaterial={removeMaterial}
          onFileSelect={(materialId, fotoSlot, file) => {
            if (file) handleFileSelect(materialId, fotoSlot, file);
          }}
          onRemovePhoto={handleRemovePhoto}
        />'''
    
    content = content[:section3_start] + section3_replacement + content[section3_end + len('        </Card>'):]

with open('client/src/pages/SolicitacaoForm.tsx', 'w') as f:
    f.write(content)

print("OK")
