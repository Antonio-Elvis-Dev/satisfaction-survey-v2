// test-gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // Isso deve dar erro se a chave estiver errada, ou listar modelos se estiver certa
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Olá, teste de conexão.");
    const response = await result.response;
    console.log("✅ Conexão bem sucedida com gemini-pro!");
    console.log("Resposta:", response.text());
  } catch (error) {
    console.error("❌ Erro ao conectar:", error.message);
    console.log("-----------------------------------");
    console.log("DETALHES DO ERRO:", error);
  }
}

listModels();