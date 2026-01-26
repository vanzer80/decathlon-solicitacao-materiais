import { Express, Request, Response } from 'express';
import { storagePut } from './storage';
import { nanoid } from 'nanoid';
import fileUpload from 'express-fileupload';

export function setupUploadEndpoint(app: Express) {
  app.use(fileUpload());
  
  app.post('/api/upload', async (req: Request, res: Response) => {
    try {
      // Verificar se há arquivo no body (multipart/form-data)
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
      }

      const file = req.files.file as any;

      // Validar tipo de arquivo
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Apenas imagens são permitidas' });
      }

      // Validar tamanho (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ error: 'Arquivo muito grande (máx 5MB)' });
      }

      // Gerar nome único
      const timestamp = Date.now();
      const randomId = nanoid(8);
      const ext = file.name.split('.').pop();
      const fileName = `solicitacao-${timestamp}-${randomId}.${ext}`;

      // Upload para S3
      const { url } = await storagePut(
        `solicitacoes/${fileName}`,
        file.data,
        file.mimetype
      );

      return res.json({ url, fileName });
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      return res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
    }
  });
}
