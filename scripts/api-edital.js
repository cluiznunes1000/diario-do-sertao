import express from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const app = express();
app.use(express.json());

// Função para remover acentos
function removerAcentos(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

app.post('/api/salvar-edital', (req, res) => {
  try {
    const { cidade, banca, html, jsonld } = req.body;
    
    if (!cidade || !banca || !html) {
      return res.status(400).json({ error: 'Faltam dados' });
    }

    // Remover acentos do slug
    const slug = removerAcentos(banca).toLowerCase().replace(/\s+/g, '-');
    const ano = new Date().getFullYear();
    const arquivoNome = `${slug}-${ano}.astro`;
    const caminhoCompleto = path.join(process.env.HOME, 'diario-do-sertao/src/pages/concursos-norte-de-minas', cidade, arquivoNome);

    const dir = path.dirname(caminhoCompleto);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const conteudo = `---\n// Auto-gerado por N8N\n---\n\n${html}\n\n<script type='application/ld+json'>\n${jsonld}\n</script>`;
    
    fs.writeFileSync(caminhoCompleto, conteudo);
    
    execSync(`cd ~/diario-do-sertao && git add . && git commit -m "Edital: ${banca} em ${cidade}" && git push origin main`);
    
    res.json({ success: true, arquivo: caminhoCompleto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Servidor rodando na porta 3001'));
