import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

// Função para conectar ao MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Conexão com o MongoDB bem-sucedida!");
    return client.db("nome-do-banco"); // Substitua pelo nome do seu banco
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error.message);
    throw error;
  }
}

export default connectToDatabase;