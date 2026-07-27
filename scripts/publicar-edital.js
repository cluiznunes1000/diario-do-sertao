import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function publicarEdital(cidade, banca, dadosEdital) {
  const MEGA_PROMPT = "Retorne APENAS HTML puro com <h1>, <h2>, <p>, <ul>, <li>. SEM Markdown. Processe: " + dadosEdital;

  try {
    console.log("🔄 Chamando Claude API...");
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      messages: [{ role: "user", content: MEGA_PROMPT }],
    });

    const conteudoGerado = response.content[0].text;
    const conteudo = "---\n// Auto-gerado\n---\n\n" + conteudoGerado;
    
    const slug = banca.toLowerCase().replace(/\s+/g, '-');
    const ano = new Date().getFullYear();
    const arquivoNome = slug + "-" + ano + ".astro";
    const caminhoCompleto = path.join(process.env.HOME, 'diario-do-sertao/src/pages/concursos-norte-de-minas', cidade, arquivoNome);

    const dir = path.dirname(caminhoCompleto);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(caminhoCompleto, conteudo);
    console.log("✅ Arquivo salvo: " + caminhoCompleto);

    console.log("📤 Fazendo commit e push...");
    execSync("cd ~/diario-do-sertao && git add . && git commit -m 'Edital: " + banca + " em " + cidade + "' && git push origin main", { stdio: 'inherit' });
    
    console.log("🎉 Publicado com sucesso!");

  } catch (error) {
    console.error("Erro:", error.message);
  }
}

const cidade = "montes-claros";
const banca = "COTEC";
const dados = "Prefeitura de Montes Claros - Edital 001/2025, Vagas: 50, Salário: R$ 5.500, Inscrições: 01/03 a 30/03/2025, Prova: 15/04/2025";

publicarEdital(cidade, banca, dados);
