import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function publicarEdital(cidade, banca, dadosEdital) {
  const MEGA_PROMPT = `Você é um especialista em SEO para concursos públicos.

IMPORTANTE: Retorne APENAS HTML puro com tags <h1>, <h2>, <p>, <ul>, <li>. 
NÃO use Markdown (#, ##, **, etc).

Processe: ${dadosEdital}

Formato:
1. CATEGORIA: [MUNICIPAL/ESTADUAL-MG/NACIONAL]
2. CIDADE: ${cidade}
3. BANCA: ${banca}
4. HTML estruturado
5. FAQ em HTML
6. JSON-LD`;

  try {
    console.log("🔄 Chamando Claude API...");
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      messages: [{ role: "user", content: MEGA_PROMPT }],
    });

    const conteudoGerado = response.content[0].text;
    
    // Envolver em frontmatter Astro
    const conteudo = `---
// Auto-gerado por Claude API
---

${conteudoGerado}`;
    
    const slug = banca.toLowerCase().replace(/\s+/g, '-');
    const ano = new Date().getFullYear();
    const arquivoNome = \`\${slug}-\${ano}.astro\`;
    const caminhoCompleto = path.join(process.env.HOME, 'diario-do-sertao/src/pages/concursos-norte-de-minas', cidade, arquivoNome);

    const dir = path.dirname(caminhoCompleto);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(caminhoCompleto, conteudo);
    console.log(\`✅ Arquivo salvo: \${caminhoCompleto}\`);

    console.log("📤 Fazendo commit e push...");
    execSync(\`cd ~/diario-do-sertao && git add . && git commit -m "Adicionar edital: \${banca} em \${cidade}" && git push origin main\`, { stdio: 'inherit' });
    
    console.log("🎉 Publicado com sucesso!");

  } catch (error) {
    console.error("Erro:", error.message);
  }
}

const cidade = "montes-claros";
const banca = "COTEC";
const dados = "Prefeitura de Montes Claros - Edital 001/2025, Vagas: 50, Salário: R$ 5.500, Inscrições: 01/03 a 30/03/2025, Prova: 15/04/2025";

publicarEdital(cidade, banca, dados);
