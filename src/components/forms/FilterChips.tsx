import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../themes';

export interface FilterChip {
  id: string;
  label: string;
  value: any;
}

export interface FilterChipsProps {
  label?: string;
  chips: FilterChip[];
  selectedValues: any[];
  onSelectionChange: (selectedValues: any[]) => void;
  multiSelect?: boolean;
  containerStyle?: ViewStyle;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  label,
  chips,
  selectedValues,
  onSelectionChange,
  multiSelect = false,
  containerStyle,
}) => {
  const handleChipPress = (chipValue: any) => {
    if (multiSelect) {
      const isSelected = selectedValues.includes(chipValue);
      if (isSelected) {
        onSelectionChange(selectedValues.filter(value => value !== chipValue));
      } else {
        onSelectionChange([...selectedValues, chipValue]);
      }
    } else {
      // Single select - toggle if same value, otherwise select new value
      if (selectedValues.includes(chipValue)) {
        onSelectionChange([]);
      } else {
        onSelectionChange([chipValue]);
      }
    }
  };

  const isChipSelected = (chipValue: any) => {
    return selectedValues.includes(chipValue);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.chipsContainer}>
        {chips.map((chip) => {
          const isSelected = isChipSelected(chip.value);
          return (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => handleChipPress(chip.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borders.radius.full,
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.primary,
    minHeight: theme.scaleUtils.moderateScale(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  chipText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  chipTextSelected: {
    color: theme.colors.text.inverse,
  },
});