// Importando pacotes necessários
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

// Criando a aplicação Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'Lojaestoque' // Nome do banco de dados
});

// Conectando ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL.');
    }
});

// Rota para adicionar um produto
app.post('/produtos', (req, res) => {
    const { nome, preco, estoque, categoria_id, fornecedor_id } = req.body;

    // Validação básica dos dados recebidos
    if (!nome || !preco || !estoque || !categoria_id || !fornecedor_id) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const query = 'INSERT INTO Produtos (nome, preco, estoque, categoria_id, fornecedor_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nome, preco, estoque, categoria_id, fornecedor_id], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar produto:', err);
            res.status(500).json({ error: 'Erro ao adicionar produto' });
        } else {
            res.json({ message: 'Produto adicionado com sucesso', id: result.insertId });
        }
    });
});

// Rotas para Produtos
app.get('/produtos', (req, res) => {
    const query = `
        SELECT 
            p.id, 
            p.nome, 
            p.preco, 
            p.estoque, 
            c.nome AS categoria, 
            f.nome AS fornecedor 
        FROM Produtos p
        LEFT JOIN Categorias c ON p.categoria_id = c.id
        LEFT JOIN Fornecedores f ON p.fornecedor_id = f.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).json({ error: 'Erro ao buscar produtos' });
        } else {
            res.json(results);
        }
    });
});

// Rota para deletar um produto
// Rota para deletar um produto
app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID do produto inválido ou não fornecido' });
    }

    const query = 'DELETE FROM produtos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar produto:', err);

            // Tratar erros de integridade referencial
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    error: 'Não é possível excluir o produto porque ele está associado a outras tabelas.',
                });
            }

            return res.status(500).json({ error: 'Erro ao deletar produto' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.json({ message: 'Produto deletado com sucesso' });
    });
});


    
// Rota para registrar uma venda
app.post('/vendas', (req, res) => {
    const { produto_id, quantidade, data_venda } = req.body;

    if (!produto_id || !quantidade || !data_venda) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const query = 'INSERT INTO Vendas (produto_id, quantidade, data_venda) VALUES (?, ?, ?)';
    db.query(query, [produto_id, quantidade, data_venda], (err, result) => {
        if (err) {
            console.error('Erro ao registrar venda:', err);
            res.status(500).json({ error: 'Erro ao registrar venda' });
        } else {
            res.json({ message: 'Venda registrada com sucesso', id: result.insertId });
        }
    });
});


// Rotas para Vendas
app.get('/vendas', (req, res) => {
    const query = `
        SELECT 
            v.id, 
            p.nome AS produto, 
            v.quantidade, 
            v.data_venda 
        FROM Vendas v 
        JOIN Produtos p ON v.produto_id = p.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar vendas:', err);
            res.status(500).json({ error: 'Erro ao buscar vendas' });
        } else {
            res.json(results);
        }
    });
});

app.get('/relatorio-vendas', (req, res) => {
    const { dataInicio, dataFim, produtoId } = req.query;

    console.log('Parametros recebidos:', { dataInicio, dataFim, produtoId }); // Adicione este log

    let query = `
        SELECT 
            p.nome AS produto, 
            SUM(v.quantidade) AS total_vendido, 
            SUM(v.quantidade * p.preco) AS total_gerado
        FROM Vendas v
        JOIN Produtos p ON v.produto_id = p.id
    `;

    if (dataInicio && dataFim) {
        query += ` WHERE v.data_venda BETWEEN ? AND ?`;
    } else if (dataInicio) {
        query += ` WHERE v.data_venda >= ?`;
    } else if (dataFim) {
        query += ` WHERE v.data_venda <= ?`;
    }

    if (produtoId) {
        query += ` AND v.produto_id = ?`;
    }

    query += ` GROUP BY p.id ORDER BY total_gerado DESC`;

    const params = [];
    if (dataInicio && dataFim) {
        params.push(dataInicio, dataFim);
    } else if (dataInicio) {
        params.push(dataInicio);
    } else if (dataFim) {
        params.push(dataFim);
    }
    if (produtoId) {
        params.push(produtoId);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro ao gerar relatório de vendas:', err);
            res.status(500).json({ error: 'Erro ao gerar relatório de vendas' });
        } else {
            console.log('Resultados do relatório de vendas:', results); // Adicione este log
            res.json(results);
        }
    });
});



// Servindo a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
