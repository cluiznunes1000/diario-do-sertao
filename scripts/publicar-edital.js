import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function publicarEdital(cidade, banca, dadosEdital) {
  const MEGA_PROMPT = `Atue como Especialista em SEO focado em concursos públicos.

Processe estes dados do edital:
${dadosEdital}

Gere EXATAMENTE neste formato:
CATEGORIA: [MUNICIPAL/ESTADUAL-MG/NACIONAL]
CIDADE: ${cidade}
BANCA: ${banca}

Depois o conteúdo HTML e JSON-LD`;

  try {
    console.log("🔄 Chamando Claude API...");
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      messages: [{ role: "user", content: MEGA_PROMPT }],
    });

    const conteudo = response.content[0].text;
    
    // Extrair CATEGORIA da primeira linha
    const primeiraLinha = conteudo.split('\n')[0];
    const categoria = primeiraLinha.includes('MUNICIPAL') ? 'MUNICIPAL' : 
                      primeiraLinha.includes('ESTADUAL') ? 'ESTADUAL' : 'NACIONAL';

    // Criar caminho do arquivo
    const slug = banca.toLowerCase().replace(/\s+/g, '-');
    const ano = new Date().getFullYear();
    const arquivoNome = `${slug}-${ano}.astro`;
    const caminho = `~/diario-do-sertao/src/pages/concursos-norte-de-minas/${cidade.toLowerCase()}/${arquivoNome}`;
    const caminhoCompleto = caminho.replace('~', process.env.HOME);

    // Criar diretório se não existir
    const dir = path.dirname(caminhoCompleto);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Salvar arquivo
    fs.writeFileSync(caminhoCompleto, conteudo);
    console.log(`✅ Arquivo salvo: ${caminhoCompleto}`);

    // Git commit e push
    console.log("📤 Fazendo commit e push...");
    execSync(`cd ~/diario-do-sertao && git add . && git commit -m "Adicionar edital: ${banca} em ${cidade}" && git push origin main`, { stdio: 'inherit' });
    
    console.log("🎉 Publicado com sucesso!");

  } catch (error) {
    console.error("Erro:", error.message);
  }
}

// Exemplo de uso
const cidade = "montes-claros";
const banca = "COTEC";
const dados = "Prefeitura de Montes Claros - Edital 001/2025, Vagas: 50, Salário: R$ 5.500, Inscrições: 01/03 a 30/03/2025, Prova: 15/04/2025";

publicarEdital(cidade, banca, dados);
