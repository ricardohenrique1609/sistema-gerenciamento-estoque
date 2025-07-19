const baseURL = 'http://localhost:3000';

// Função para carregar produtos
async function carregarProdutos() {
    const resposta = await fetch(`${baseURL}/produtos`);
    const produtos = await resposta.json();

    const tabelaProdutos = document.getElementById('tabela-produtos');
    tabelaProdutos.innerHTML = ''; // Limpa a tabela

    produtos.forEach(produto => {
        const linha = document.createElement('tr');

        linha.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.preco}</td>
            <td>${produto.estoque}</td>
            <td>${produto.categoria || 'N/A'}</td>
            <td>${produto.fornecedor || 'N/A'}</td>
            <td><button onclick="deletarProduto(${produto.id})">Deletar</button></td>
        `;

        tabelaProdutos.appendChild(linha);
    });
}

// Função para carregar vendas
async function carregarVendas() {
    const resposta = await fetch(`${baseURL}/vendas`);
    const vendas = await resposta.json();

    const tabelaVendas = document.getElementById('tabela-vendas');
    tabelaVendas.innerHTML = ''; // Limpa a tabela

    vendas.forEach(venda => {
        const linha = document.createElement('tr');

        linha.innerHTML = `
            <td>${venda.id}</td>
            <td>${venda.produto}</td>
            <td>${venda.quantidade}</td>
            <td>${venda.data_venda}</td>
        `;

        tabelaVendas.appendChild(linha);
    });
}

// Função para adicionar um produto
async function adicionarProduto() {
    const nome = prompt('Digite o nome do produto:');
    if (!nome) {
        alert('O nome do produto é obrigatório!');
        return;
    }

    const preco = parseFloat(prompt('Digite o preço do produto:'));
    if (isNaN(preco) || preco <= 0) {
        alert('O preço deve ser um número válido maior que 0.');
        return;
    }

    const estoque = parseInt(prompt('Digite a quantidade em estoque:'));
    if (isNaN(estoque) || estoque < 0) {
        alert('A quantidade em estoque deve ser um número válido maior ou igual a 0.');
        return;
    }

    const categoria_id = parseInt(prompt('Digite o ID da categoria:'));
    if (isNaN(categoria_id) || categoria_id <= 0) {
        alert('O ID da categoria deve ser um número válido maior que 0.');
        return;
    }

    const fornecedor_id = parseInt(prompt('Digite o ID do fornecedor:'));
    if (isNaN(fornecedor_id) || fornecedor_id <= 0) {
        alert('O ID do fornecedor deve ser um número válido maior que 0.');
        return;
    }

    const produto = { nome, preco, estoque, categoria_id, fornecedor_id };

    const resposta = await fetch(`${baseURL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto),
    });

    if (resposta.ok) {
        alert('Produto adicionado com sucesso!');
        carregarProdutos();
    } else {
        alert('Erro ao adicionar produto.');
    }
}

// Função para registrar uma venda
async function registrarVenda() {
    const produto_id = parseInt(prompt('Digite o ID do produto:'));
    if (isNaN(produto_id) || produto_id <= 0) {
        alert('O ID do produto deve ser um número válido maior que 0.');
        return;
    }

    const quantidade = parseInt(prompt('Digite a quantidade vendida:'));
    if (isNaN(quantidade) || quantidade <= 0) {
        alert('A quantidade vendida deve ser um número válido maior que 0.');
        return;
    }

    const data_venda = prompt('Digite a data da venda (YYYY-MM-DD):');
    if (!data_venda) {
        alert('A data da venda é obrigatória!');
        return;
    }

    const venda = { produto_id, quantidade, data_venda };

    const resposta = await fetch(`${baseURL}/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venda),
    });

    if (resposta.ok) {
        alert('Venda registrada com sucesso!');
        carregarVendas();
    } else {
        alert('Erro ao registrar venda.');
    }
}

// Função para deletar um produto
async function deletarProduto(id) {
    const confirmacao = confirm('Tem certeza que deseja deletar este produto?');

    if (confirmacao) {
        const resposta = await fetch(`${baseURL}/produtos/${id}`, {
            method: 'DELETE',
        });

        if (resposta.ok) {
            alert('Produto deletado com sucesso!');
            carregarProdutos();
        } else {
            alert('Erro ao deletar produto.');
        }
    }
}
// Função para carregar os produtos no filtro do relatório
async function carregarProdutosParaRelatorio() {
    const resposta = await fetch(`${baseURL}/produtos`);
    const produtos = await resposta.json();

    const selectProdutoRelatorio = document.getElementById('produto-relatorio');
    selectProdutoRelatorio.innerHTML = ''; // Limpa as opções existentes

    produtos.forEach(produto => {
        const option = document.createElement('option');
        option.value = produto.id;
        option.textContent = produto.nome;
        selectProdutoRelatorio.appendChild(option);
    });
}

// Função para gerar o relatório de vendas
// Função para gerar o relatório de vendas
async function gerarRelatorioVendas() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const produtoId = document.getElementById('produto-relatorio').value;

    // Cria os parâmetros da URL
    const parametros = new URLSearchParams();
    if (dataInicio) parametros.append('dataInicio', dataInicio);
    if (dataFim) parametros.append('dataFim', dataFim);
    if (produtoId) parametros.append('produtoId', produtoId);

    const resposta = await fetch(`${baseURL}/relatorio-vendas?${parametros.toString()}`);
    const relatorio = await resposta.json();

    if (resposta.ok) {
        // Exibe os resultados no console para depuração
        console.log('Relatório de Vendas:', relatorio);
        
        // Aqui você pode processar e exibir os dados no HTML da tabela
        const tabelaRelatorio = document.getElementById('tabela-relatorio-vendas');
        tabelaRelatorio.innerHTML = ''; // Limpar a tabela antes de adicionar novos dados

        relatorio.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.produto}</td>
                <td>${item.total_vendido}</td>
                <td>${item.total_gerado.toFixed(2)}</td>
            `;
            tabelaRelatorio.appendChild(row);
        });
    } else {
        alert('Erro ao gerar relatório de vendas.');
    }
}


    
// Função para carregar o relatório de vendas
function carregarRelatorioVendas() {
    fetch('http://localhost:3000/relatorio-vendas')
        .then(response => response.json())
        .then(data => {
            const tabelaRelatorio = document.getElementById('tabela-relatorio-vendas');
            tabelaRelatorio.innerHTML = ''; // Limpar tabela antes de adicionar novos dados

            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.produto}</td>
                    <td>${item.total_vendido}</td>
                    <td>${item.total_gerado.toFixed(2)}</td>
                `;
                tabelaRelatorio.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar o relatório de vendas:', error);
        });
}

// Adicionar evento para o botão "Gerar Relatório"
document.getElementById('gerar-relatorio').addEventListener('click', carregarRelatorioVendas);


// Event Listeners
document.getElementById('adicionar-produto').addEventListener('click', adicionarProduto);
document.getElementById('registrar-venda').addEventListener('click', registrarVenda);
document.getElementById('gerar-relatorio').addEventListener('click', gerarRelatorioVendas);

// Carrega os dados ao iniciar
carregarProdutos();
carregarVendas();
carregarProdutosParaRelatorio(); // Carrega os produtos para o filtro de relatório

// Função para formatar números
function formatNumber(number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'decimal', // Para números decimais
        minimumFractionDigits: 2, // Dois dígitos após a vírgula
        maximumFractionDigits: 2,
    }).format(number);
}

// Exemplo de uso
const number = 1234567.89;
const formattedNumber = formatNumber(number);
console.log(formattedNumber); // Saída: "1.234.567,89"