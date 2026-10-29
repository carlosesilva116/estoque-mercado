import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Modal, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Produto, { CATEGORIAS } from '../models/Produto';
import { abrirBanco, excluirProduto, listarProdutos, movimentarEstoque, salvarProduto } from '../database/banco';

function Botao({ texto, onPress, disabled = false, secundario = false }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled}
      style={[styles.botao, secundario && styles.secundario, disabled && styles.desabilitado]}>
      <Text style={secundario ? styles.textoSecundario : styles.textoBotao}>{texto}</Text>
    </Pressable>
  );
}

function Opcoes({ valores, selecionado, onChange, disabled }) {
  return (
    <View style={styles.linha}>
      {valores.map((valor) => (
        <Pressable key={valor} accessibilityRole="button" disabled={disabled} onPress={() => onChange(valor)}
          accessibilityState={{ selected: selecionado === valor, disabled }}
          style={[styles.opcao, selecionado === valor && styles.selecionada]}>
          <Text style={styles.textoOpcao}>{valor}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function EstoqueScreen() {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Alimentos');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [editando, setEditando] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [filtro, setFiltro] = useState('Todas');
  const [ordem, setOrdem] = useState('Nome');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [atualizacao, setAtualizacao] = useState(0);
  const [movimento, setMovimento] = useState(null);
  const [unidades, setUnidades] = useState('');
  const bloqueado = carregando || salvando || Boolean(erro);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        await abrirBanco();
        const registros = await listarProdutos(termo, filtro, ordem);
        if (ativo) setProdutos(registros);
      } catch (error) {
        console.error(error);
        if (ativo) setErro('Não foi possível carregar os produtos. Tente novamente.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [termo, filtro, ordem, atualizacao]);

  function limpar() {
    setNome('');
    setCategoria('Alimentos');
    setPreco('');
    setQuantidade('');
    setEditando(null);
  }

  async function salvar() {
    if (bloqueado) return;
    let produto;
    try {
      produto = new Produto(nome, categoria, preco, quantidade, editando);
    } catch (error) {
      Alert.alert('Confira os dados', error.message);
      return;
    }
    setSalvando(true);
    try {
      await salvarProduto(produto);
      limpar();
      Keyboard.dismiss();
      setAtualizacao((valor) => valor + 1);
      Alert.alert('Produto salvo', 'Os dados foram salvos com sucesso.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  function editar(item) {
    setNome(item.nome);
    setCategoria(item.categoria);
    setPreco((item.preco_centavos / 100).toFixed(2).replace('.', ','));
    setQuantidade(String(item.quantidade));
    setEditando(item.id);
    Alert.alert('Editar produto', 'Os dados estão no formulário acima.');
  }

  function confirmarExclusao(item) {
    Alert.alert('Excluir produto', `Deseja excluir ${item.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => remover(item.id) },
    ]);
  }

  async function remover(id) {
    if (bloqueado) return;
    setSalvando(true);
    try {
      await excluirProduto(id);
      if (editando === id) limpar();
      setAtualizacao((valor) => valor + 1);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível excluir o produto.');
    } finally {
      setSalvando(false);
    }
  }

  function abrirMovimento(item, tipo) {
    setUnidades('');
    setMovimento({ item, tipo });
  }

  async function confirmarMovimento() {
    if (bloqueado || !movimento) return;
    const { item, tipo } = movimento;
    try {
      const produto = new Produto(item.nome, item.categoria, item.preco_centavos / 100, item.quantidade, item.id);
      if (tipo === 'Entrada') produto.entrar(unidades);
      else produto.sair(unidades);
    } catch (error) {
      Alert.alert('Confira a quantidade', error.message);
      return;
    }
    setSalvando(true);
    try {
      await movimentarEstoque(item.id, tipo, unidades);
      setMovimento(null);
      Keyboard.dismiss();
      setAtualizacao((valor) => valor + 1);
      Alert.alert('Estoque atualizado', `${tipo} registrada com sucesso.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível movimentar o estoque. Confira os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Estoque do Mercado</Text>
          <Text style={styles.subtitulo}>Cadastro e controle de produtos.</Text>

          <View style={styles.painel}>
            <Text style={styles.secao}>{editando !== null ? 'Editar produto' : 'Novo produto'}</Text>
            <Text style={styles.rotulo}>Nome</Text>
            <TextInput style={styles.campo} accessibilityLabel="Nome do produto" value={nome} onChangeText={setNome}
              editable={!bloqueado} maxLength={80} placeholder="Ex.: Arroz 5 kg" />
            <Text style={styles.rotulo}>Categoria</Text>
            <Opcoes valores={CATEGORIAS} selecionado={categoria} onChange={setCategoria} disabled={bloqueado} />
            <Text style={styles.rotulo}>Preço unitário (R$)</Text>
            <TextInput style={styles.campo} accessibilityLabel="Preço unitário" value={preco} onChangeText={setPreco}
              editable={!bloqueado} keyboardType="decimal-pad" maxLength={12} placeholder="Ex.: 25,90" />
            <Text style={styles.rotulo}>Quantidade em unidades</Text>
            <TextInput style={styles.campo} accessibilityLabel="Quantidade em unidades" value={quantidade}
              onChangeText={setQuantidade} editable={!bloqueado} keyboardType="number-pad" maxLength={6} placeholder="Ex.: 10" />
            <Botao texto={salvando ? 'Aguarde...' : editando !== null ? 'Salvar alterações' : 'Cadastrar produto'}
              onPress={salvar} disabled={bloqueado} />
            {editando !== null && <Botao texto="Cancelar edição" onPress={limpar} disabled={salvando} secundario />}
          </View>

          <View style={styles.painel}>
            <Text style={styles.secao}>Consultar estoque</Text>
            <Text style={styles.rotulo}>Buscar pelo nome</Text>
            <TextInput style={styles.campo} accessibilityLabel="Buscar produto" value={busca} onChangeText={setBusca}
              editable={!bloqueado} maxLength={80} placeholder="Digite o nome" />
            <Botao texto="Buscar" onPress={() => { Keyboard.dismiss(); setTermo(busca.trim()); }} disabled={bloqueado} secundario />
            <Text style={styles.rotulo}>Categoria</Text>
            <Opcoes valores={['Todas', ...CATEGORIAS]} selecionado={filtro} onChange={setFiltro} disabled={bloqueado} />
            <Text style={styles.rotulo}>Ordenar por</Text>
            <Opcoes valores={['Nome', 'Quantidade']} selecionado={ordem} onChange={setOrdem} disabled={bloqueado} />
          </View>

          {carregando ? <ActivityIndicator size="large" color="#286344" /> : erro ? (
            <View style={styles.painel}>
              <Text style={styles.erro}>{erro}</Text>
              <Botao texto="Tentar novamente" onPress={() => setAtualizacao((valor) => valor + 1)} />
            </View>
          ) : (
            <View>
              <Text style={styles.resultado}>Produtos encontrados: {produtos.length}</Text>
              {editando !== null && <Text style={styles.subtitulo}>Salve ou cancele a edição antes de registrar entradas e saídas.</Text>}
              {produtos.length === 0 && <Text style={styles.subtitulo}>Nenhum produto encontrado para esta consulta.</Text>}
              {produtos.map((item) => (
                <View style={styles.painel} key={item.id}>
                  <Text style={styles.secao}>{item.nome}</Text>
                  <Text style={styles.detalhe}>{item.categoria}</Text>
                  <Text style={styles.detalhe}>Preço: R$ {(item.preco_centavos / 100).toFixed(2).replace('.', ',')}</Text>
                  <Text style={styles.detalhe}>Estoque: {item.quantidade} unidades</Text>
                  {item.quantidade === 0 && <Text style={styles.erro}>Produto sem estoque</Text>}
                  <View style={styles.linha}>
                    <Botao texto="Entrada" onPress={() => abrirMovimento(item, 'Entrada')} disabled={bloqueado || editando !== null} secundario />
                    <Botao texto="Saída" onPress={() => abrirMovimento(item, 'Saída')} disabled={bloqueado || editando !== null} secundario />
                    <Botao texto="Editar" onPress={() => editar(item)} disabled={bloqueado} secundario />
                    <Botao texto="Excluir" onPress={() => confirmarExclusao(item)} disabled={bloqueado} secundario />
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={movimento !== null} transparent animationType="fade" onRequestClose={() => { if (!salvando) setMovimento(null); }}>
        <KeyboardAvoidingView style={styles.fundoModal} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.areaModal} keyboardShouldPersistTaps="handled">
            <View style={styles.painelModal}>
              <Text style={styles.secao}>{movimento?.tipo} de unidades</Text>
              <Text style={styles.detalhe}>{movimento?.item.nome}</Text>
              <Text style={styles.detalhe}>Estoque atual: {movimento?.item.quantidade} unidades</Text>
              <Text style={styles.rotulo}>Quantidade</Text>
              <TextInput style={styles.campo} accessibilityLabel="Quantidade da movimentação" value={unidades}
                onChangeText={setUnidades} editable={!salvando} keyboardType="number-pad" maxLength={6} />
              <Botao texto={salvando ? 'Aguarde...' : 'Confirmar'} onPress={confirmarMovimento} disabled={bloqueado} />
              <Botao texto="Cancelar" onPress={() => setMovimento(null)} disabled={salvando} secundario />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f5f3' },
  conteudo: { padding: 18, paddingBottom: 36, width: '100%', maxWidth: 620, alignSelf: 'center' },
  titulo: { fontSize: 27, fontWeight: '700', color: '#244734' },
  subtitulo: { fontSize: 15, color: '#526459', marginTop: 7, marginBottom: 18, lineHeight: 22 },
  painel: { padding: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d7e1da', borderRadius: 8, marginBottom: 16 },
  secao: { fontSize: 19, fontWeight: '600', color: '#244734', marginBottom: 5 },
  rotulo: { fontSize: 14, color: '#354c3e', marginTop: 13, marginBottom: 7 },
  campo: { borderWidth: 1, borderColor: '#b4c5ba', borderRadius: 5, padding: 12, color: '#263e30', fontSize: 16 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: { paddingHorizontal: 12, paddingVertical: 12, borderRadius: 5, borderWidth: 1, borderColor: '#b4c5ba' },
  selecionada: { backgroundColor: '#dbede1', borderColor: '#286344' },
  textoOpcao: { color: '#244734', fontSize: 14 },
  botao: { backgroundColor: '#286344', borderRadius: 5, paddingVertical: 13, paddingHorizontal: 14, alignItems: 'center', marginTop: 12 },
  textoBotao: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secundario: { backgroundColor: '#eaf0ec' },
  textoSecundario: { color: '#244734', fontWeight: '600', fontSize: 15 },
  desabilitado: { opacity: 0.5 },
  detalhe: { fontSize: 15, color: '#526459', marginTop: 6, lineHeight: 22 },
  resultado: { color: '#354c3e', fontWeight: '600', marginBottom: 14 },
  erro: { color: '#a12d2d', marginTop: 8, lineHeight: 22 },
  fundoModal: { flex: 1, backgroundColor: '#00000066' },
  areaModal: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  painelModal: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '100%', maxWidth: 520, alignSelf: 'center' },
});
