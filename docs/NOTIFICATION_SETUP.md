# Sistema de Notificações - Drivoo

## Visão Geral

O sistema de notificações do Drivoo fornece notificações push para agendamentos e mensagens de chat. A implementação atual fornece a infraestrutura base e pode ser estendida com bibliotecas de notificação push reais.

## Arquitetura

### Componentes Principais

1. **NotificationService** (`src/services/notificationService.ts`)
   - Serviço singleton para gerenciar notificações
   - Persiste notificações usando AsyncStorage
   - Fornece hooks para integração com push notifications

2. **useNotifications Hook** (`src/hooks/useNotifications.ts`)
   - Hook React para usar notificações em componentes
   - Gerencia estado de notificações, permissões e configurações
   - Fornece ações para enviar e gerenciar notificações

3. **NotificationContext** (`src/contexts/NotificationContext.tsx`)
   - Provider de contexto para acesso global às notificações
   - Auto-registra usuários para push notifications no login
   - Integra com AuthContext

4. **Telas de UI**
   - `NotificationListScreen`: Lista todas as notificações
   - `NotificationSettingsScreen`: Gerencia preferências de notificação

## Tipos de Notificação

### Notificações de Agendamento
- `booking_new`: Nova aula agendada
- `booking_confirmed`: Aula confirmada
- `booking_cancelled`: Aula cancelada
- `booking_reminder`: Lembrete antes da aula

### Notificações de Chat
- `chat_message`: Nova mensagem recebida
- `chat_new_conversation`: Nova conversa iniciada

### Notificações de Pagamento
- `payment_success`: Pagamento bem-sucedido
- `payment_failed`: Falha no pagamento

## Uso Básico

### 1. Adicionar NotificationProvider ao App

```typescript
import { NotificationProvider } from './src/contexts/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {/* Resto do app */}
      </NotificationProvider>
    </AuthProvider>
  );
}
```

### 2. Usar Notificações em Componentes

```typescript
import { useNotificationContext } from '../contexts/NotificationContext';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    sendBookingNotification,
    markAsRead,
  } = useNotificationContext();

  // Enviar notificação de agendamento
  const handleBooking = async () => {
    await sendBookingNotification(userId, 'booking_new', {
      bookingId: '123',
      instructorName: 'João Silva',
      date: '2024-03-15',
      timeSlot: '14:00',
    });
  };

  // Marcar como lida
  const handlePress = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  return (
    <View>
      <Text>Notificações não lidas: {unreadCount}</Text>
      {/* Renderizar notificações */}
    </View>
  );
}
```

### 3. Enviar Notificações de Chat

```typescript
const { sendChatNotification } = useNotificationContext();

await sendChatNotification(recipientUserId, 'chat_message', {
  conversationId: 'conv_123',
  senderId: currentUserId,
  senderName: 'Maria Santos',
  messagePreview: 'Olá! Podemos confirmar o horário?',
  messageType: 'text',
});
```

## Configurações de Notificação

Os usuários podem gerenciar suas preferências através da tela de configurações:

```typescript
interface NotificationSettings {
  enabled: boolean;                // Master toggle
  bookingNotifications: boolean;   // Notificações de agendamento
  chatNotifications: boolean;      // Notificações de chat
  reminderNotifications: boolean;  // Lembretes
  sound: boolean;                  // Som
  vibration: boolean;              // Vibração
}
```

## Integração com Push Notifications Reais

### Opção 1: Firebase Cloud Messaging (Recomendado)

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

**Modificações necessárias em `notificationService.ts`:**

```typescript
import messaging from '@react-native-firebase/messaging';

async registerForPushNotifications(userId: string) {
  // Solicitar permissões
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    return null;
  }

  // Obter token FCM
  const token = await messaging().getToken();
  
  // Enviar token para backend
  await sendTokenToBackend(userId, token);
  
  return {
    token,
    platform: Platform.OS,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
```

**Listener de mensagens em background:**

```typescript
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in background:', remoteMessage);
  // Processar notificação
});
```

### Opção 2: Notifee (Para notificações locais avançadas)

```bash
npm install @notifee/react-native
```

**Exibir notificação local:**

```typescript
import notifee from '@notifee/react-native';

async displayNotification(notification: NotificationData) {
  // Criar canal (Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Exibir notificação
  await notifee.displayNotification({
    title: notification.title,
    body: notification.body,
    data: notification.data,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
    },
  });
}
```

**Agendar lembretes:**

```typescript
import notifee, { TriggerType } from '@notifee/react-native';

async scheduleReminder(bookingData: BookingNotificationData, triggerTime: Date) {
  await notifee.createTriggerNotification(
    {
      title: 'Lembrete de Aula',
      body: `Sua aula começa em 1 hora`,
      data: bookingData,
      android: { channelId: 'reminders' },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: triggerTime.getTime(),
    }
  );
}
```

## Configuração de Backend

Para um sistema completo de push notifications, você precisará:

1. **Endpoint para registrar tokens:**
```typescript
POST /api/notifications/register
{
  "userId": "user_123",
  "token": "fcm_token_...",
  "platform": "ios"
}
```

2. **Endpoint para enviar notificações:**
```typescript
POST /api/notifications/send
{
  "userId": "user_123",
  "type": "booking_new",
  "title": "Nova Aula Agendada",
  "body": "João Silva agendou uma aula...",
  "data": { ... }
}
```

3. **Integração com FCM/APNS:**
   - Configure Firebase Cloud Messaging
   - Configure Apple Push Notification Service
   - Implemente lógica de envio no backend

## Permissões

### iOS (Info.plist)
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.VIBRATE"/>
```

## Testes

### Testar Notificações Locais

```typescript
// Em qualquer componente ou tela
const { sendBookingNotification } = useNotificationContext();

// Enviar notificação de teste
await sendBookingNotification('test_user', 'booking_new', {
  bookingId: 'test_123',
  instructorName: 'Instrutor Teste',
  date: '2024-03-15',
  timeSlot: '14:00',
});
```

### Testar Permissões

```typescript
const { requestPermissions, permissions } = useNotificationContext();

// Solicitar permissões
const result = await requestPermissions();
console.log('Permissions:', result);
```

## Melhores Práticas

1. **Sempre verificar permissões** antes de enviar notificações
2. **Respeitar configurações do usuário** - não enviar se desabilitado
3. **Fornecer contexto claro** nos títulos e corpos das notificações
4. **Implementar deep linking** para navegar para conteúdo relevante
5. **Limitar frequência** para evitar spam de notificações
6. **Testar em ambas as plataformas** (iOS e Android)
7. **Implementar analytics** para rastrear engajamento

## Troubleshooting

### Notificações não aparecem
- Verificar se permissões foram concedidas
- Verificar se notificações estão habilitadas nas configurações
- Verificar logs do console para erros

### Token não registrado
- Verificar conexão de rede
- Verificar configuração do Firebase
- Verificar se o app tem permissões necessárias

### Notificações não navegam corretamente
- Verificar implementação de deep linking
- Verificar dados da notificação
- Verificar configuração de navegação

## Próximos Passos

1. Integrar Firebase Cloud Messaging
2. Implementar backend para envio de notificações
3. Adicionar analytics de notificações
4. Implementar notificações agendadas (lembretes)
5. Adicionar suporte a notificações ricas (imagens, ações)
6. Implementar badges de notificação no ícone do app
7. Adicionar testes automatizados

## Recursos

- [React Native Firebase](https://rnfirebase.io/)
- [Notifee Documentation](https://notifee.app/)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [APNS Documentation](https://developer.apple.com/documentation/usernotifications)
