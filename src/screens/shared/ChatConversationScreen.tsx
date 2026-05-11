import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bookmark,
  CheckCircle2,
  Hash,
  MapPin,
  Navigation,
  Send,
  ShieldCheck,
  Store,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, BottomSheet, Button, Card } from '../../shared/ui';
import { theme } from '../../theme';
import type { ChatStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatScreen'>;
type ScreenRouteProp = RouteProp<ChatStackParamList, 'ChatScreen'>;
type MeetingPoint = {
  placeName: string;
  address: string;
  district: string;
  zipCode: string;
  number: string;
  reference: string;
  displayAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
};

type MeetingPointSearchMode = 'address' | 'zipCode';

type ChatMessage =
  | { id: string; type: 'text'; body: string }
  | { id: string; type: 'meeting-point'; point: MeetingPoint; status: 'pending' | 'confirmed' };

const emptyMeetingPoint: MeetingPoint = {
  placeName: '',
  address: '',
  district: '',
  zipCode: '',
  number: '',
  reference: '',
  displayAddress: '',
  coordinates: null,
};

const initialMapRegion: Region = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

export const ChatConversationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { participantName } = route.params;
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [meetingSheetVisible, setMeetingSheetVisible] = React.useState(false);
  const [searchMode, setSearchMode] = React.useState<MeetingPointSearchMode>('address');
  const [meetingPoint, setMeetingPoint] = React.useState<MeetingPoint>(emptyMeetingPoint);
  const [mapRegion, setMapRegion] = React.useState<Region>(initialMapRegion);
  const [geocodingState, setGeocodingState] = React.useState<
    'idle' | 'loading' | 'found' | 'not-found'
  >('idle');

  const normalizedZipCode = meetingPoint.zipCode.replace(/\D/g, '');
  const hasRequiredLocationFields =
    searchMode === 'address'
      ? Boolean(meetingPoint.address.trim() && meetingPoint.district.trim())
      : Boolean(normalizedZipCode.length === 8 && meetingPoint.number.trim());
  const canSuggestMeetingPoint = Boolean(
    meetingPoint.placeName.trim() && hasRequiredLocationFields && meetingPoint.coordinates,
  );

  React.useEffect(() => {
    const resetResolvedLocation = () => {
      setMeetingPoint(current =>
        current.coordinates || current.displayAddress
          ? { ...current, coordinates: null, displayAddress: '' }
          : current,
      );
    };

    if (!hasRequiredLocationFields) {
      setGeocodingState('idle');
      resetResolvedLocation();
      return;
    }

    let cancelled = false;
    setGeocodingState('loading');

    const geocodeAddress = async (addressQuery: string, displayAddress: string) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(
          addressQuery,
        )}`,
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Drivoo/1.0',
          },
        },
      );
      const results = (await response.json()) as Array<{ lat?: string; lon?: string }>;
      const firstResult = results[0];
      const latitude = Number(firstResult?.lat);
      const longitude = Number(firstResult?.lon);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return false;
      }

      if (cancelled) {
        return false;
      }

      const coordinates = { latitude, longitude };

      setMeetingPoint(current => ({ ...current, coordinates, displayAddress }));
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      });
      return true;
    };

    const timer = setTimeout(async () => {
      try {
        if (searchMode === 'address') {
          const displayAddress = [meetingPoint.address.trim(), meetingPoint.district.trim()]
            .filter(Boolean)
            .join(' - ');
          const addressQuery = [meetingPoint.address, meetingPoint.district, 'Brasil']
            .filter(Boolean)
            .join(', ');
          const found = await geocodeAddress(addressQuery, displayAddress);

          if (!cancelled && found) {
            setGeocodingState('found');
            return;
          }
        } else {
          const zipResponse = await fetch(`https://viacep.com.br/ws/${normalizedZipCode}/json/`);
          const zipResult = (await zipResponse.json()) as {
            erro?: boolean;
            logradouro?: string;
            bairro?: string;
            localidade?: string;
            uf?: string;
            cep?: string;
          };

          if (zipResult.erro || !zipResult.logradouro || !zipResult.localidade || !zipResult.uf) {
            throw new Error('CEP nao encontrado');
          }

          const displayAddress = [
            `${zipResult.logradouro}, ${meetingPoint.number.trim()}`,
            zipResult.bairro,
            `${zipResult.localidade} - ${zipResult.uf}`,
            zipResult.cep,
          ]
            .filter(Boolean)
            .join(' - ');
          const addressQuery = [
            zipResult.logradouro,
            meetingPoint.number,
            zipResult.bairro,
            zipResult.localidade,
            zipResult.uf,
            'Brasil',
          ]
            .filter(Boolean)
            .join(', ');
          const found = await geocodeAddress(addressQuery, displayAddress);

          if (!cancelled && found) {
            setMeetingPoint(current => ({
              ...current,
              address: zipResult.logradouro ?? current.address,
              district: zipResult.bairro ?? current.district,
            }));
            setGeocodingState('found');
            return;
          }
        }

        if (!cancelled) {
          resetResolvedLocation();
          setGeocodingState('not-found');
        }
      } catch {
        if (!cancelled) {
          resetResolvedLocation();
          setGeocodingState('not-found');
        }
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    hasRequiredLocationFields,
    meetingPoint.address,
    meetingPoint.district,
    meetingPoint.number,
    normalizedZipCode,
    searchMode,
  ]);

  const handleSend = () => {
    const body = draft.trim();

    if (!body) {
      return;
    }

    setMessages(current => [...current, { id: String(Date.now()), type: 'text', body }]);
    setDraft('');
  };

  const handleSuggestMeetingPoint = () => {
    if (!canSuggestMeetingPoint) {
      return;
    }

    const resolvedAddress = meetingPoint.displayAddress || meetingPoint.address.trim();

    setMessages(current => [
      ...current,
      {
        id: String(Date.now()),
        type: 'meeting-point',
        point: {
          placeName: meetingPoint.placeName.trim(),
          address: resolvedAddress,
          district: meetingPoint.district.trim(),
          zipCode: normalizedZipCode,
          number: meetingPoint.number.trim(),
          reference: meetingPoint.reference.trim(),
          displayAddress: resolvedAddress,
          coordinates: meetingPoint.coordinates,
        },
        status: 'pending',
      },
    ]);
    setMeetingSheetVisible(false);
  };

  const handleConfirmMeetingPoint = (messageId: string) => {
    setMessages(current =>
      current.map(message =>
        message.id === messageId && message.type === 'meeting-point'
          ? { ...message, status: 'confirmed' }
          : message,
      ),
    );
  };

  const handleClearMeetingPoint = () => {
    setMeetingPoint(emptyMeetingPoint);
    setGeocodingState('idle');
    setMapRegion(initialMapRegion);
  };

  const handleSearchModeChange = (nextMode: MeetingPointSearchMode) => {
    if (searchMode === nextMode) {
      return;
    }

    setSearchMode(nextMode);
    setMeetingPoint(current => ({
      ...current,
      address: '',
      district: '',
      zipCode: '',
      number: '',
      displayAddress: '',
      coordinates: null,
    }));
    setGeocodingState('idle');
    setMapRegion(initialMapRegion);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppHeader
          title={participantName}
          subtitle="Conversa da aula"
          onBackPress={navigation.goBack}
        />

        <View style={styles.securityNotice}>
          <ShieldCheck color={theme.colors.primary[500]} size={18} />
          <Text style={styles.securityNoticeText}>
            Suas mensagens sao protegidas. O ponto exato e combinado aqui no app.
          </Text>
        </View>

        <ScrollView
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length ? (
            <View style={styles.messageList}>
              {messages.map(message =>
                message.type === 'text' ? (
                  <View key={message.id} style={styles.messageBubble}>
                    <Text style={styles.messageText}>{message.body}</Text>
                  </View>
                ) : (
                  <View key={message.id} style={styles.meetingMessage}>
                    <Text style={styles.systemText}>Sugestao de local enviada</Text>
                    <View style={styles.meetingCard}>
                      <View style={styles.meetingHeader}>
                        <View style={styles.meetingIcon}>
                          <MapPin color={theme.colors.primary[500]} size={24} />
                        </View>
                        <View style={styles.meetingCopy}>
                          <Text style={styles.meetingTitle}>{message.point.placeName}</Text>
                          <Text style={styles.meetingAddress}>{message.point.address}</Text>
                        </View>
                        {message.status === 'confirmed' && (
                          <View style={styles.confirmedBadge}>
                            <Text style={styles.confirmedBadgeText}>Confirmado</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.meetingMeta}>
                        {message.point.reference ? (
                          <View style={styles.referenceRow}>
                            <Bookmark color={theme.colors.text.secondary} size={15} />
                            <Text style={styles.referenceText}>{message.point.reference}</Text>
                          </View>
                        ) : null}
                      </View>

                      {message.status === 'pending' ? (
                        <View style={styles.meetingActions}>
                          <Button
                            title="Aceitar"
                            icon={CheckCircle2}
                            size="sm"
                            style={styles.meetingActionButton}
                            onPress={() => handleConfirmMeetingPoint(message.id)}
                          />
                          <Button
                            title="Nova sugestao"
                            variant="outline"
                            size="sm"
                            style={styles.meetingActionButton}
                            onPress={() => setMeetingSheetVisible(true)}
                          />
                        </View>
                      ) : (
                        <Text style={styles.confirmedText}>Local de encontro confirmado.</Text>
                      )}
                    </View>
                  </View>
                ),
              )}
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhuma mensagem ainda</Text>
              <Text style={styles.emptyMessage}>Combine os detalhes da sua aula por aqui.</Text>
            </Card>
          )}
        </ScrollView>

        <Button
          title="Sugerir local"
          icon={MapPin}
          variant="outline"
          style={styles.suggestButton}
          onPress={() => setMeetingSheetVisible(true)}
        />

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

      <BottomSheet
        visible={meetingSheetVisible}
        onClose={() => setMeetingSheetVisible(false)}
        title="Sugerir local de encontro"
        snapPoints={['82%']}
        scrollable
      >
        <View style={styles.searchModeControl}>
          <Button
            title="Endereco"
            icon={MapPin}
            variant={searchMode === 'address' ? 'primary' : 'outline'}
            size="sm"
            style={styles.searchModeButton}
            onPress={() => handleSearchModeChange('address')}
          />
          <Button
            title="CEP"
            icon={Hash}
            variant={searchMode === 'zipCode' ? 'primary' : 'outline'}
            size="sm"
            style={styles.searchModeButton}
            onPress={() => handleSearchModeChange('zipCode')}
          />
        </View>

        <MeetingPointField
          icon={<Store color={theme.colors.text.secondary} size={18} />}
          label="Nome do local"
          value={meetingPoint.placeName}
          placeholder="Ex: Padaria Central"
          onChangeText={placeName => setMeetingPoint(current => ({ ...current, placeName }))}
        />
        {searchMode === 'address' ? (
          <>
            <MeetingPointField
              icon={<MapPin color={theme.colors.text.secondary} size={18} />}
              label="Endereco"
              value={meetingPoint.address}
              placeholder="Rua e numero"
              onChangeText={address =>
                setMeetingPoint(current => ({
                  ...current,
                  address,
                  displayAddress: '',
                  coordinates: null,
                }))
              }
            />
            <MeetingPointField
              icon={<Navigation color={theme.colors.text.secondary} size={18} />}
              label="Bairro"
              value={meetingPoint.district}
              placeholder="Bairro, cidade ou regiao"
              onChangeText={district =>
                setMeetingPoint(current => ({
                  ...current,
                  district,
                  displayAddress: '',
                  coordinates: null,
                }))
              }
            />
          </>
        ) : (
          <>
            <MeetingPointField
              icon={<Hash color={theme.colors.text.secondary} size={18} />}
              label="CEP"
              value={meetingPoint.zipCode}
              placeholder="00000-000"
              keyboardType="number-pad"
              onChangeText={zipCode =>
                setMeetingPoint(current => ({
                  ...current,
                  zipCode,
                  address: '',
                  district: '',
                  displayAddress: '',
                  coordinates: null,
                }))
              }
            />
            <MeetingPointField
              icon={<MapPin color={theme.colors.text.secondary} size={18} />}
              label="Numero"
              value={meetingPoint.number}
              placeholder="Numero do local"
              keyboardType="number-pad"
              onChangeText={number =>
                setMeetingPoint(current => ({
                  ...current,
                  number,
                  displayAddress: '',
                  coordinates: null,
                }))
              }
            />
          </>
        )}
        <MeetingPointField
          icon={<Bookmark color={theme.colors.text.secondary} size={18} />}
          label="Ponto de referencia"
          value={meetingPoint.reference}
          placeholder="Opcional"
          onChangeText={reference => setMeetingPoint(current => ({ ...current, reference }))}
        />

        <View style={styles.previewCard}>
          <MapView
            style={styles.previewMap}
            region={mapRegion}
            pointerEvents="none"
            toolbarEnabled={false}
            scrollEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            zoomEnabled={false}
          >
            {meetingPoint.coordinates ? (
              <Marker coordinate={meetingPoint.coordinates} title={meetingPoint.placeName} />
            ) : null}
          </MapView>
          <Text style={styles.previewText}>
            {geocodingState === 'loading'
              ? 'Localizando endereco no mapa...'
              : geocodingState === 'found'
                ? 'Confira se o marcador esta no ponto de encontro escolhido.'
                : geocodingState === 'not-found'
                  ? searchMode === 'address'
                    ? 'Nao encontramos esse endereco. Ajuste rua, numero ou bairro.'
                    : 'Nao encontramos esse CEP ou numero. Confira os dados.'
                  : searchMode === 'address'
                    ? 'Preencha endereco e bairro para mostrar o ponto no mapa.'
                    : 'Preencha CEP e numero para buscar a rua e mostrar no mapa.'}
          </Text>
        </View>

        <Button
          title="Enviar sugestao"
          disabled={!canSuggestMeetingPoint}
          onPress={handleSuggestMeetingPoint}
        />
        <Button title="Limpar campos" variant="ghost" onPress={handleClearMeetingPoint} />
      </BottomSheet>
    </SafeAreaView>
  );
};

type MeetingPointFieldProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  onChangeText: (value: string) => void;
};

const MeetingPointField: React.FC<MeetingPointFieldProps> = ({
  icon,
  label,
  value,
  placeholder,
  keyboardType,
  onChangeText,
}) => (
  <View style={styles.field}>
    <View style={styles.fieldIcon}>{icon}</View>
    <View style={styles.fieldCopy}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        keyboardType={keyboardType}
        style={styles.fieldInput}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    rowGap: theme.spacing.md,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
  },
  securityNoticeText: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    lineHeight: 17,
    color: theme.colors.text.secondary,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: theme.spacing.sm,
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
  meetingMessage: {
    rowGap: theme.spacing.xs,
  },
  systemText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  meetingCard: {
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.primary[100],
    borderRadius: theme.borders.radius.md,
    padding: theme.spacing.md,
    rowGap: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
  meetingIcon: {
    width: 46,
    height: 46,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[50],
  },
  meetingCopy: {
    flex: 1,
    minWidth: 0,
  },
  meetingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  meetingAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  confirmedBadge: {
    borderRadius: theme.borders.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary[50],
  },
  confirmedBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
  },
  meetingMeta: {
    rowGap: theme.spacing.sm,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.xs,
  },
  referenceText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  meetingActions: {
    flexDirection: 'row',
    columnGap: theme.spacing.sm,
  },
  meetingActionButton: {
    flex: 1,
  },
  confirmedText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
  },
  suggestButton: {
    shadowOpacity: 0,
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
  searchModeControl: {
    flexDirection: 'row',
    columnGap: theme.spacing.sm,
  },
  searchModeButton: {
    flex: 1,
    shadowOpacity: 0,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borders.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  fieldIcon: {
    width: 28,
    alignItems: 'center',
  },
  fieldCopy: {
    flex: 1,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  fieldInput: {
    minHeight: 30,
    padding: 0,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
  },
  previewCard: {
    rowGap: theme.spacing.sm,
  },
  previewMap: {
    height: 116,
    borderRadius: theme.borders.radius.md,
    overflow: 'hidden',
  },
  previewText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
});
