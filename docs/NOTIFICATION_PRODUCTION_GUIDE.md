# Guia de Implementação de Notificações Push - Drivoo

## Visão Geral

Este documento descreve o processo completo para implementar notificações push em produção no Drivoo, integrando o frontend React Native com o backend via Firebase Cloud Messaging (FCM).

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Firebase](#configuração-do-firebase)
3. [Implementação no Frontend](#implementação-no-frontend)
4. [Implementação no Backend](#implementação-no-backend)
5. [Fluxos de Notificação](#fluxos-de-notificação)
6. [Testes](#testes)
7. [Monitoramento](#monitoramento)

---

## Pré-requisitos

### Contas Necessárias

- [ ] Conta Google/Firebase (gratuita)
- [ ] Apple Developer Account ($99/ano) - para iOS
- [ ] Conta no console do Google Play - para Android
- [ ] Servidor backend configurado (Node.js, Python, etc.)

### Conhecimentos Técnicos

- React Native e TypeScript
- Backend (Node.js/Python/etc.)
- Conceitos de push notifications
- Configuração de certificados iOS/Android

---

## Configuração do Firebase

### Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `drivoo-production` (ou similar)
4. Habilite Google Analytics (recomendado)
5. Aceite os termos e crie o projeto

### Passo 2: Adicionar App Android

1. No Firebase Console, clique no ícone Android
2. Preencha os dados:
   - **Package name**: `com.drivoo` (deve corresponder ao `android/app/build.gradle`)
   - **App nickname**: `Drivoo Android`
   - **SHA-1**: Obtenha executando:
     ```bash
     cd android
     ./gradlew signingReport
     ```
3. Baixe o arquivo `google-services.json`
4. Coloque em `android/app/google-services.json`

### Passo 3: Adicionar App iOS

1. No Firebase Console, clique no ícone iOS
2. Preencha os dados:
   - **Bundle ID**: `com.drivoo` (deve corresponder ao Xcode)
   - **App nickname**: `Drivoo iOS`
3. Baixe o arquivo `GoogleService-Info.plist`
4. Adicione ao projeto Xcode em `ios/Drivoo/`

### Passo 4: Configurar APNs (Apple Push Notification service)

1. Acesse [Apple Developer Portal](https://developer.apple.com/)
2. Vá em "Certificates, Identifiers & Profiles"
3. Crie um **APNs Key**:
   - Keys → Create a Key
   - Nome: "Drivoo APNs Key"
   - Habilite "Apple Push Notifications service (APNs)"
   - Baixe o arquivo `.p8`
4. No Firebase Console:
   - Project Settings → Cloud Messaging → iOS
   - Upload do arquivo `.p8`
   - Preencha Key ID e Team ID

### Passo 5: Obter Server Key (para Backend)

1. No Firebase Console:
   - Project Settings → Cloud Messaging
   - Copie o **Server Key** (será usado no backend)
   - Copie o **Sender ID**

---

## Implementação no Frontend

### Task 1: Instalar Dependências

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
```

**Tempo estimado**: 15 minutos

### Task 2: Configurar Firebase no Android

**Arquivo**: `android/build.gradle`

```gradle
buildscript {
  dependencies {
    // Adicionar
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

**Arquivo**: `android/app/build.gradle`

```gradle
// No final do arquivo
apply plugin: 'com.google.gms.google-services'
```

**Tempo estimado**: 10 minutos

### Task 3: Configurar Firebase no iOS

```bash
cd ios
pod install
```

**Arquivo**: `ios/Drivoo/AppDelegate.mm`

```objc
#import <Firebase.h>

- (BOOL)application:(UIApplication *)application 
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure]; // Adicionar esta linha
  // ... resto do código
}
```

**Tempo estimado**: 15 minutos

### Task 4: Atualizar NotificationService com Firebase

**Arquivo**: `src/services/notificationService.ts`

Substitua os métodos mock pelos reais:

```typescript
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
  // ... código existente ...

  /**
   * Solicitar permissões (versão com Firebase)
   */
  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      const status: NotificationPermissionStatus = {
        granted: enabled,
        canAskAgain: authStatus === messaging.AuthorizationStatus.NOT_DETERMINED,
        status: enabled ? 'granted' : 'denied',
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.PERMISSION,
        JSON.stringify(status)
      );

      return status;
    } catch (error) {
      console.error('[NotificationService] Permission request failed:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  /**
   * Registrar para push notifications (versão com Firebase)
   */
  async registerForPushNotifications(
    userId: string
  ): Promise<PushNotificationToken | null> {
    try {
      const currentPermissions = await this.checkPermissions();
      
      if (!currentPermissions.granted && currentPermissions.status === 'undetermined') {
        const permissions = await this.requestPermissions();
        if (!permissions.granted) {
          console.warn('[NotificationService] Permissions not granted');
          return null;
        }
      } else if (!currentPermissions.granted) {
        console.warn('[NotificationService] Permissions not granted');
        return null;
      }

      // Obter token FCM real
      const fcmToken = await messaging().getToken();
      
      const token: PushNotificationToken = {
        token: fcmToken,
        platform: Platform.OS as 'ios' | 'android',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
      
      // Enviar token para o backend
      await this.sendTokenToBackend(userId, fcmToken);
      
      console.log('[NotificationService] Push token registered:', fcmToken);
      
      return token;
    } catch (error) {
      console.error('[NotificationService] Push registration failed:', error);
      return null;
    }
  }

  /**
   * Enviar token para o backend
   */
  private async sendTokenToBackend(
    userId: string,
    token: string
  ): Promise<void> {
    try {
      // Substituir pela URL real da sua API
      const response = await fetch('https://api.drivoo.com/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Adicionar token de autenticação se necessário
        },
        body: JSON.stringify({
          userId,
          token,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token with backend');
      }
    } catch (error) {
      console.error('[NotificationService] Failed to send token to backend:', error);
      throw error;
    }
  }

  /**
   * Exibir notificação usando Notifee
   */
  private async displayNotification(
    notification: NotificationData
  ): Promise<void> {
    try {
      // Criar canal para Android
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Notificações Padrão',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

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
          sound: 'default',
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });

      console.log('[NotificationService] Notification displayed');
    } catch (error) {
      console.error('[NotificationService] Display failed:', error);
    }
  }

  /**
   * Agendar lembrete usando Notifee
   */
  async scheduleReminder(
    userId: string,
    bookingData: BookingNotificationData,
    triggerTime: Date
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      if (!settings?.enabled || !settings?.reminderNotifications) {
        console.log('[NotificationService] Reminder notifications disabled');
        return null;
      }

      const channelId = await notifee.createChannel({
        id: 'reminders',
        name: 'Lembretes de Aula',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      const notificationId = await notifee.createTriggerNotification(
        {
          title: 'Lembrete de Aula',
          body: `Sua aula começa em breve`,
          data: bookingData as Record<string, any>,
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            sound: 'default',
          },
          ios: {
            sound: 'default',
          },
        },
        {
          type: notifee.TriggerType.TIMESTAMP,
          timestamp: triggerTime.getTime(),
        }
      );

      console.log('[NotificationService] Reminder scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Schedule reminder failed:', error);
      return null;
    }
  }

  /**
   * Cancelar lembrete agendado
   */
  async cancelReminder(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('[NotificationService] Reminder cancelled:', notificationId);
    } catch (error) {
      console.error('[NotificationService] Cancel reminder failed:', error);
    }
  }
}
```

**Tempo estimado**: 2 horas

### Task 5: Configurar Listeners de Notificação

**Arquivo**: `App.tsx`

```typescript
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { useEffect } from 'react';
import { notificationService } from './src/services/notificationService';

function App() {
  useEffect(() => {
    // Listener para notificações em foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      
      // Exibir notificação local
      if (remoteMessage.notification) {
        await notificationService.displayNotification({
          id: remoteMessage.messageId || '',
          type: remoteMessage.data?.type as any,
          title: remoteMessage.notification.title || '',
          body: remoteMessage.notification.body || '',
          data: remoteMessage.data,
          timestamp: new Date(),
          read: false,
          userId: remoteMessage.data?.userId || '',
        });
      }
    });

    // Listener para quando o app é aberto via notificação
    const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        // Navegar para a tela apropriada
        handleNotificationNavigation(remoteMessage.data);
      }
    );

    // Verificar se o app foi aberto por uma notificação
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          handleNotificationNavigation(remoteMessage.data);
        }
      });

    // Listener para interações com notificações do Notifee
    const unsubscribeNotifee = notifee.onForegroundEvent(
      ({ type, detail }) => {
        if (type === EventType.PRESS) {
          console.log('Notifee notification pressed:', detail.notification);
          handleNotificationNavigation(detail.notification?.data);
        }
      }
    );

    return () => {
      unsubscribeForeground();
      unsubscribeNotificationOpen();
      unsubscribeNotifee();
    };
  }, []);

  function handleNotificationNavigation(data: any) {
    // Implementar navegação baseada no tipo de notificação
    switch (data?.type) {
      case 'booking_new':
      case 'booking_confirmed':
      case 'booking_cancelled':
        // Navegar para tela de agendamentos
        // navigation.navigate('Bookings', { bookingId: data.bookingId });
        break;
      case 'chat_message':
        // Navegar para tela de chat
        // navigation.navigate('Chat', { conversationId: data.conversationId });
        break;
      default:
        break;
    }
  }

  // ... resto do código do App
}
```

**Tempo estimado**: 1 hora

### Task 6: Configurar Background Handler

**Arquivo**: `index.js`

```javascript
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Handler para notificações em background
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in background:', remoteMessage);
  
  // Exibir notificação local
  if (remoteMessage.notification) {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Notificações Padrão',
      importance: 4, // HIGH
    });

    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      data: remoteMessage.data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
      },
    });
  }
});

// Handler para eventos de notificação em background (Notifee)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Background event:', type, detail);
  
  // Processar ações de notificação se necessário
});

AppRegistry.registerComponent(appName, () => App);
```

**Tempo estimado**: 30 minutos

### Task 7: Adicionar Ícone de Notificação (Android)

1. Criar ícone de notificação (branco transparente, 24x24dp)
2. Usar ferramenta: [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-notification.html)
3. Colocar em `android/app/src/main/res/drawable-*/ic_launcher.png`

**Tempo estimado**: 20 minutos

### Task 8: Configurar Permissões

**Arquivo**: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest>
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
  <uses-permission android:name="android.permission.VIBRATE"/>
  
  <application>
    <!-- Adicionar meta-data para ícone de notificação -->
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_icon"
      android:resource="@drawable/ic_launcher" />
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_color"
      android:resource="@color/primary" />
  </application>
</manifest>
```

**Arquivo**: `ios/Drivoo/Info.plist`

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

**Tempo estimado**: 15 minutos

---

## Implementação no Backend

### Estrutura Recomendada

```
backend/
├── src/
│   ├── services/
│   │   └── notificationService.js
│   ├── models/
│   │   └── PushToken.js
│   ├── routes/
│   │   └── notifications.js
│   └── controllers/
│       └── notificationController.js
```

### Backend Task 1: Instalar Dependências

**Node.js**:
```bash
npm install firebase-admin
```

**Python**:
```bash
pip install firebase-admin
```

**Tempo estimado**: 5 minutos

### Backend Task 2: Configurar Firebase Admin SDK

**Node.js** (`src/config/firebase.js`):

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = { admin, messaging };
```

**Python** (`src/config/firebase.py`):

```python
import firebase_admin
from firebase_admin import credentials, messaging

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
```

**Obter serviceAccountKey.json**:
1. Firebase Console → Project Settings → Service Accounts
2. Clique em "Generate new private key"
3. Salve o arquivo como `serviceAccountKey.json`
4. **IMPORTANTE**: Adicione ao `.gitignore`!

**Tempo estimado**: 15 minutos

### Backend Task 3: Criar Model de Push Token

**Node.js + MongoDB** (`src/models/PushToken.js`):

```javascript
const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  platform: {
    type: String,
    enum: ['ios', 'android'],
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Índice para buscar tokens por usuário
pushTokenSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model('PushToken', pushTokenSchema);
```

**SQL** (PostgreSQL/MySQL):

```sql
CREATE TABLE push_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  active BOOLEAN DEFAULT true,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id, active);
```

**Tempo estimado**: 30 minutos

### Backend Task 4: Criar Serviço de Notificações

**Node.js** (`src/services/notificationService.js`):

```javascript
const { messaging } = require('../config/firebase');
const PushToken = require('../models/PushToken');

class NotificationService {
  /**
   * Enviar notificação para um usuário específico
   */
  async sendToUser(userId, notification) {
    try {
      // Buscar tokens ativos do usuário
      const tokens = await PushToken.find({
        userId,
        active: true,
      }).select('token');

      if (tokens.length === 0) {
        console.log(`No active tokens for user ${userId}`);
        return { success: false, reason: 'no_tokens' };
      }

      const tokenStrings = tokens.map(t => t.token);

      // Enviar notificação
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        tokens: tokenStrings,
      };

      const response = await messaging.sendMulticast(message);

      // Processar tokens inválidos
      if (response.failureCount > 0) {
        await this.handleFailedTokens(response, tokens);
      }

      console.log(`Sent notification to user ${userId}:`, response);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Enviar notificação de agendamento
   */
  async sendBookingNotification(userId, type, bookingData) {
    const titles = {
      booking_new: 'Nova Aula Agendada',
      booking_confirmed: 'Aula Confirmada',
      booking_cancelled: 'Aula Cancelada',
      booking_reminder: 'Lembrete de Aula',
    };

    const bodies = {
      booking_new: `${bookingData.studentName || bookingData.instructorName} agendou uma aula para ${bookingData.date} às ${bookingData.timeSlot}`,
      booking_confirmed: `Sua aula com ${bookingData.instructorName || bookingData.studentName} foi confirmada`,
      booking_cancelled: `Sua aula com ${bookingData.instructorName || bookingData.studentName} foi cancelada`,
      booking_reminder: `Lembrete: Sua aula começa em breve`,
    };

    return this.sendToUser(userId, {
      title: titles[type],
      body: bodies[type],
      data: {
        type,
        bookingId: bookingData.bookingId,
        ...bookingData,
      },
    });
  }

  /**
   * Enviar notificação de chat
   */
  async sendChatNotification(userId, chatData) {
    return this.sendToUser(userId, {
      title: `Nova mensagem de ${chatData.senderName}`,
      body: chatData.messagePreview,
      data: {
        type: 'chat_message',
        conversationId: chatData.conversationId,
        senderId: chatData.senderId,
      },
    });
  }

  /**
   * Enviar notificação para múltiplos usuários
   */
  async sendToMultipleUsers(userIds, notification) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, notification))
    );

    return results;
  }

  /**
   * Tratar tokens que falham
   */
  async handleFailedTokens(response, tokens) {
    const failedTokens = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        
        // Tokens inválidos ou não registrados devem ser removidos
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          failedTokens.push(tokens[idx].token);
        }
      }
    });

    if (failedTokens.length > 0) {
      // Desativar tokens inválidos
      await PushToken.updateMany(
        { token: { $in: failedTokens } },
        { active: false }
      );
      
      console.log(`Deactivated ${failedTokens.length} invalid tokens`);
    }
  }

  /**
   * Registrar novo token
   */
  async registerToken(userId, token, platform) {
    try {
      // Verificar se token já existe
      const existing = await PushToken.findOne({ token });

      if (existing) {
        // Atualizar token existente
        existing.userId = userId;
        existing.platform = platform;
        existing.active = true;
        existing.lastUsed = new Date();
        await existing.save();
      } else {
        // Criar novo token
        await PushToken.create({
          userId,
          token,
          platform,
        });
      }

      console.log(`Token registered for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error registering token:', error);
      throw error;
    }
  }

  /**
   * Remover token (logout)
   */
  async unregisterToken(token) {
    try {
      await PushToken.updateOne(
        { token },
        { active: false }
      );
      
      console.log(`Token unregistered: ${token}`);
      return { success: true };
    } catch (error) {
      console.error('Error unregistering token:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
```

**Tempo estimado**: 3 horas

### Backend Task 5: Criar Rotas de API

**Node.js + Express** (`src/routes/notifications.js`):

```javascript
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/notifications/register
 * Registrar token de push notification
 */
router.post('/register', authenticate, async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;

    if (!token || !platform) {
      return res.status(400).json({
        error: 'Token and platform are required',
      });
    }

    await notificationService.registerToken(userId, token, platform);

    res.json({
      success: true,
      message: 'Token registered successfully',
    });
  } catch (error) {
    console.error('Error registering token:', error);
    res.status(500).json({
      error: 'Failed to register token',
    });
  }
});

/**
 * POST /api/notifications/unregister
 * Remover token de push notification
 */
router.post('/unregister', authenticate, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
      });
    }

    await notificationService.unregisterToken(token);

    res.json({
      success: true,
      message: 'Token unregistered successfully',
    });
  } catch (error) {
    console.error('Error unregistering token:', error);
    res.status(500).json({
      error: 'Failed to unregister token',
    });
  }
});

/**
 * POST /api/notifications/send
 * Enviar notificação (uso interno/admin)
 */
router.post('/send', authenticate, async (req, res) => {
  try {
    // Verificar se usuário é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Unauthorized',
      });
    }

    const { userId, notification } = req.body;

    const result = await notificationService.sendToUser(userId, notification);

    res.json(result);
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      error: 'Failed to send notification',
    });
  }
});

module.exports = router;
```

**Tempo estimado**: 1 hora

### Backend Task 6: Integrar Notificações nos Fluxos de Negócio

**Exemplo: Confirmação de Agendamento** (`src/controllers/bookingController.js`):

```javascript
const notificationService = require('../services/notificationService');

async function confirmBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const instructorId = req.user.id;

    // 1. Buscar agendamento
    const booking = await Booking.findById(bookingId)
      .populate('studentId')
      .populate('instructorId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // 2. Verificar se instrutor é o responsável
    if (booking.instructorId._id.toString() !== instructorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // 3. Atualizar status
    booking.status = 'confirmed';
    await booking.save();

    // 4. Enviar notificação para o aluno
    await notificationService.sendBookingNotification(
      booking.studentId._id,
      'booking_confirmed',
      {
        bookingId: booking._id,
        instructorName: booking.instructorId.name,
        date: booking.date,
        timeSlot: booking.timeSlot,
      }
    );

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
}

async function createBooking(req, res) {
  try {
    const studentId = req.user.id;
    const { instructorId, date, timeSlot, duration } = req.body;

    // 1. Criar agendamento
    const booking = await Booking.create({
      studentId,
      instructorId,
      date,
      timeSlot,
      duration,
      status: 'pending',
    });

    // 2. Buscar dados do aluno
    const student = await User.findById(studentId);

    // 3. Enviar notificação para o instrutor
    await notificationService.sendBookingNotification(
      instructorId,
      'booking_new',
      {
        bookingId: booking._id,
        studentName: student.name,
        date: booking.date,
        timeSlot: booking.timeSlot,
      }
    );

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
}

module.exports = {
  confirmBooking,
  createBooking,
};
```

**Exemplo: Nova Mensagem de Chat** (`src/controllers/chatController.js`):

```javascript
const notificationService = require('../services/notificationService');

async function sendMessage(req, res) {
  try {
    const senderId = req.user.id;
    const { conversationId, content, type } = req.body;

    // 1. Buscar conversa
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // 2. Criar mensagem
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      type,
    });

    // 3. Atualizar última mensagem da conversa
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // 4. Determinar destinatário
    const recipientId = conversation.participants.find(
      p => p.toString() !== senderId
    );

    // 5. Buscar dados do remetente
    const sender = await User.findById(senderId);

    // 6. Enviar notificação
    await notificationService.sendChatNotification(recipientId, {
      conversationId,
      senderId,
      senderName: sender.name,
      messagePreview: content.substring(0, 100),
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

module.exports = {
  sendMessage,
};
```

**Tempo estimado**: 2-4 horas (dependendo da complexidade)

---

## Fluxos de Notificação

### Fluxo 1: Novo Agendamento

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Aluno     │         │   Backend   │         │  Instrutor  │
│    (App)    │         │    (API)    │         │    (App)    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ POST /bookings        │                       │
       │──────────────────────>│                       │
       │                       │                       │
       │                       │ Salvar no DB          │
       │                       │────────────>          │
       │                       │                       │
       │                       │ Enviar Push via FCM   │
       │                       │──────────────────────>│
       │                       │                       │
       │ 201 Created           │                       │ 🔔 Notificação
       │<──────────────────────│                       │ "Nova aula"
       │                       │                       │
       │ Agendar lembrete      │                       │
       │ local (1h antes)      │                       │
       │                       │                       │
```

### Fluxo 2: Confirmação de Agendamento

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Instrutor  │         │   Backend   │         │    Aluno    │
│    (App)    │         │    (API)    │         │    (App)    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ PUT /bookings/:id     │                       │
       │ { status: confirmed } │                       │
       │──────────────────────>│                       │
       │                       │                       │
       │                       │ Atualizar DB          │
       │                       │────────────>          │
       │                       │                       │
       │                       │ Enviar Push via FCM   │
       │                       │──────────────────────>│
       │                       │                       │
       │ 200 OK                │                       │ 🔔 Notificação
       │<──────────────────────│                       │ "Aula confirmada"
       │                       │                       │
       │                       │                       │ Agendar lembretes
       │                       │                       │ locais
       │                       │                       │
```

### Fluxo 3: Nova Mensagem de Chat

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Usuário A  │         │   Backend   │         │  Usuário B  │
│    (App)    │         │    (API)    │         │    (App)    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ POST /messages        │                       │
       │──────────────────────>│                       │
       │                       │                       │
       │                       │ Salvar mensagem       │
       │                       │────────────>          │
       │                       │                       │
       │                       │ Enviar Push via FCM   │
       │                       │──────────────────────>│
       │                       │                       │
       │ 201 Created           │                       │ 🔔 Notificação
       │<──────────────────────│                       │ "Nova mensagem"
       │                       │                       │
       │                       │                       │ Se app aberto:
       │                       │                       │ atualizar chat
       │                       │                       │ em tempo real
       │                       │                       │
```

### Fluxo 4: Lembrete de Aula (Local)

```
┌─────────────┐         ┌─────────────┐
│    Aluno    │         │   Sistema   │
│    (App)    │         │   Local     │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ Aula confirmada       │
       │ às 14:00              │
       │                       │
       │ Agendar notificação   │
       │ para 13:00 (1h antes) │
       │──────────────────────>│
       │                       │
       │                       │ ⏰ Aguardar
       │                       │
       │                       │ 13:00 - Disparar
       │ 🔔 Notificação        │
       │ "Aula em 1 hora"      │
       │<──────────────────────│
       │                       │
       │ Agendar notificação   │
       │ para 13:30 (30m antes)│
       │──────────────────────>│
       │                       │
       │                       │ ⏰ Aguardar
       │                       │
       │                       │ 13:30 - Disparar
       │ 🔔 Notificação        │
       │ "Aula em 30 minutos"  │
       │<──────────────────────│
       │                       │
```

---

## Testes

### Teste 1: Testar Registro de Token

**Frontend**:
```typescript
// Em qualquer tela de desenvolvimento
import { notificationService } from '../services/notificationService';

async function testTokenRegistration() {
  const userId = 'test_user_123';
  const token = await notificationService.registerForPushNotifications(userId);
  console.log('Token registered:', token);
}
```

**Backend**:
```bash
# Verificar se token foi salvo no banco
# MongoDB
db.pushtokens.find({ userId: ObjectId("...") })

# PostgreSQL
SELECT * FROM push_tokens WHERE user_id = 123;
```

### Teste 2: Enviar Notificação de Teste

**Via Firebase Console**:
1. Firebase Console → Cloud Messaging
2. Clique em "Send your first message"
3. Preencha título e corpo
4. Em "Target", selecione "Single device"
5. Cole o token FCM
6. Envie

**Via Backend**:
```javascript
// Criar rota de teste (remover em produção!)
router.post('/test-notification', async (req, res) => {
  const { userId } = req.body;
  
  await notificationService.sendToUser(userId, {
    title: 'Teste de Notificação',
    body: 'Esta é uma notificação de teste',
    data: { type: 'test' },
  });
  
  res.json({ success: true });
});
```

### Teste 3: Testar Notificação em Background

1. Feche o app completamente
2. Envie notificação via Firebase Console ou backend
3. Verifique se notificação aparece na bandeja
4. Toque na notificação
5. Verifique se app abre na tela correta

### Teste 4: Testar Lembretes Locais

```typescript
// Agendar lembrete para daqui a 1 minuto
const testTime = new Date(Date.now() + 60000);

await notificationService.scheduleReminder(
  'test_user',
  {
    bookingId: 'test_123',
    instructorName: 'Instrutor Teste',
    date: '2024-03-15',
    timeSlot: '14:00',
  },
  testTime
);

console.log('Reminder scheduled for:', testTime);
```

### Teste 5: Testar Múltiplos Dispositivos

1. Instale o app em 2 dispositivos
2. Faça login com a mesma conta
3. Envie notificação
4. Verifique se ambos recebem

---

## Monitoramento

### Métricas Importantes

1. **Taxa de Entrega**
   - Quantas notificações foram enviadas vs entregues
   - Monitorar via Firebase Console → Cloud Messaging → Reports

2. **Taxa de Abertura**
   - Quantas notificações foram abertas
   - Implementar tracking no app

3. **Tokens Inválidos**
   - Quantos tokens falharam
   - Limpar tokens inválidos regularmente

4. **Latência**
   - Tempo entre envio e recebimento
   - Monitorar logs do backend

### Implementar Analytics

**Frontend** (`src/services/notificationService.ts`):

```typescript
async handleNotificationPress(
  notificationId: string,
  userId: string
): Promise<NotificationData | null> {
  try {
    const notification = await this.getNotifications(userId).then(
      notifs => notifs.find(n => n.id === notificationId)
    );
    
    if (notification) {
      await this.markAsRead(userId, notificationId);
      
      // Enviar evento de analytics
      await this.trackNotificationOpened(notification);
      
      return notification;
    }
    
    return null;
  } catch (error) {
    console.error('[NotificationService] Handle press failed:', error);
    return null;
  }
}

private async trackNotificationOpened(
  notification: NotificationData
): Promise<void> {
  try {
    // Enviar para backend ou serviço de analytics
    await fetch('https://api.drivoo.com/analytics/notification-opened', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: notification.id,
        type: notification.type,
        timestamp: new Date(),
      }),
    });
  } catch (error) {
    console.error('Failed to track notification:', error);
  }
}
```

### Dashboard de Monitoramento

Criar dashboard no backend para visualizar:
- Total de notificações enviadas (por dia/semana/mês)
- Taxa de entrega por plataforma (iOS vs Android)
- Taxa de abertura por tipo de notificação
- Tokens ativos vs inativos
- Erros e falhas

---

## Checklist de Implementação

### Firebase
- [ ] Criar projeto no Firebase
- [ ] Adicionar app Android
- [ ] Adicionar app iOS
- [ ] Configurar APNs (iOS)
- [ ] Obter Server Key
- [ ] Baixar serviceAccountKey.json

### Frontend
- [ ] Instalar dependências (@react-native-firebase, @notifee)
- [ ] Configurar Firebase no Android
- [ ] Configurar Firebase no iOS
- [ ] Atualizar NotificationService
- [ ] Configurar listeners no App.tsx
- [ ] Configurar background handler
- [ ] Adicionar ícone de notificação
- [ ] Configurar permissões
- [ ] Testar em dispositivo real

### Backend
- [ ] Instalar firebase-admin
- [ ] Configurar Firebase Admin SDK
- [ ] Criar model de PushToken
- [ ] Criar NotificationService
- [ ] Criar rotas de API
- [ ] Integrar em fluxos de negócio
- [ ] Implementar limpeza de tokens inválidos
- [ ] Adicionar logs e monitoramento

### Testes
- [ ] Testar registro de token
- [ ] Testar notificação em foreground
- [ ] Testar notificação em background
- [ ] Testar notificação com app fechado
- [ ] Testar navegação ao tocar notificação
- [ ] Testar lembretes locais
- [ ] Testar múltiplos dispositivos
- [ ] Testar em iOS e Android

### Produção
- [ ] Configurar variáveis de ambiente
- [ ] Adicionar serviceAccountKey.json ao .gitignore
- [ ] Configurar rate limiting
- [ ] Implementar retry logic
- [ ] Configurar monitoramento
- [ ] Documentar APIs
- [ ] Treinar equipe

---

## Troubleshooting

### Problema: Token não é registrado

**Possíveis causas**:
- Permissões não concedidas
- Firebase mal configurado
- google-services.json/GoogleService-Info.plist ausente

**Solução**:
```bash
# Verificar logs
npx react-native log-android
npx react-native log-ios

# Verificar se Firebase está inicializado
console.log(firebase.apps.length); // Deve ser > 0
```

### Problema: Notificações não aparecem

**iOS**:
- Verificar se APNs está configurado
- Verificar se app tem permissão
- Verificar se está em modo Debug (pode não funcionar)

**Android**:
- Verificar se canal de notificação foi criado
- Verificar permissões no AndroidManifest.xml
- Verificar se ícone de notificação existe

### Problema: Notificações não funcionam em background

**Solução**:
- Verificar se background handler está configurado
- Verificar se UIBackgroundModes está no Info.plist (iOS)
- Testar com app completamente fechado

### Problema: Tokens inválidos acumulando

**Solução**:
- Implementar job para limpar tokens antigos
- Processar erros do FCM corretamente
- Desativar tokens em logout

---

## Recursos Adicionais

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)
- [Notifee Documentation](https://notifee.app/)
- [APNs Documentation](https://developer.apple.com/documentation/usernotifications)
- [FCM HTTP v1 API](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)

---

## Estimativa Total de Tempo

| Fase | Tempo Estimado |
|------|----------------|
| Configuração Firebase | 2-3 horas |
| Implementação Frontend | 6-8 horas |
| Implementação Backend | 8-12 horas |
| Testes | 4-6 horas |
| Ajustes e Debugging | 4-8 horas |
| **TOTAL** | **24-37 horas** |

---

## Próximos Passos

Após implementar o sistema básico, considere adicionar:

1. **Notificações Ricas**
   - Imagens
   - Botões de ação
   - Progresso

2. **Notificações Agrupadas**
   - Agrupar múltiplas notificações
   - Resumos inteligentes

3. **Preferências Avançadas**
   - Horários de silêncio
   - Frequência de notificações
   - Prioridades por tipo

4. **A/B Testing**
   - Testar diferentes mensagens
   - Otimizar taxa de abertura

5. **Notificações Programadas**
   - Campanhas de marketing
   - Lembretes recorrentes
   - Notificações baseadas em localização
