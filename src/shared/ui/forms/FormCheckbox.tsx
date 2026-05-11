import theme from '@/theme';
import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function FormCheckbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.container}
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <View
        style={[styles.checkbox, checked && styles.checkboxChecked, disabled && styles.disabled]}
      >
        {checked && <Check size={14} color="#FFF" strokeWidth={3} />}
      </View>

      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borders.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  checkboxChecked: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.border.medium,
  },

  disabled: {
    opacity: 0.5,
  },

  label: {
    marginLeft: 8,
    fontSize: 14,
    color: '#18181B',
  },

  labelDisabled: {
    color: '#A1A1AA',
  },
});
