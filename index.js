const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8000;

const db = new sqlite3.Database('./usuarios.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    cpf TEXT NOT NULL,
    matricula TEXT NOT NULL,
    senha TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error('Erro ao criar a tabela', err.message);
    } else {
        console.log('Tabela de usuários criada ou já existe.');
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Templates')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Templates', 'Login.html'), (err) => {
        if (err) {
            res.status(err.status).end();
        }
    });
});

// Rota para cadastrar novos usuários
app.post('/usuarios', (req, res) => {
    const { nome, email, cpf, matricula, senha } = req.body;

    // Hash da senha antes de salvar
    bcrypt.hash(senha, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao hashear a senha.' });
        }

        const sql = 'INSERT INTO usuarios (nome, email, cpf, matricula, senha) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [nome, email, cpf, matricula, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, nome, email });
        });
    });
});

// Rota para login
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body; // Mudado para 'usuario'

    // Verifica se o nome de usuário e a senha foram fornecidos
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios.' });
    }

    // Busca o usuário pelo nome
    db.get('SELECT * FROM usuarios WHERE nome = ?', [usuario], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao acessar o banco de dados.' });
        }

        // Verifica se o usuário existe
        if (!row) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Compara a senha fornecida com a senha armazenada
        bcrypt.compare(senha, row.senha, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao comparar senhas.' });
            }
            if (!result) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            // Login bem-sucedido
            res.status(200).json({ message: 'Login realizado com sucesso!', id: row.id, nome: row.nome });
        });
    });
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados', err.message);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
