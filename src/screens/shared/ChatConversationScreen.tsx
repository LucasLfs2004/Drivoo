import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Send } from 'lucide-react-native';

import { AppHeader, Button, Card } from '../../shared/ui/base';
import { theme } from '../../theme';
import type { ChatStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatScreen'>;
type ScreenRouteProp = RouteProp<ChatStackParamList, 'ChatScreen'>;

export const ChatConversationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { participantName } = route.params;
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{ id: string; body: string }>>([]);

  const handleSend = () => {
    const body = draft.trim();

    if (!body) {
      return;
    }

    setMessages(current => [...current, { id: String(Date.now()), body }]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppHeader
          title={participantName}
          subtitle="Conversa da aula"
          onBackPress={navigation.goBack}
        />

        <View style={styles.messagesArea}>
          {messages.length ? (
            <View style={styles.messageList}>
              {messages.map(message => (
                <View key={message.id} style={styles.messageBubble}>
                  <Text style={styles.messageText}>{message.body}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhuma mensagem ainda</Text>
              <Text style={styles.emptyMessage}>Combine os detalhes da sua aula por aqui.</Text>
            </Card>
          )}
        </View>

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Mensagem"
            placeholderTextColor={theme.colors.text.tertiary}
            style={styles.input}
          />
          <Button
            title="Enviar"
            icon={Send}
            disabled={!draft.trim()}
            style={styles.sendButton}
            onPress={handleSend}
          />
        </View>
      </View>
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
  messagesArea: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    rowGap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  messageList: {
    flex: 1,
    justifyContent: 'flex-end',
    rowGap: theme.spacing.sm,
  },
  messageBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    borderRadius: theme.borders.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
  },
  messageText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borders.radius.md,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  sendButton: {
    minWidth: 96,
  },
});
