import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InstructorDetailsScreen } from '../src/screens/client/InstructorDetailsScreen';
import { AlunoSearchStackParamList } from '../src/types/navigation';

const Stack = createNativeStackNavigator<AlunoSearchStackParamList>();

const MockNavigator = ({ instructorId }: { instructorId: string }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="InstructorDetails"
        component={InstructorDetailsScreen}
        initialParams={{ instructorId }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('InstructorDetailsScreen', () => {
  it('should render loading state initially', () => {
    render(<MockNavigator instructorId="1" />);
    
    expect(screen.getByText('Carregando detalhes...')).toBeTruthy();
  });

  it('should render instructor details after loading', async () => {
    render(<MockNavigator instructorId="1" />);
    
    // Wait for the instructor details to load
    await screen.findByText('Carlos Silva');
    
    // Check if instructor information is displayed
    expect(screen.getByText('Carlos Silva')).toBeTruthy();
    expect(screen.getByText('Vila Madalena, São Paulo • 2.3 km')).toBeTruthy();
    expect(screen.getByText('R$ 85')).toBeTruthy();
  });

  it('should display vehicle information', async () => {
    render(<MockNavigator instructorId="1" />);
    
    await screen.findByText('Carlos Silva');
    
    expect(screen.getByText('Veículo')).toBeTruthy();
    expect(screen.getByText('🚗 Volkswagen Gol')).toBeTruthy();
    expect(screen.getByText('⚙️ Manual')).toBeTruthy();
  });

  it('should display specialties', async () => {
    render(<MockNavigator instructorId="1" />);
    
    await screen.findByText('Carlos Silva');
    
    expect(screen.getByText('Especialidades')).toBeTruthy();
    expect(screen.getByText('Primeira Habilitação')).toBeTruthy();
    expect(screen.getByText('Aulas Noturnas')).toBeTruthy();
  });

  it('should display booking section', async () => {
    render(<MockNavigator instructorId="1" />);
    
    await screen.findByText('Carlos Silva');
    
    expect(screen.getByText('Agendar Aula')).toBeTruthy();
    expect(screen.getByText('Selecione a data')).toBeTruthy();
  });

  it('should show error for non-existent instructor', async () => {
    render(<MockNavigator instructorId="999" />);
    
    await screen.findByText('Instrutor não encontrado');
    
    expect(screen.getByText('Instrutor não encontrado')).toBeTruthy();
    expect(screen.getByText('Voltar')).toBeTruthy();
  });
});