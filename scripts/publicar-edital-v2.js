import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function publicarEdital(cidade, banca, dadosEdital) {
  const MEGA_PROMPT = `Você é um especialista em SEO para concursos públicos.

RETORNE APENAS HTML PURO E JSON-LD. NÃO USE MARKDOWN.

Processe: ${dadosEdital}

Formato exato:
---HTML INÍCIO---
<h1>Concurso Público [Instituição] [Ano]: Edital, Vagas e Inscrições</h1>
<p>[Introdução breve]</p>
<ul>
<li>Banca: [banca]</li>
<li>Vagas: [vagas]</li>
<li>Salário: [salário]</li>
<li>Inscrições: [período]</li>
<li>Prova: [data]</li>
</ul>
<h2>Quais são as vagas e salários?</h2>
<p>[Detalhes]</p>
<h2>Como fazer a inscrição?</h2>
<p>[Instruções]</p>
<h3>Requisitos exigidos</h3>
<ul>
<li>Requisito 1</li>
<li>Requisito 2</li>
</ul>
<h2>Perguntas Frequentes</h2>
<p><strong>P1: [Pergunta 1]</strong></p>
<p>R: [Resposta 1]</p>
<p><strong>P2: [Pergunta 2]</strong></p>
<p>R: [Resposta 2]</p>
---HTML FIM---

---JSON-LD INÍCIO---
{"@context":"https://schema.org","@type":"JobPosting","title":"[Cargo]","hiringOrganization":{"@type":"Organization","name":"[Instituição]"},"jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressLocality":"${cidade}","addressRegion":"MG","addressCountry":"BR"}},"baseSalary":{"@type":"PriceSpecification","currency":"BRL","price":"[salário]"},"validThrough":"[data fim inscrições]"}
---JSON-LD FIM---`;

  try {
    console.log("🔄 Chamando Claude API...");
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      messages: [{ role: "user", content: MEGA_PROMPT }],
    });

    const resposta = response.content[0].text;
    
    // Extrair HTML
    const htmlMatch = resposta.match(/---HTML INÍCIO---([\s\S]*?)---HTML FIM---/);
    const htmlContent = htmlMatch ? htmlMatch[1].trim() : resposta;
    
    // Extrair JSON-LD
    const jsonMatch = resposta.match(/---JSON-LD INÍCIO---([\s\S]*?)---JSON-LD FIM---/);
    const jsonLd = jsonMatch ? jsonMatch[1].trim() : '';
    
    const conteudo = "---\n// Auto-gerado por Claude\n---\n\n" + htmlContent + "\n\n<script type='application/ld+json'>\n" + jsonLd + "\n</script>";
    
    const slug = banca.toLowerCase().replace(/\s+/g, '-');
    const ano = new Date().getFullYear();
    const arquivoNome = slug + "-" + ano + ".astro";
    const caminhoCompleto = path.join(process.env.HOME, 'diario-do-sertao/src/pages/concursos-norte-de-minas', cidade, arquivoNome);

    const dir = path.dirname(caminhoCompleto);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(caminhoCompleto, conteudo);
    console.log("✅ Arquivo salvo");

    console.log("📤 Git push...");
    execSync("cd ~/diario-do-sertao && git add . && git commit -m 'Edital: " + banca + "' && git push origin main", { stdio: 'inherit' });
    
    console.log("🎉 Publicado!");

  } catch (error) {
    console.error("Erro:", error.message);
  }
}

const cidade = "montes-claros";
const banca = "IBGP";
const dados = "Câmara Municipal de Montes Claros - Edital 002/2025, Vagas: 15, Salário: R$ 3.500, Inscrições: 05/03 a 05/04/2025, Prova: 20/04/2025";

publicarEdital(cidade, banca, dados);
