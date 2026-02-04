import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../themes';
import {
  InstructorCard,
  BookingCard,
  ChatBubble,
  TabBar,
  HeaderBar,
  FormSelect,
  FormDatePicker,
  FormImagePicker,
} from '../index';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AlunoHomeStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<AlunoHomeStackParamList>;

export const ComponentShowcase: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedImage, setSelectedImage] = useState('');

  // Mock data
  const mockInstructor = {
    id: '1',
    name: 'Carlos Santos',
    rating: 4.8,
    reviewCount: 127,
    hourlyRate: 85,
    specialties: ['Primeira Habilitação', 'Direção Defensiva', 'Baliza'],
    availability: 'Disponível hoje',
    distance: '2.5 km',
    vehicleType: 'manual' as const,
  };

  const mockBooking = {
    id: '1',
    instructorName: 'Carlos Santos',
    date: new Date(2024, 2, 15, 14, 30),
    duration: 60,
    price: 85,
    status: 'scheduled' as const,
    vehicleType: 'manual' as const,
    location: 'Shopping Eldorado, São Paulo',
  };

  const mockTabs = [
    { key: 'home', label: 'Início', icon: '🏠' },
    { key: 'search', label: 'Buscar', icon: '🔍' },
    { key: 'bookings', label: 'Aulas', icon: '📅', badge: 2 },
    { key: 'chat', label: 'Chat', icon: '💬', badge: 5 },
    { key: 'profile', label: 'Perfil', icon: '👤' },
  ];

  const mockSelectOptions = [
    { label: 'Manual', value: 'manual' },
    { label: 'Automático', value: 'automatic' },
  ];

  const handleInstructorPress = () => {
    navigation.navigate('InstructorDetails', { instructorId: '1' });
  };

  const handleBookingPress = () => {
    console.log('Booking pressed');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const mockHeaderActions = [
    { icon: '🔔', onPress: () => {}, badge: 3 },
    { icon: '⚙️', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Showcase de Componentes"
        subtitle="Demonstração dos componentes UI"
        rightActions={mockHeaderActions}
        showBackButton
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Componentes de Formulário</Text>
          
          <FormSelect
            label="Tipo de Veículo"
            options={mockSelectOptions}
            value={selectedValue}
            onSelect={setSelectedValue}
            placeholder="Selecione o tipo"
          />
          
          <FormDatePicker
            label="Data da Aula"
            value={selectedDate}
            onDateChange={setSelectedDate}
            placeholder="Selecione a data"
          />
          
          <FormImagePicker
            label="Documento"
            value={selectedImage}
            onImageSelect={setSelectedImage}
            placeholder="Selecionar documento"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Componentes de Exibição</Text>
          
          <InstructorCard
            {...mockInstructor}
            onPress={handleInstructorPress}
            onBookPress={handleBookingPress}
          />
          
          <BookingCard
            {...mockBooking}
            onPress={handleBookingPress}
            onCancelPress={() => {}}
            onReschedulePress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Componentes de Chat</Text>
          
          <ChatBubble
            id="1"
            message="Olá! Gostaria de agendar uma aula para amanhã."
            timestamp={new Date()}
            isOwn={true}
            status="read"
          />
          
          <ChatBubble
            id="2"
            message="Claro! Que horário seria melhor para você?"
            timestamp={new Date()}
            isOwn={false}
            senderName="Carlos Santos"
            status="sent"
          />
          
          <ChatBubble
            id="3"
            message="Aula agendada para 15/03 às 14:30"
            timestamp={new Date()}
            isOwn={false}
            messageType="system"
          />
        </View>

        {/* Espaço extra para o TabBar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <TabBar
        tabs={mockTabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
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
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  bottomSpacing: {
    height: theme.spacing.xl,
  },
});