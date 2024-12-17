import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database.js"; // Conexão com o MongoDB

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

let db;

// Funções para manipular os usuários
const insertUser = async (nome, email, senha, cpf, contato) => {
  const collection = db.collection("users");
  const newUser = { nome, email, senha, cpf, contato, createdAt: new Date() };
  await collection.insertOne(newUser);
  return newUser;
};

const loginUser = async (email, senha) => {
  const collection = db.collection("users");
  return await collection.findOne({ email, senha });
};

// Funções para manipular os agendamentos
const insertAgendamento = async (nome, cpf, servico, contato, local, dataAgendamento, horaAgendamento) => {
  const collection = db.collection("agendamentos");
  const newAgendamento = {
    nome,
    cpf,
    servico,
    contato,
    local,
    data: dataAgendamento,
    hora: horaAgendamento,
    createdAt: new Date(),
  };
  await collection.insertOne(newAgendamento);
  return newAgendamento;
};

const getAgendamentos = async (cpf) => {
  const collection = db.collection("agendamentos");
  return await collection.find({ cpf }).toArray();
};

// Rota de Cadastro de Usuários
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha, cpf, contato } = req.body;

  if (!nome || !email || !senha || !cpf || !contato) {
    return res.status(404).json({ message: "Todos os campos são obrigatórios" });
  }

  try {
    const novoUsuario = await insertUser(nome, email, senha, cpf, contato);
    return res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao cadastrar usuário: ${e.message}` });
  }
});

// Rota de Login de Usuários
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(404).json({ message: "Email e senha são obrigatórios" });
  }

  try {
    const usuario = await loginUser(email, senha);
    if (usuario) {
      return res.status(200).json({
        message: "Login bem-sucedido",
        user: {
          cpf: usuario.cpf,
          nome: usuario.nome,
          email: usuario.email,
        },
      });
    } else {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
  } catch (e) {
    return res.status(500).json({ message: `Erro ao realizar login: ${e.message}` });
  }
});

// Rota de Agendamento
app.post("/agendamentos", async (req, res) => {
  const { nome, cpf, servico, contato, local, data, hora } = req.body;

  if (!nome || !cpf || !servico || !contato || !local || !data || !hora) {
    return res.status(404).json({ message: "Todos os campos são obrigatórios" });
  }

  try {
    const novoAgendamento = await insertAgendamento(nome, cpf, servico, contato, local, data, hora);
    return res.status(201).json({ message: "Agendamento criado com sucesso!", agendamento: novoAgendamento });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao criar agendamento: ${e.message}` });
  }
});

// Rota para listar Agendamentos
app.get("/agendamentos", async (req, res) => {
  const { cpf } = req.query;

  if (!cpf) {
    return res.status(404).json({ message: "CPF é obrigatório para listar agendamentos" });
  }

  try {
    const agendamentos = await getAgendamentos(cpf);
    return res.status(200).json(agendamentos);
  } catch (e) {
    return res.status(500).json({ message: `Erro ao buscar agendamentos: ${e.message}` });
  }
});

// Conectar ao banco e iniciar o servidor
connectToDatabase()
  .then((database) => {
    db = database;
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados:", err);
  });
