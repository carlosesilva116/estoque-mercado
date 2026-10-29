# Verificação do projeto

## Conferido neste ambiente

- Revisão com ESLint, sem erros.
- Verificação dos arquivos JavaScript com o TypeScript em modo checkJs, sem erros.
- Empacotamento JavaScript para Android com expo export, sem erros.
- Validações de nome, categoria, preço e quantidade.
- Conversão de preços com vírgula para centavos inteiros.
- Cadastro, consulta, alteração e exclusão de produtos.
- Entrada e saída de unidades.
- Recusa de saída maior que a quantidade disponível.
- Recusa de quantidade negativa, fracionada ou inválida.
- Combinação de busca por nome com filtro por categoria.
- Ordenação por nome e por quantidade.
- Consultas parametrizadas com texto contendo apóstrofo e símbolos.
- Leitura dos dados após fechar e reabrir o arquivo do banco.

As verificações do banco usaram o SQL do próprio projeto com um adaptador para
node:sqlite e um arquivo temporário de teste. Não foi substituído o SQLite do
aplicativo: o código entregue usa expo-sqlite.

## Conferir no celular antes da entrega

- Abrir o projeto no Expo Go compatível com SDK 58.
- Testar formulário, teclado, botões, mensagens e janela de movimentação.
- Fechar o Expo Go, abrir novamente o projeto e conferir os produtos salvos.
- Tirar as capturas de tela indicadas no README.md.

Não foi executado um dispositivo Android ou iOS neste ambiente. O empacotamento
verifica o código para Android, mas não gera um APK nem substitui o teste no celular.
