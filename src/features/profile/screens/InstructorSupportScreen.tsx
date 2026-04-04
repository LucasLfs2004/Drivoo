import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '../../../shared/ui/base/Card';
import { Button } from '../../../shared/ui/base/Button';
import { theme } from '../../../theme';
import { InstrutorProfileStackParamList } from '../../../types/navigation';

type Props = NativeStackScreenProps<InstrutorProfileStackParamList, 'Support'>;

type SupportFaqCategory =
  | 'conta'
  | 'agenda'
  | 'ganhos'
  | 'veiculo'
  | 'plataforma';

interface SupportFaqItem {
  id: string;
  category: SupportFaqCategory;
  question: string;
  answer: string;
  order: number;
}

const SUPPORT_EMAIL = 'suporte@drivoo.com.br';

// Kept as structured data so we can swap the source to an API later
// without changing the rendering model of the screen.
const instructorFaqItems: SupportFaqItem[] = [
  {
    id: 'account-profile-update',
    category: 'conta',
    question: 'Como atualizo minhas informações de perfil?',
    answer:
      'Use a opção de editar perfil para atualizar os campos disponíveis da sua conta, como valor por hora, bio, experiência e dados do veículo.',
    order: 1,
  },
  {
    id: 'schedule-availability',
    category: 'agenda',
    question: 'Como defino minha disponibilidade para receber aulas?',
    answer:
      'Na área de agenda você poderá informar os horários em que está disponível. Se algum período ainda não aparecer, ele pode depender da próxima etapa de integração.',
    order: 2,
  },
  {
    id: 'earnings-visibility',
    category: 'ganhos',
    question: 'Onde acompanho meus ganhos e pagamentos?',
    answer:
      'A aba de ganhos concentra o histórico financeiro, pagamentos recentes e a tendência dos seus resultados conforme os dados disponíveis no backend.',
    order: 3,
  },
  {
    id: 'vehicle-management',
    category: 'veiculo',
    question: 'Posso alterar o veículo cadastrado?',
    answer:
      'Sim. O app permite atualizar o veículo principal com modelo, ano, placa, tipo de câmbio e se você aceita usar o veículo do aluno.',
    order: 4,
  },
  {
    id: 'missing-feature',
    category: 'plataforma',
    question: 'O que fazer se eu não encontrar uma função no app?',
    answer:
      'Algumas áreas ainda estão em evolução. Se algo importante estiver faltando, entre em contato com o suporte para que possamos priorizar a melhoria.',
    order: 5,
  },
];

const categoryLabels: Record<SupportFaqCategory, string> = {
  conta: 'Conta',
  agenda: 'Agenda',
  ganhos: 'Ganhos',
  veiculo: 'Veículo',
  plataforma: 'Plataforma',
};

export const InstructorSupportScreen: React.FC<Props> = ({ navigation }) => {
  const handleEmailSupport = async () => {
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=Suporte%20Instrutor%20Drivoo`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);

      if (!canOpen) {
        Alert.alert('Suporte', `Entre em contato pelo e-mail ${SUPPORT_EMAIL}`);
        return;
      }

      await Linking.openURL(mailtoUrl);
    } catch {
      Alert.alert('Suporte', `Entre em contato pelo e-mail ${SUPPORT_EMAIL}`);
    }
  };

  const sortedFaqItems = [...instructorFaqItems].sort((left, right) => left.order - right.order);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ajuda e Suporte</Text>
          <Text style={styles.subtitle}>
            Encontre respostas rápidas e um canal simples para falar com a equipe.
          </Text>
        </View>

        <Card style={styles.heroCard}>
          <Text style={styles.heroTitle}>Precisa de ajuda com sua conta de instrutor?</Text>
          <Text style={styles.heroDescription}>
            Esta área foi estruturada para crescer no futuro com conteúdo dinâmico vindo da API.
          </Text>
          <Button
            title="Falar com o suporte"
            variant="primary"
            onPress={handleEmailSupport}
            style={styles.heroButton}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dúvidas Frequentes</Text>
          <Text style={styles.sectionDescription}>
            Perguntas organizadas em um formato pronto para futura integração.
          </Text>
        </View>

        {sortedFaqItems.map(item => (
          <Card key={item.id} style={styles.faqCard}>
            <View style={styles.faqTag}>
              <Text style={styles.faqTagText}>{categoryLabels[item.category]}</Text>
            </View>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </Card>
        ))}

        <Card style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contato direto</Text>
          <Text style={styles.contactText}>
            Se sua dúvida não estiver aqui, escreva para {SUPPORT_EMAIL}.
          </Text>
          <Button title="Enviar e-mail" variant="outline" onPress={handleEmailSupport} />
        </Card>
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
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
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
    lineHeight: 22,
  },
  heroCard: {
    marginBottom: theme.spacing.xl,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  heroDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  heroButton: {
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  faqCard: {
    marginBottom: theme.spacing.md,
  },
  faqTag: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borders.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  faqTagText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  question: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  answer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 21,
  },
  contactCard: {
    marginTop: theme.spacing.sm,
  },
  contactTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  contactText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 21,
    marginBottom: theme.spacing.lg,
  },
});
