import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Marker, Region } from 'react-native-maps';
import { InstructorCard } from '../../components/display/InstructorCard';
import { InstructorMapMarker } from '../../components/display/InstructorMapMarker';
import { FiltersModal } from '../../components/forms/FiltersModal';
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

const { height: screenHeight } = Dimensions.get('window');

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'SearchScreen'>;

export const AlunoSearchScreen: React.FC<Props> = ({ navigation }) => {
  // Map and location state
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: -23.5505, // São Paulo default
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [localizacaoAtual, setLocalizacaoAtual] = useState<Coordenadas | null>(null);
  
  // Search and filters state
  const [filtros, setFiltros] = useState<FiltrosBusca>({});
  const [resultados, setResultados] = useState<ResultadoBusca | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI state
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  // Get current location and load instructors on mount
  useEffect(() => {
    const initializeScreen = async () => {
      await obterLocalizacaoAtual();
      await buscarInstrutores();
    };
    
    initializeScreen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const obterLocalizacaoAtual = async () => {
    try {
      const resultado = await locationService.getCurrentLocation();
      if (resultado.success && resultado.coordenadas) {
        setLocalizacaoAtual(resultado.coordenadas);
        
        const newRegion = {
          latitude: resultado.coordenadas.latitude,
          longitude: resultado.coordenadas.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        
        setRegion(newRegion);
        
        // Animate to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    } catch {
      console.log('Erro ao obter localização');
    }
  };

  const buscarInstrutores = async (filtrosCustom?: FiltrosBusca) => {
    try {
      setCarregando(true);

      const filtrosAtivos = filtrosCustom || {
        localizacao: localizacaoAtual ? {
          coordenadas: localizacaoAtual,
          raio: 10, // Default 10km radius
        } : undefined,
      };

      const resultado = await searchInstructors(filtrosAtivos, 1, 20);
      setResultados(resultado);
    } catch {
      Alert.alert('Erro', 'Erro ao buscar instrutores. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await buscarInstrutores();
    setRefreshing(false);
  };

  const handleApplyFilters = (newFilters: FiltrosBusca) => {
    setFiltros(newFilters);
    buscarInstrutores(newFilters);
  };

  const handleInstructorPress = (instrutor: InstrutorDisponivel) => {
    navigation.navigate('InstructorDetails', { instructorId: instrutor.id });
  };

  const handleMarkerPress = (instrutor: InstrutorDisponivel) => {
    setSelectedInstructorId(instrutor.id);
    
    // Animate to instructor location
    if (mapRef.current && instrutor.localizacao.coordenadas) {
      mapRef.current.animateToRegion({
        latitude: instrutor.localizacao.coordenadas.latitude,
        longitude: instrutor.localizacao.coordenadas.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const searchFilters = {
        ...filtros,
        endereco: searchQuery,
      };
      buscarInstrutores(searchFilters);
    }
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
      onBookPress={() => handleInstructorPress(item)}
      compact={showMap}
    />
  );

  const renderMapMarkers = () => {
    if (!resultados?.instrutores) return null;

    return resultados.instrutores.map((instrutor) => {
      if (!instrutor.localizacao.coordenadas) return null;

      return (
        <Marker
          key={instrutor.id}
          coordinate={instrutor.localizacao.coordenadas}
          onPress={() => handleMarkerPress(instrutor)}
        >
          <InstructorMapMarker
            instructor={instrutor}
            isSelected={selectedInstructorId === instrutor.id}
          />
        </Marker>
      );
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filtros.data) count++;
    if (filtros.horario) count++;
    if (filtros.generoInstrutor) count++;
    if (filtros.tipoVeiculo) count++;
    if (filtros.precoMaximo) count++;
    if (filtros.avaliacaoMinima) count++;
    return count;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por localização..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchIcon} onPress={handleSearchSubmit}>
            <Text style={styles.searchIconText}>🔍</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
          onPress={() => setShowFiltersModal(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Map */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation
            showsMyLocationButton
            loadingEnabled
            loadingIndicatorColor={theme.colors.primary[500]}
          >
            {renderMapMarkers()}
          </MapView>
          
          {/* Map/List Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, showMap && styles.toggleButtonActive]}
              onPress={() => setShowMap(true)}
            >
              <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>Mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !showMap && styles.toggleButtonActive]}
              onPress={() => setShowMap(false)}
            >
              <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>Lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results Section */}
      <View style={[styles.resultsSection, showMap && styles.resultsSectionWithMap]}>
        {resultados && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {resultados.total} instrutor{resultados.total !== 1 ? 'es' : ''} encontrado{resultados.total !== 1 ? 's' : ''}
            </Text>
            {!showMap && (
              <TouchableOpacity onPress={() => setShowMap(true)}>
                <Text style={styles.showMapText}>Ver no mapa</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Buscando instrutores...</Text>
          </View>
        ) : (
          <FlatList
            data={resultados?.instrutores || []}
            renderItem={renderInstructor}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nenhum instrutor encontrado</Text>
                <Text style={styles.emptyStateText}>
                  Tente ajustar os filtros ou expandir o raio de busca
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Filters Modal */}
      <FiltersModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filtros}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borders.radius.full,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.sm,
  },
  searchIcon: {
    padding: theme.spacing.xs,
  },
  searchIconText: {
    fontSize: theme.typography.fontSize.md,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  filterIcon: {
    fontSize: theme.typography.fontSize.lg,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  mapContainer: {
    height: screenHeight * 0.4,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  toggleContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.full,
    padding: 2,
    ...theme.shadows.sm,
  },
  toggleButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  toggleText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  toggleTextActive: {
    color: theme.colors.text.inverse,
  },
  resultsSection: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  resultsSectionWithMap: {
    maxHeight: screenHeight * 0.6,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  resultsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  showMapText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});