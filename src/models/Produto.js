export const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene'];

export default class Produto {
  #nome;
  #categoria;
  #precoCentavos;
  #quantidade;

  constructor(nome, categoria, preco, quantidade, id = null) {
    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.preco = preco;
    this.quantidade = quantidade;
  }

  get nome() { return this.#nome; }
  set nome(valor) {
    const nome = String(valor ?? '').trim();
    if (nome.length < 2 || nome.length > 80) {
      throw new Error('O nome deve ter entre 2 e 80 caracteres.');
    }
    this.#nome = nome;
  }

  get categoria() { return this.#categoria; }
  set categoria(valor) {
    if (!CATEGORIAS.includes(valor)) throw new Error('Selecione uma categoria válida.');
    this.#categoria = valor;
  }

  get preco() { return this.#precoCentavos / 100; }
  get precoCentavos() { return this.#precoCentavos; }
  set preco(valor) {
    const texto = String(valor ?? '').trim().replace(',', '.');
    const centavos = Math.round(Number(texto) * 100);
    if (!/^\d+(\.\d{1,2})?$/.test(texto) || !Number.isSafeInteger(centavos) || centavos > 99999999) {
      throw new Error('Informe um preço entre 0 e 999.999,99, com até duas casas decimais. Não use ponto de milhar.');
    }
    this.#precoCentavos = centavos;
  }

  get quantidade() { return this.#quantidade; }
  set quantidade(valor) {
    const texto = String(valor ?? '').trim();
    const quantidade = Number(texto);
    if (!/^\d+$/.test(texto) || !Number.isInteger(quantidade) || quantidade > 999999) {
      throw new Error('Informe uma quantidade inteira entre 0 e 999999.');
    }
    this.#quantidade = quantidade;
  }

  validarMovimento(unidades) {
    const texto = String(unidades ?? '').trim();
    const valor = Number(texto);
    if (!/^\d+$/.test(texto) || !Number.isInteger(valor) || valor < 1 || valor > 999999) {
      throw new Error('Informe uma quantidade inteira de unidades entre 1 e 999999.');
    }
    return valor;
  }

  entrar(unidades) {
    const valor = this.validarMovimento(unidades);
    this.quantidade = this.quantidade + valor;
    return valor;
  }

  sair(unidades) {
    const valor = this.validarMovimento(unidades);
    if (valor > this.quantidade) throw new Error('A saída não pode ser maior que o estoque disponível.');
    this.quantidade = this.quantidade - valor;
    return valor;
  }
}
