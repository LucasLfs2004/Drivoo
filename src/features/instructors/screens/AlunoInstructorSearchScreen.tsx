import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapView, { Region } from 'react-native-maps';
import { InstructorSearchList } from '../components/InstructorSearchList';
import { InstructorSearchMap } from '../components/InstructorSearchMap';
import { FiltersModal } from '../../../shared/ui/forms';
import { theme } from '../../../theme';
import {
  FiltrosBusca,
  InstrutorDisponivel,
  Coordenadas,
} from '../../../types';
import { AlunoSearchStackParamList } from '../../../types/navigation';
import { locationService } from '../../../services';
import { Filter, Search } from 'lucide-react-native';
import { scale } from '@/utils';
import { useInstructorSearchQuery } from '../hooks/useInstructorSearchQuery';

type Props = NativeStackScreenProps<AlunoSearchStackParamList, 'SearchScreen'>;

export const AlunoInstructorSearchScreen: React.FC<Props> = ({ navigation }) => {
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
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

  // UI state
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const latitude = localizacaoAtual?.latitude ?? region.latitude;
  const longitude = localizacaoAtual?.longitude ?? region.longitude;

  const {
    data: resultados,
    isLoading: carregando,
    refetch,
    isRefetching,
    error,
  } = useInstructorSearchQuery({
    filtros,
    latitude,
    longitude,
    enabled: true,
  });

  // Get current location and load instructors on mount
  useEffect(() => {
    const initializeScreen = async () => {
      await obterLocalizacaoAtual();
    };

    initializeScreen();
  }, []);

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

  const onRefresh = async () => {
    await refetch();
  };

  const handleApplyFilters = (newFilters: FiltrosBusca) => {
    setFiltros(newFilters);
  };

  const handleInstructorPress = (instrutor: InstrutorDisponivel) => {
    navigation.navigate('InstructorDetails', {
      instructorId: instrutor.id,
      instructorSummary: instrutor,
    });
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
    setAppliedSearchQuery(searchQuery.trim().toLowerCase());
  };

  const filteredInstructors = (resultados?.instrutores || []).filter(item => {
    if (!appliedSearchQuery) {
      return true;
    }

    const searchableText = [
      item.primeiroNome,
      item.ultimoNome,
      ...item.especialidades,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(appliedSearchQuery);
  });

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
            placeholder="Buscar por nome ou especialidade..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchIcon} onPress={handleSearchSubmit}>
            {/* <Text style={styles.searchIconText}>🔍</Text> */}
            <Search width={scale(20)} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
          onPress={() => setShowFiltersModal(true)}
        >
          <Filter width={scale(22)} color={theme.colors.neutral[700]} />
          {/* <Text style={styles.filterIcon}>⚙️</Text> */}
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showMap && styles.toggleButtonActive]}
          onPress={() => setShowMap(false)}
        >
          <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showMap && styles.toggleButtonActive]}
          onPress={() => setShowMap(true)}
        >
          <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>Mapa</Text>
        </TouchableOpacity>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        {resultados && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {filteredInstructors.length} instrutor{filteredInstructors.length !== 1 ? 'es' : ''} encontrado{filteredInstructors.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Buscando instrutores...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Erro ao buscar instrutores</Text>
            <Text style={styles.emptyStateText}>
              Tente atualizar a busca novamente.
            </Text>
          </View>
        ) : showMap ? (
          <InstructorSearchMap
            mapRef={mapRef}
            region={region}
            onRegionChangeComplete={setRegion}
            data={filteredInstructors}
            selectedInstructorId={selectedInstructorId}
            onMarkerPress={handleMarkerPress}
          />
        ) : (
          <InstructorSearchList
            data={filteredInstructors}
            refreshing={isRefetching}
            onRefresh={onRefresh}
            onInstructorPress={handleInstructorPress}
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
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
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
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.full,
    padding: 2,
    ...theme.shadows.sm,
    alignSelf: 'flex-start',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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
  resultsHeader: {
    flexDirection: 'row',
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
