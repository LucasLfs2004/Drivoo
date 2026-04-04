import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  placeholder = 'Selecione uma opção',
  options,
  value,
  onSelect,
  error,
  required = false,
  containerStyle,
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isModalVisible ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focusAnim, isModalVisible]);

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsModalVisible(false);
  };

  const animatedSelectStyle = useMemo(
    () => ({
      borderColor: focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? theme.colors.semantic.error : '#D6DEEA', theme.colors.primary[300]],
      }),
      shadowColor: focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#90A4C6', theme.colors.primary[300]],
      }),
      shadowOpacity: focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, error ? 0.08 : 0.14],
      }),
      shadowRadius: focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, error ? 18 : 20],
      }),
      elevation: focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, error ? 2 : 3],
      }),
    }),
    [error, focusAnim]
  );

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={styles.optionText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <Animated.View style={[styles.selectFrame, animatedSelectStyle]}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            error && styles.selectButtonError,
            disabled && styles.selectButtonDisabled,
          ]}
          onPress={() => !disabled && setIsModalVisible(true)}
          disabled={disabled}
          activeOpacity={0.9}
        >
          <Text
            style={[
              styles.selectText,
              !selectedOption && styles.placeholderText,
              disabled && styles.disabledText,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Text style={[styles.arrow, disabled && styles.disabledText]}>▼</Text>
        </TouchableOpacity>
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Selecione'}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#2F3440',
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.semantic.error,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: theme.borders.width.base,
    borderColor: '#D6DEEA',
    borderRadius: theme.borders.radius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md - theme.spacing.xs,
    backgroundColor: theme.colors.background.primary,
  },
  selectFrame: {
    shadowColor: '#90A4C6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderRadius: theme.borders.radius.xl,
  },
  selectButtonError: {
    borderColor: theme.colors.semantic.error,
  },
  selectButtonDisabled: {
    backgroundColor: theme.colors.background.secondary,
    opacity: 0.6,
  },
  selectText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.normal,
    color: '#465264',
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.text.tertiary,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  arrow: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.error,
    marginTop: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.lg,
    width: '100%',
    maxHeight: '70%',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: theme.borders.width.base,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: theme.borders.width.thin,
    borderBottomColor: theme.colors.border.light,
  },
  optionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
});
