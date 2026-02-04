import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect, SelectOption } from '../../components/forms/FormSelect';
import { FormDatePicker } from '../../components/forms/FormDatePicker';
import { FilterChips, FilterChip } from '../../components/forms/FilterChips';
import { InstructorCard } from '../../components/display/InstructorCard';
import { theme } from '../../themes';
import { 
  FiltrosBusca, 
  ResultadoBusca, 
  InstrutorDisponivel,
  Coordenadas,
} from '../../types';
import { AlunoSearchStackParamList } from '../../types/navigation';
import { searchInstructors } from '../../mock';
import { locationService } from '../../services';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'SearchScreen'>;

export const AlunoSearchScreen: React.FC<Props> = ({ navigation }) => {
  // Search state
  const [, setFiltros] = useState<FiltrosBusca>({});
  const [resultados, setResultados] = useState<ResultadoBusca | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<Coordenadas | null>(null);
  
  // Form state
  const [endereco, setEndereco] = useState('');
  const [raio, setRaio] = useState('5');
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [generoSelecionado, setGeneroSelecionado] = useState<string[]>([]);
  const [tipoVeiculoSelecionado, setTipoVeiculoSelecionado] = useState<string[]>([]);
  const [precoMaximo, setPrecoMaximo] = useState('');
  const [avaliacaoMinima, setAvaliacaoMinima] = useState('');

  // Filter options
  const raioOptions: SelectOption[] = [
    { label: '1 km', value: '1' },
    { label: '2 km', value: '2' },
    { label: '5 km', value: '5' },
    { label: '10 km', value: '10' },
    { label: '15 km', value: '15' },
    { label: '20 km', value: '20' },
  ];

  const avaliacaoOptions: SelectOption[] = [
    { label: 'Qualquer avaliação', value: '' },
    { label: '4+ estrelas', value: '4' },
    { label: '4.5+ estrelas', value: '4.5' },
    { label: '4.8+ estrelas', value: '4.8' },
  ];

  const generoChips: FilterChip[] = [
    { id: 'masculino', label: 'Masculino', value: 'masculino' },
    { id: 'feminino', label: 'Feminino', value: 'feminino' },
  ];

  const tipoVeiculoChips: FilterChip[] = [
    { id: 'manual', label: 'Manual', value: 'manual' },
    { id: 'automatico', label: 'Automático', value: 'automatico' },
  ];

  // Get current location on component mount
  useEffect(() => {
    obterLocalizacaoAtual();
  }, []);

  const obterLocalizacaoAtual = async () => {
    try {
      const resultado = await locationService.getCurrentLocation();
      if (resultado.success && resultado.coordenadas) {
        setLocalizacaoAtual(resultado.coordenadas);
        const enderecoAtual = await locationService.getAddressFromCoordinates(resultado.coordenadas);
        setEndereco(enderecoAtual);
      }
    } catch (error) {
      console.log('Erro ao obter localização:', error);
    }
  };

  const construirFiltros = useCallback((): FiltrosBusca => {
    const filtrosAtivos: FiltrosBusca = {};

    // Location filter
    if (localizacaoAtual && raio) {
      filtrosAtivos.localizacao = {
        coordenadas: localizacaoAtual,
        raio: parseInt(raio, 10),
      };
    }

    // Date filter
    if (dataSelecionada) {
      filtrosAtivos.data = dataSelecionada;
    }

    // Time filter
    if (horarioInicio && horarioFim) {
      filtrosAtivos.horario = {
        inicio: horarioInicio,
        fim: horarioFim,
      };
    }

    // Gender filter
    if (generoSelecionado.length > 0) {
      filtrosAtivos.generoInstrutor = generoSelecionado[0] as 'masculino' | 'feminino';
    }

    // Vehicle type filter
    if (tipoVeiculoSelecionado.length > 0) {
      filtrosAtivos.tipoVeiculo = tipoVeiculoSelecionado[0] as 'manual' | 'automatico';
    }

    // Price filter
    if (precoMaximo) {
      filtrosAtivos.precoMaximo = parseFloat(precoMaximo);
    }

    // Rating filter
    if (avaliacaoMinima) {
      filtrosAtivos.avaliacaoMinima = parseFloat(avaliacaoMinima);
    }

    return filtrosAtivos;
  }, [
    localizacaoAtual,
    raio,
    dataSelecionada,
    horarioInicio,
    horarioFim,
    generoSelecionado,
    tipoVeiculoSelecionado,
    precoMaximo,
    avaliacaoMinima,
  ]);

  const buscarInstrutores = async (pagina: number = 1, manterResultados: boolean = false) => {
    try {
      if (pagina === 1) {
        setCarregando(true);
      } else {
        setCarregandoMais(true);
      }

      const filtrosAtivos = construirFiltros();
      setFiltros(filtrosAtivos);

      const resultado = await searchInstructors(filtrosAtivos, pagina, 10);

      if (manterResultados && resultados) {
        setResultados({
          ...resultado,
          instrutores: [...resultados.instrutores, ...resultado.instrutores],
        });
      } else {
        setResultados(resultado);
      }
    } catch (_error) {
      Alert.alert('Erro', 'Erro ao buscar instrutores. Tente novamente.');
    } finally {
      setCarregando(false);
      setCarregandoMais(false);
    }
  };

  const carregarMaisInstrutores = () => {
    if (resultados && resultados.temMais && !carregandoMais) {
      buscarInstrutores(resultados.pagina + 1, true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarInstrutores(1);
    setRefreshing(false);
  };

  const limparFiltros = () => {
    setEndereco('');
    setRaio('5');
    setDataSelecionada(null);
    setHorarioInicio('');
    setHorarioFim('');
    setGeneroSelecionado([]);
    setTipoVeiculoSelecionado([]);
    setPrecoMaximo('');
    setAvaliacaoMinima('');
    setResultados(null);
  };

  const handleInstructorPress = (instrutor: InstrutorDisponivel) => {
    // Navigate to instructor details screen
    navigation.navigate('InstructorDetails', { instructorId: instrutor.id });
  };

  const handleBookPress = (instrutor: InstrutorDisponivel) => {
    // Navigate to booking screen
    console.log('Agendar com instrutor:', instrutor.id);
  };

  const renderInstructor = ({ item }: { item: InstrutorDisponivel }) => (
    <InstructorCard
      id={item.id}
      name={`${item.primeiroNome} ${item.ultimoNome}`}
      avatar={item.avatar}
      rating={item.avaliacoes.media}
      reviewCount={item.avaliacoes.quantidade}
      hourlyRate={item.precos.valorHora}
      currency="R$"
      specialties={item.especialidades}
      availability={item.disponibilidade.proximoSlot ? `Próximo slot: ${item.disponibilidade.proximoSlot.toLocaleDateString('pt-BR')}` : 'Disponibilidade a consultar'}
      distance={`${item.localizacao.distancia} km`}
      vehicleType={item.veiculo.transmissao === 'automatico' ? 'automatic' : 'manual'}
      onPress={() => handleInstructorPress(item)}
      onBookPress={() => handleBookPress(item)}
    />
  );

  const renderFooter = () => {
    if (!carregandoMais) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Carregando mais instrutores...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nenhum instrutor encontrado</Text>
      <Text style={styles.emptyStateText}>
        Tente ajustar os filtros ou expandir o raio de busca
      </Text>
      <Button
        title="Limpar Filtros"
        variant="outline"
        onPress={limparFiltros}
        style={styles.clearFiltersButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Buscar Instrutores</Text>
          <Text style={styles.subtitle}>
            Encontre o instrutor perfeito para você
          </Text>
        </View>

        <Card style={styles.filtersCard}>
          <View style={styles.filtersHeader}>
            <Text style={styles.sectionTitle}>Filtros de Busca</Text>
            <TouchableOpacity onPress={limparFiltros}>
              <Text style={styles.clearFiltersText}>Limpar</Text>
            </TouchableOpacity>
          </View>
          
          {/* Location Filters */}
          <FormInput
            label="Localização"
            value={endereco}
            onChangeText={setEndereco}
            placeholder="Digite seu bairro ou CEP"
          />
          
          <FormSelect
            label="Raio de busca"
            options={raioOptions}
            value={raio}
            onSelect={setRaio}
            placeholder="Selecione o raio"
          />

          {/* Date and Time Filters */}
          <FormDatePicker
            label="Data preferida"
            value={dataSelecionada || undefined}
            onDateChange={setDataSelecionada}
            placeholder="Selecione uma data"
          />

          <View style={styles.timeRow}>
            <FormInput
              label="Horário início"
              value={horarioInicio}
              onChangeText={setHorarioInicio}
              placeholder="08:00"
              style={styles.timeInput}
            />
            <FormInput
              label="Horário fim"
              value={horarioFim}
              onChangeText={setHorarioFim}
              placeholder="18:00"
              style={styles.timeInput}
            />
          </View>

          {/* Filter Chips */}
          <FilterChips
            label="Gênero do instrutor"
            chips={generoChips}
            selectedValues={generoSelecionado}
            onSelectionChange={setGeneroSelecionado}
            multiSelect={false}
          />

          <FilterChips
            label="Tipo de veículo"
            chips={tipoVeiculoChips}
            selectedValues={tipoVeiculoSelecionado}
            onSelectionChange={setTipoVeiculoSelecionado}
            multiSelect={false}
          />

          {/* Price and Rating Filters */}
          <FormInput
            label="Preço máximo por hora (R$)"
            value={precoMaximo}
            onChangeText={setPrecoMaximo}
            placeholder="100"
            keyboardType="numeric"
          />

          <FormSelect
            label="Avaliação mínima"
            options={avaliacaoOptions}
            value={avaliacaoMinima}
            onSelect={setAvaliacaoMinima}
            placeholder="Qualquer avaliação"
          />

          <Button
            title="Buscar Instrutores"
            variant="primary"
            onPress={() => buscarInstrutores(1)}
            loading={carregando}
            style={styles.searchButton}
          />
        </Card>

        {/* Results Section */}
        {resultados && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {resultados.total} instrutor{resultados.total !== 1 ? 'es' : ''} encontrado{resultados.total !== 1 ? 's' : ''}
            </Text>
            
            <FlatList
              data={resultados.instrutores}
              renderItem={renderInstructor}
              keyExtractor={(item) => item.id}
              onEndReached={carregarMaisInstrutores}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmptyState}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {!resultados && !carregando && (
          <View style={styles.initialState}>
            <Text style={styles.initialStateText}>
              Use os filtros acima para encontrar instrutores próximos a você
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  filtersCard: {
    marginBottom: theme.spacing.lg,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  clearFiltersText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  timeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  searchButton: {
    marginTop: theme.spacing.md,
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  clearFiltersButton: {
    minWidth: 120,
  },
  initialState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  initialStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});