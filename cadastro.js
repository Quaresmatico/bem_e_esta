const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Configurando middleware para parsear o body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurando middleware para servir arquivos estáticos, exceto os sensíveis
app.use(express.static(__dirname));
app.use((req, res, next) => {
  if (req.path.indexOf('/node_modules/') === 0 || req.path.endsWith('package.json') || req.path.endsWith('package-lock.json')) {
    return res.status(403).send('Access Denied');
  }
  next();
});

const port = 3000;

// Conexão com o MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/bem_estar", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
}).then(() => {
  console.log("Conectado ao MongoDB");
}).catch(err => {
  console.error("Erro ao conectar com o MongoDB", err);
});

// Schema do Usuário
const UsuarioSchema = new mongoose.Schema({
  nome: String,
  senha: { type: String, required: true },
  telefone: String,
  endereco: String,
  email: { type: String, required: true, unique: true },
  nacionalidade: { type: String, required: true },
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

// Rota de POST para cadastro de usuário
app.post("/cadastrousuario", async (req, res) => {
  const { nome, senha, telefone, endereco, email, nacionalidade } = req.body;

  // Validação simplificada de campos
  if (!nome || !senha || !email || !nacionalidade) {
    return res.status(400).json({ error: "Preencher todos os campos obrigatórios" });
  }

  // Teste de duplicidade de e-mail
  try {
    const emailExiste = await Usuario.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ error: "O email informado já existe" });
    }

    const usuario = new Usuario({ nome, senha, telefone, endereco, email, nacionalidade });
    const newUsuario = await usuario.save();
    res.json({ error: null, msg: "Cadastro realizado com sucesso", UsuarioId: newUsuario._id });
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota de GET para servir o formulário de cadastro
app.get("/cadastrousuario", (req, res) => {
  res.sendFile(path.join(__dirname, "cadastro.html"));
});

// Rota de GET para servir a página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta http://localhost:${port}`);
});
