import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../base/Button';
import { FormInput } from './FormInput';
import { FormSelect, SelectOption } from './FormSelect';
import { FormDatePicker } from './FormDatePicker';
import { FilterChips, FilterChip } from './FilterChips';
import { theme } from '../../../theme';
import { FiltrosBusca } from '../../../types';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FiltrosBusca) => void;
  initialFilters?: FiltrosBusca;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialFilters = {},
}) => {
  // Form state
  const [endereco, setEndereco] = useState(initialFilters.localizacao?.endereco || '');
  const [raio, setRaio] = useState(initialFilters.localizacao?.raio?.toString() || '5');
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(initialFilters.data || null);
  const [horarioInicio, setHorarioInicio] = useState(initialFilters.horario?.inicio || '');
  const [horarioFim, setHorarioFim] = useState(initialFilters.horario?.fim || '');
  const [generoSelecionado, setGeneroSelecionado] = useState<string[]>(
    initialFilters.generoInstrutor ? [initialFilters.generoInstrutor] : []
  );
  const [tipoVeiculoSelecionado, setTipoVeiculoSelecionado] = useState<string[]>(
    initialFilters.tipoVeiculo ? [initialFilters.tipoVeiculo] : []
  );
  const [precoMaximo, setPrecoMaximo] = useState(initialFilters.precoMaximo?.toString() || '');
  const [avaliacaoMinima, setAvaliacaoMinima] = useState(initialFilters.avaliacaoMinima?.toString() || '');

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

  const handleApplyFilters = () => {
    const filtros: FiltrosBusca = {};

    // Location filter
    if (raio) {
      filtros.localizacao = {
        raio: parseInt(raio, 10),
        endereco,
      };
    }

    // Date filter
    if (dataSelecionada) {
      filtros.data = dataSelecionada;
    }

    // Time filter
    if (horarioInicio && horarioFim) {
      filtros.horario = {
        inicio: horarioInicio,
        fim: horarioFim,
      };
    }

    // Gender filter
    if (generoSelecionado.length > 0) {
      filtros.generoInstrutor = generoSelecionado[0] as 'masculino' | 'feminino';
    }

    // Vehicle type filter
    if (tipoVeiculoSelecionado.length > 0) {
      filtros.tipoVeiculo = tipoVeiculoSelecionado[0] as 'manual' | 'automatico';
    }

    // Price filter
    if (precoMaximo) {
      filtros.precoMaximo = parseFloat(precoMaximo);
    }

    // Rating filter
    if (avaliacaoMinima) {
      filtros.avaliacaoMinima = parseFloat(avaliacaoMinima);
    }

    onApplyFilters(filtros);
    onClose();
  };

  const handleClearFilters = () => {
    setEndereco('');
    setRaio('5');
    setDataSelecionada(null);
    setHorarioInicio('');
    setHorarioFim('');
    setGeneroSelecionado([]);
    setTipoVeiculoSelecionado([]);
    setPrecoMaximo('');
    setAvaliacaoMinima('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filtros</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Location Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localização</Text>
            
            <FormInput
              label="Endereço"
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
          </View>

          {/* Date and Time Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data e Horário</Text>
            
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
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferências</Text>
            
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
          </View>

          {/* Price and Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preço e Avaliação</Text>
            
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
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Aplicar Filtros"
            variant="primary"
            onPress={handleApplyFilters}
            style={styles.applyButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  clearText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  applyButton: {
    marginBottom: theme.spacing.sm,
  },
});