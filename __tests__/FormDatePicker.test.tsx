import React from 'react';
import { render } from '@testing-library/react-native';
import { FormDatePicker } from '../src/components/forms/FormDatePicker';

// Mock the DateTimePicker component
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('FormDatePicker', () => {
  const mockOnDateChange = jest.fn();

  beforeEach(() => {
    mockOnDateChange.mockClear();
  });

  it('should render correctly with placeholder', () => {
    const { getByText } = render(
      <FormDatePicker
        placeholder="Selecione uma data"
        onDateChange={mockOnDateChange}
      />
    );

    expect(getByText('Selecione uma data')).toBeTruthy();
    expect(getByText('📅')).toBeTruthy();
  });

  it('should render with label', () => {
    const { getByText } = render(
      <FormDatePicker
        label="Data de nascimento"
        placeholder="Selecione uma data"
        onDateChange={mockOnDateChange}
      />
    );

    expect(getByText('Data de nascimento')).toBeTruthy();
  });

  it('should show required indicator when required', () => {
    const { getByText } = render(
      <FormDatePicker
        label="Data de nascimento"
        placeholder="Selecione uma data"
        onDateChange={mockOnDateChange}
        required
      />
    );

    expect(getByText('*')).toBeTruthy();
  });

  it('should display formatted date when value is provided', () => {
    const testDate = new Date('2024-01-15');
    const { getByText } = render(
      <FormDatePicker
        value={testDate}
        onDateChange={mockOnDateChange}
      />
    );

    // The actual formatted date might be 14/01/2024 due to timezone differences
    const formattedDate = testDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    expect(getByText(formattedDate)).toBeTruthy();
  });

  it('should show error message when error is provided', () => {
    const { getByText } = render(
      <FormDatePicker
        placeholder="Selecione uma data"
        onDateChange={mockOnDateChange}
        error="Data é obrigatória"
      />
    );

    expect(getByText('Data é obrigatória')).toBeTruthy();
  });

  it('should format time correctly when mode is time', () => {
    const testDate = new Date('2024-01-15T14:30:00');
    const { getByText } = render(
      <FormDatePicker
        value={testDate}
        mode="time"
        onDateChange={mockOnDateChange}
      />
    );

    expect(getByText('14:30')).toBeTruthy();
  });

  it('should format datetime correctly when mode is datetime', () => {
    const testDate = new Date('2024-01-15T14:30:00');
    const { getByText } = render(
      <FormDatePicker
        value={testDate}
        mode="datetime"
        onDateChange={mockOnDateChange}
      />
    );

    // The actual formatted datetime
    const formattedDateTime = testDate.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(getByText(formattedDateTime)).toBeTruthy();
  });
});