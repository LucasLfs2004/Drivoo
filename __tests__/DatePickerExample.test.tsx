import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FormDatePicker } from '../src/components/forms/FormDatePicker';

// Mock the DateTimePicker component
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Example component using FormDatePicker
const DatePickerExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  return (
    <FormDatePicker
      label="Data preferida"
      placeholder="Selecione uma data"
      value={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
};

describe('DatePickerExample', () => {
  it('should render and be interactive', () => {
    const { getByText } = render(<DatePickerExample />);
    
    // Check if the component renders correctly
    expect(getByText('Data preferida')).toBeTruthy();
    expect(getByText('Selecione uma data')).toBeTruthy();
    expect(getByText('📅')).toBeTruthy();
  });

  it('should be clickable', () => {
    const { getByText } = render(<DatePickerExample />);
    
    const dateButton = getByText('Selecione uma data').parent;
    
    // Should not throw error when pressed
    expect(() => {
      fireEvent.press(dateButton!);
    }).not.toThrow();
  });
});