import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { FormInput, FormSelect } from '../../../shared/ui/forms';
import { theme } from '../../../theme';
import {
  useCreateInstructorVehicleMutation,
  useDeleteInstructorVehicleMutation,
  useInstructorProfileUpdateMutation,
  useInstructorVehiclesQuery,
  useMyInstructorProfileQuery,
  useUpdateInstructorVehicleMutation,
} from '../../instructors';

interface InstructorProfileFormData {
  genero: '' | 'M' | 'F' | 'Outro';
  experienciaAnos: string;
  valorHora: string;
  bio: string;
  tags: string;
  veiculoModelo: string;
  veiculoAno: string;
  veiculoPlaca: string;
  tipoCambio: '' | 'MANUAL' | 'AUTOMATICO';
  aceitaVeiculoAluno: boolean;
}

interface Props {
  navigation: {
    goBack: () => void;
  };
}

export const EditInstructorProfileScreen: React.FC<Props> = ({ navigation }) => {
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: hasProfileError,
  } = useMyInstructorProfileQuery();
  const {
    data: vehicles = [],
    isLoading: isLoadingVehicles,
  } = useInstructorVehiclesQuery();
  const updateProfileMutation = useInstructorProfileUpdateMutation();
  const createVehicleMutation = useCreateInstructorVehicleMutation();
  const updateVehicleMutation = useUpdateInstructorVehicleMutation();
  const deleteVehicleMutation = useDeleteInstructorVehicleMutation();

  const primaryVehicle = vehicles.find(vehicle => vehicle.ativo) ?? vehicles[0];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InstructorProfileFormData>({
    defaultValues: {
      genero: '',
      experienciaAnos: '',
      valorHora: '',
      bio: '',
      tags: '',
      veiculoModelo: '',
      veiculoAno: '',
      veiculoPlaca: '',
      tipoCambio: '',
      aceitaVeiculoAluno: false,
    },
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    reset({
      genero:
        profile.genero === 'feminino'
          ? 'F'
          : profile.genero === 'masculino'
            ? 'M'
            : profile.genero === 'outro'
              ? 'Outro'
              : '',
      experienciaAnos: String(profile.experienciaAnos ?? 0),
      valorHora: String(profile.precos.valorHora ?? ''),
      bio: profile.bio ?? '',
      tags: profile.especialidades.join(', '),
      veiculoModelo: primaryVehicle?.modelo ?? profile.veiculo.modelo ?? '',
      veiculoAno: String(primaryVehicle?.ano ?? profile.veiculo.ano ?? ''),
      veiculoPlaca: primaryVehicle?.placa ?? '',
      tipoCambio:
        primaryVehicle?.transmissao === 'automatico' || profile.veiculo.transmissao === 'automatico'
          ? 'AUTOMATICO'
          : primaryVehicle?.transmissao === 'manual' || profile.veiculo.transmissao === 'manual'
            ? 'MANUAL'
            : '',
      aceitaVeiculoAluno:
        primaryVehicle?.aceitaVeiculoAluno ?? profile.veiculo.aceitaVeiculoAluno,
    });
  }, [primaryVehicle, profile, reset]);

  const saveProfile = async (data: InstructorProfileFormData) => {
    const experienciaAnos = Number.parseInt(data.experienciaAnos || '0', 10);
    const valorHora = Number.parseFloat(data.valorHora.replace(',', '.'));
    const tags = data.tags
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    const hasVehicleData = Boolean(
      data.veiculoModelo.trim() ||
      data.veiculoAno.trim() ||
      data.veiculoPlaca.trim() ||
      data.tipoCambio
    );

    try {
      await updateProfileMutation.mutateAsync({
        valor_hora: Number.isFinite(valorHora) ? valorHora : null,
        experiencia_anos: Number.isFinite(experienciaAnos) ? experienciaAnos : 0,
        bio: data.bio.trim() || null,
        tags,
        genero: data.genero || null,
      });

      if (hasVehicleData && data.tipoCambio) {
        const vehiclePayload = {
          modelo: data.veiculoModelo.trim(),
          ano: data.veiculoAno.trim() ? Number.parseInt(data.veiculoAno, 10) : null,
          placa: data.veiculoPlaca.trim() || null,
          tipo_cambio: data.tipoCambio,
          aceita_veiculo_aluno: data.aceitaVeiculoAluno,
        } as const;

        if (primaryVehicle) {
          await updateVehicleMutation.mutateAsync({
            vehicleId: primaryVehicle.id,
            payload: vehiclePayload,
          });
        } else {
          await createVehicleMutation.mutateAsync(vehiclePayload);
        }
      }

      Alert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar seu perfil. Tente novamente.');
    }
  };

  const handleDeleteVehicle = () => {
    if (!primaryVehicle) {
      return;
    }

    Alert.alert('Remover veículo', 'Deseja remover o veículo atual?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteVehicleMutation.mutateAsync(primaryVehicle.id);
            reset({
              ...(profile
                ? {
                    genero:
                      profile.genero === 'feminino'
                        ? 'F'
                        : profile.genero === 'masculino'
                          ? 'M'
                          : profile.genero === 'outro'
                            ? 'Outro'
                            : '',
                    experienciaAnos: String(profile.experienciaAnos ?? 0),
                    valorHora: String(profile.precos.valorHora ?? ''),
                    bio: profile.bio ?? '',
                    tags: profile.especialidades.join(', '),
                  }
                : {}),
              veiculoModelo: '',
              veiculoAno: '',
              veiculoPlaca: '',
              tipoCambio: '',
              aceitaVeiculoAluno: false,
            });
            Alert.alert('Sucesso', 'Veículo removido com sucesso.');
          } catch {
            Alert.alert('Erro', 'Não foi possível remover o veículo.');
          }
        },
      },
    ]);
  };

  const isSaving =
    updateProfileMutation.isPending ||
    createVehicleMutation.isPending ||
    updateVehicleMutation.isPending ||
    deleteVehicleMutation.isPending;

  if (isLoadingProfile || isLoadingVehicles) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Carregando dados do perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasProfileError || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Nao foi possivel carregar os dados do instrutor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.subtitle}>Mantenha suas informações atualizadas</Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil Profissional</Text>
          <Controller
            control={control}
            name="genero"
            render={({ field: { onChange, value } }) => (
              <FormSelect
                label="Genero"
                value={value}
                onSelect={(selectedValue) =>
                  onChange(selectedValue as InstructorProfileFormData['genero'])
                }
                options={[
                  { label: 'Nao informar', value: '' },
                  { label: 'Masculino', value: 'M' },
                  { label: 'Feminino', value: 'F' },
                  { label: 'Outro', value: 'Outro' },
                ]}
              />
            )}
          />
          <Controller
            control={control}
            name="experienciaAnos"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Experiência (anos)"
                value={value}
                onChangeText={onChange}
                error={errors.experienciaAnos?.message}
                placeholder="Ex: 5"
                keyboardType="numeric"
              />
            )}
          />
          <Controller
            control={control}
            name="valorHora"
            rules={{ required: 'Valor por hora é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Valor por hora"
                value={value}
                onChangeText={onChange}
                error={errors.valorHora?.message}
                placeholder="Ex: 120"
                keyboardType="numeric"
              />
            )}
          />
          <Controller
            control={control}
            name="tags"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Especialidades"
                value={value}
                onChangeText={onChange}
                error={errors.tags?.message}
                placeholder="Ex: Aulas noturnas, câmbio automático"
              />
            )}
          />
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Bio"
                value={value}
                onChangeText={onChange}
                error={errors.bio?.message}
                placeholder="Fale um pouco sobre sua experiência"
                multiline
                numberOfLines={4}
                style={styles.multilineInput}
              />
            )}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          <Controller
            control={control}
            name="veiculoModelo"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Modelo"
                value={value}
                onChangeText={onChange}
                error={errors.veiculoModelo?.message}
                placeholder="Ex: Gol"
              />
            )}
          />
          <Controller
            control={control}
            name="veiculoAno"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Ano"
                value={value}
                onChangeText={onChange}
                error={errors.veiculoAno?.message}
                placeholder="Ex: 2022"
                keyboardType="numeric"
              />
            )}
          />
          <Controller
            control={control}
            name="veiculoPlaca"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Placa"
                value={value}
                onChangeText={onChange}
                error={errors.veiculoPlaca?.message}
                placeholder="ABC-1234"
                autoCapitalize="characters"
              />
            )}
          />
          <Controller
            control={control}
            name="tipoCambio"
            render={({ field: { onChange, value } }) => (
              <FormSelect
                label="Transmissão"
                value={value}
                onSelect={(selectedValue) =>
                  onChange(selectedValue as InstructorProfileFormData['tipoCambio'])
                }
                options={[
                  { label: 'Selecione', value: '' },
                  { label: 'Manual', value: 'MANUAL' },
                  { label: 'Automático', value: 'AUTOMATICO' },
                ]}
              />
            )}
          />
          <Controller
            control={control}
            name="aceitaVeiculoAluno"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.switchTextBlock}>
                  <Text style={styles.switchLabel}>Aceita veículo do aluno</Text>
                  <Text style={styles.switchDescription}>
                    Permita usar o veículo do aluno quando fizer sentido.
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{
                    false: theme.colors.neutral[300],
                    true: theme.colors.primary[300],
                  }}
                  thumbColor={value ? theme.colors.primary[500] : theme.colors.neutral[100]}
                />
              </View>
            )}
          />
          {primaryVehicle ? (
            <Button
              title="Remover Veículo"
              variant="destructive"
              onPress={handleDeleteVehicle}
              disabled={isSaving}
              style={styles.removeVehicleButton}
            />
          ) : null}
        </Card>

        <Button
          title={isSaving ? 'Salvando...' : 'Salvar Alterações'}
          onPress={handleSubmit(saveProfile)}
          disabled={isSaving}
          style={styles.saveButton}
        />
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.semantic.error,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginBottom: theme.spacing.xl,
  },
  multilineInput: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  switchTextBlock: {
    flex: 1,
  },
  switchLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  switchDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  removeVehicleButton: {
    marginTop: theme.spacing.sm,
  },
});
