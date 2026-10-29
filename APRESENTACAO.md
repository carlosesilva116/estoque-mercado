# Apresentação individual

Use este roteiro para demonstrar o aplicativo e explicar o código com suas palavras.

## Objetivo

O aplicativo controla o estoque de um mercado. Cada produto possui nome,
categoria, preço e quantidade. É possível cadastrar, consultar, editar, excluir
e registrar entrada e saída de unidades. Os dados ficam salvos no próprio celular.

## Demonstração

Cadastre um produto e explique seus campos. Mostre a busca por nome, o filtro
por categoria e a ordenação. Edite o preço e registre uma entrada e uma saída.
Tente retirar mais unidades do que existem para mostrar a validação.
Exclua um produto. Feche e abra novamente o aplicativo para demonstrar a persistência.

## Classe Produto

O constructor recebe os dados e utiliza os setters para validá-los.
Os atributos com # são privados. Os getters permitem consultar os valores.
O setter de nome confere o tamanho do texto. O de preço valida o valor e guarda
os centavos como um número inteiro. O de quantidade aceita apenas unidades inteiras.
Os métodos entrar e sair aplicam as regras de movimentação do estoque.

## Banco de dados

A função abrirBanco abre o arquivo estoque-mercado.db e cria a tabela produtos
quando ela ainda não existe. O INSERT inclui o produto. O SELECT consulta os
registros. O UPDATE altera os dados ou a quantidade. O DELETE exclui o produto.

O WHERE aplica os filtros. O ORDER BY define a ordenação. Os símbolos ? indicam
os parâmetros usados nas consultas. O texto digitado não é concatenado ao SQL.
A entrada e a saída somam ou descontam unidades diretamente no banco.

## Tela

O useState guarda os campos, filtros e produtos durante o uso da tela.
O useEffect carrega os produtos quando a consulta muda ou uma operação é concluída.
O async/await aguarda as operações do banco. O try/catch trata erros e permite
mostrar uma mensagem em vez de encerrar o aplicativo.
O SQLite mantém os dados quando o aplicativo fecha; o useState sozinho não faz isso.

## Perguntas para revisar

- Qual é a função do constructor?
- Para que servem os getters e setters?
- Como o código decide entre INSERT e UPDATE?
- Por que o preço é salvo em centavos?
- Onde o sistema impede uma saída maior que o estoque?
- Como funcionam a busca, o filtro e a ordenação no SQL?
- Qual é a diferença entre os dados da tela e os dados salvos no SQLite?
