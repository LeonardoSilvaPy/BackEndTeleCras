import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3001;

// Arquivo JSON para armazenar os usuários e agendamentos
const usersFilePath = "./users.json";
const agendamentosFilePath = "./agendamentos.json";

// Funções para manipular os usuários
const insertUser = (nome, email, senha, cpf, contato) => {
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8")) || [];
  const newUser = {
    id: Math.random().toString(36),
    nome,
    email,
    senha,
    cpf,
    contato,
  };
  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  return newUser;
};

const loginUser = (email, senha) => {
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8")) || [];
  return users.find(user => user.email === email && user.senha === senha);
};

// Funções para manipular os agendamentos
const insertAgendamento = (nome, cpf, servico, contato, local, dataAgendamento, horaAgendamento) => {
  const agendamentos = JSON.parse(fs.readFileSync(agendamentosFilePath, "utf-8")) || [];
  const newAgendamento = {
    id: Math.random().toString(36),
    nome,
    cpf,
    servico,
    contato,
    local,
    data: dataAgendamento,
    hora: horaAgendamento,
  };
  agendamentos.push(newAgendamento);
  fs.writeFileSync(agendamentosFilePath, JSON.stringify(agendamentos, null, 2));
  return newAgendamento;
};

const getAgendamentos = (cpf) => {
  const agendamentos = JSON.parse(fs.readFileSync(agendamentosFilePath, "utf-8")) || [];
  return agendamentos.filter(agendamento => agendamento.cpf === cpf);
};

// Rotas de Cadastro e Login

app.post("/cadastro", (req, res) => {
  const { nome, email, senha, cpf, contato } = req.body;

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !email || !senha || !cpf || !contato) {
    return res.status(404).json({ message: "Nome, email, senha, CPF e contato são obrigatórios" });
  }

  // Validação básica do CPF
  if (cpf.length !== 11 || !cpf.match(/^\d+$/)) {
    return res.status(404).json({ message: "CPF inválido. Deve conter 11 dígitos numéricos." });
  }

  // Validação básica do contato
  if (contato.length < 10 || !contato.match(/^\d+$/)) {
    return res.status(404).json({ message: "Contato inválido. Deve conter pelo menos 10 dígitos numéricos." });
  }

  try {
    const novoUsuario = insertUser(nome, email, senha, cpf, contato);
    return res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao cadastrar usuário: ${e.message}` });
  }
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(404).json({ message: "Email e senha são obrigatórios" });
  }

  const usuario = loginUser(email, senha);

  if (usuario) {
    return res.status(200).json({
      message: "Login bem-sucedido",
      user: {
        cpf: usuario.cpf,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } else {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }
});

// Rotas de Agendamento

app.post("/agendamentos", (req, res) => {
  const { nome, cpf, servico, contato, local, data, hora } = req.body;

  // Verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !cpf || !servico || !contato || !local || !data || !hora) {
    return res.status(404).json({ message: "Todos os campos são obrigatórios" });
  }

  try {
    const novoAgendamento = insertAgendamento(nome, cpf, servico, contato, local, data, hora);
    return res.status(201).json({ message: "Agendamento criado com sucesso!", agendamento: novoAgendamento });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao criar agendamento: ${e.message}` });
  }
});

app.get("/agendamentos", (req, res) => {
  const cpf = req.query.cpf;

  // Verifica se o CPF foi fornecido
  if (!cpf) {
    return res.status(404).json({ message: "CPF é obrigatório para listar agendamentos" });
  }

  try {
    const agendamentos = getAgendamentos(cpf);
    return res.status(200).json(agendamentos.map(agendamento => ({
      id: agendamento.id,
      nome: agendamento.nome,
      cpf: agendamento.cpf,
      servico: agendamento.servico,
      contato: agendamento.contato,
      local: agendamento.local,
      data: agendamento.data,
      hora: agendamento.hora,
    })));
  } catch (e) {
    return res.status(500).json({ message: `Erro ao buscar agendamentos: ${e.message}` });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
