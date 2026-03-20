import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { FormInput } from '../../../components/forms/FormInput';
import { FormImagePicker } from '../../../components/forms/FormImagePicker';
import { theme } from '../../../themes';

interface InstructorProfileFormData {
  primeiroNome: string;
  ultimoNome: string;
  detranId: string;
  licencaNumero: string;
  licencaVencimento: string;
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoAno: string;
  veiculoPlaca: string;
  valorHora: string;
  raioAtendimento: string;
}

interface Props {
  navigation: {
    goBack: () => void;
  };
}

export const EditInstructorProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [licencaDocument, setLicencaDocument] = useState<string | null>(null);
  const [veiculoDocument, setVeiculoDocument] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InstructorProfileFormData>({
    defaultValues: {
      primeiroNome: '',
      ultimoNome: '',
      detranId: '',
      licencaNumero: '',
      licencaVencimento: '',
      veiculoMarca: '',
      veiculoModelo: '',
      veiculoAno: '',
      veiculoPlaca: '',
      valorHora: '',
      raioAtendimento: '10',
    },
  });

  const onSubmit = async () => {
    if (!licencaDocument) {
      Alert.alert('Erro', 'Por favor, faça upload da sua licença do DETRAN');
      return;
    }

    if (!veiculoDocument) {
      Alert.alert('Erro', 'Por favor, faça upload do documento do veículo');
      return;
    }

    setSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar seu perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <Controller
            control={control}
            name="primeiroNome"
            rules={{ required: 'Nome é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Primeiro Nome"
                value={value}
                onChangeText={onChange}
                error={errors.primeiroNome?.message}
                placeholder="Digite seu primeiro nome"
              />
            )}
          />
          <Controller
            control={control}
            name="ultimoNome"
            rules={{ required: 'Sobrenome é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Sobrenome"
                value={value}
                onChangeText={onChange}
                error={errors.ultimoNome?.message}
                placeholder="Digite seu sobrenome"
              />
            )}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Credenciais DETRAN</Text>
          <Controller
            control={control}
            name="detranId"
            rules={{ required: 'ID do DETRAN é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="ID DETRAN"
                value={value}
                onChangeText={onChange}
                error={errors.detranId?.message}
                placeholder="Digite seu ID do DETRAN"
              />
            )}
          />
          <Controller
            control={control}
            name="licencaNumero"
            rules={{ required: 'Número da licença é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Número da Licença"
                value={value}
                onChangeText={onChange}
                error={errors.licencaNumero?.message}
                placeholder="Digite o número da sua licença"
              />
            )}
          />
          <Controller
            control={control}
            name="licencaVencimento"
            rules={{ required: 'Data de vencimento é obrigatória' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Vencimento da Licença"
                value={value}
                onChangeText={onChange}
                error={errors.licencaVencimento?.message}
                placeholder="DD/MM/AAAA"
              />
            )}
          />
          <FormImagePicker
            label="Documento da Licença DETRAN"
            onImageSelect={setLicencaDocument}
            value={licencaDocument || undefined}
            placeholder="Faça upload da sua licença"
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Veículo</Text>
          <Controller
            control={control}
            name="veiculoMarca"
            rules={{ required: 'Marca do veículo é obrigatória' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Marca"
                value={value}
                onChangeText={onChange}
                error={errors.veiculoMarca?.message}
                placeholder="Ex: Volkswagen"
              />
            )}
          />
          <Controller
            control={control}
            name="veiculoModelo"
            rules={{ required: 'Modelo do veículo é obrigatório' }}
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
            rules={{ required: 'Ano do veículo é obrigatório' }}
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
            rules={{ required: 'Placa do veículo é obrigatória' }}
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
            name="valorHora"
            rules={{ required: 'Valor por hora é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Valor por Hora"
                value={value}
                onChangeText={onChange}
                error={errors.valorHora?.message}
                placeholder="Ex: 85,00"
                keyboardType="numeric"
              />
            )}
          />
          <Controller
            control={control}
            name="raioAtendimento"
            rules={{ required: 'Raio de atendimento é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Raio de Atendimento (km)"
                value={value}
                onChangeText={onChange}
                error={errors.raioAtendimento?.message}
                placeholder="Ex: 10"
                keyboardType="numeric"
              />
            )}
          />
          <FormImagePicker
            label="Documento do Veículo"
            onImageSelect={setVeiculoDocument}
            value={veiculoDocument || undefined}
            placeholder="Faça upload do documento do veículo"
          />
        </Card>

        <Button
          title={saving ? 'Salvando...' : 'Salvar Alterações'}
          onPress={handleSubmit(onSubmit)}
          disabled={saving}
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
});
