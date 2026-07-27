import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function gerarEdital(dadosEdital) {
  const MEGA_PROMPT = "Atue como um Especialista em SEO focado em concursos públicos. Processe: " + dadosEdital;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      messages: [{ role: "user", content: MEGA_PROMPT }],
    });
    console.log(response.content[0].text);
  } catch (error) {
    console.error("Erro:", error.message);
  }
}

const editalTeste = "Prefeitura de Montes Claros - Edital 001/2025, Banca: COTEC, Vagas: 50, Salário: R$ 5.500, Inscrições: 01/03 a 30/03/2025, Prova: 15/04/2025";

gerarEdital(editalTeste);
