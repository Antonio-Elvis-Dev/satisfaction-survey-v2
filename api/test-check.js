import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import "dotenv/config"; // 1. Isto carrega as variáveis do ficheiro .env

// 2. Agora passamos a chave explicitamente através de process.env
// O 'process.env.GEMINI_API_KEY' vai buscar o valor que definiste no ficheiro .env

async function main() {
  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: 'Escreava uma receita de lasanha vegetariana que sirva 4 pessoas.',
    });

    // 3. Imprimir a resposta
    console.log(text);

  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

main();