import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme';
import type { InstrutorDisponivel } from '../types/domain';
import { InstructorCard } from './InstructorCard';

interface InstructorSearchListProps {
  data: InstrutorDisponivel[];
  refreshing: boolean;
  onRefresh: () => void;
  onInstructorPress: (instructor: InstrutorDisponivel) => void;
}

export const InstructorSearchList: React.FC<InstructorSearchListProps> = ({
  data,
  refreshing,
  onRefresh,
  onInstructorPress,
}) => {
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
      availability={
        item.disponibilidade.proximoSlot
          ? `Próximo slot: ${item.disponibilidade.proximoSlot.toLocaleDateString('pt-BR')}`
          : undefined
      }
      distance={
        item.localizacao.distancia != null
          ? `${item.localizacao.distancia.toFixed(1)} km`
          : undefined
      }
      vehicleType={
        item.veiculo.transmissao === 'automatico' ? 'automatic' : 'manual'
      }
      onPress={() => onInstructorPress(item)}
      onBookPress={() => onInstructorPress(item)}
    />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderInstructor}
      keyExtractor={item => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>
            Nenhum instrutor encontrado
          </Text>
          <Text style={styles.emptyStateText}>
            Tente ajustar os filtros ou expandir o raio de busca
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
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
