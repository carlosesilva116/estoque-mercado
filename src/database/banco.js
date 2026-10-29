import * as SQLite from 'expo-sqlite';
import Produto from '../models/Produto';

let banco;

export async function abrirBanco() {
  if (!banco) banco = await SQLite.openDatabaseAsync('estoque-mercado.db');
  await banco.execAsync(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL CHECK(length(trim(nome)) BETWEEN 2 AND 80),
      categoria TEXT NOT NULL CHECK(categoria IN ('Alimentos', 'Bebidas', 'Limpeza', 'Higiene')),
      preco_centavos INTEGER NOT NULL CHECK(preco_centavos BETWEEN 0 AND 99999999),
      quantidade INTEGER NOT NULL CHECK(quantidade BETWEEN 0 AND 999999)
    );
  `);
}

export async function salvarProduto(produto) {
  if (produto.id === null) {
    await banco.runAsync(
      'INSERT INTO produtos (nome, categoria, preco_centavos, quantidade) VALUES (?, ?, ?, ?)',
      produto.nome, produto.categoria, produto.precoCentavos, produto.quantidade
    );
  } else {
    const resultado = await banco.runAsync(
      'UPDATE produtos SET nome = ?, categoria = ?, preco_centavos = ?, quantidade = ? WHERE id = ?',
      produto.nome, produto.categoria, produto.precoCentavos, produto.quantidade, produto.id
    );
    if (resultado.changes === 0) throw new Error('O produto não foi encontrado.');
  }
}

export async function listarProdutos(busca = '', categoria = 'Todas', ordem = 'Nome') {
  let sql = 'SELECT * FROM produtos WHERE 1 = 1';
  const parametros = [];
  if (busca.trim()) {
    // instr pesquisa o texto informado sem tratar % e _ como curingas.
    sql += ' AND instr(lower(nome), lower(?)) > 0';
    parametros.push(busca.trim());
  }
  if (categoria !== 'Todas') {
    sql += ' AND categoria = ?';
    parametros.push(categoria);
  }
  sql += ordem === 'Quantidade'
    ? ' ORDER BY quantidade ASC, nome COLLATE NOCASE ASC, id ASC'
    : ' ORDER BY nome COLLATE NOCASE ASC, id ASC';
  return await banco.getAllAsync(sql, parametros);
}

export async function excluirProduto(id) {
  await banco.runAsync('DELETE FROM produtos WHERE id = ?', id);
}

export async function movimentarEstoque(id, tipo, unidades) {
  const registro = await banco.getFirstAsync('SELECT * FROM produtos WHERE id = ?', id);
  if (!registro) throw new Error('O produto não foi encontrado.');
  const produto = new Produto(registro.nome, registro.categoria, registro.preco_centavos / 100, registro.quantidade, registro.id);
  let diferenca;
  if (tipo === 'Entrada') diferenca = produto.entrar(unidades);
  else if (tipo === 'Saída') diferenca = -produto.sair(unidades);
  else throw new Error('Selecione Entrada ou Saída.');

  const resultado = await banco.runAsync(
    `UPDATE produtos SET quantidade = quantidade + ?
     WHERE id = ? AND quantidade + ? BETWEEN 0 AND 999999`,
    diferenca, id, diferenca
  );
  if (resultado.changes === 0) throw new Error('O estoque mudou. Confira a quantidade e tente novamente.');
}
