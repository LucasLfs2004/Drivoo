import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const FormInput = forwardRef<TextInput, FormInputProps>(({
  label,
  error,
  required = false,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focusAnim, isFocused]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputStyle = [
    styles.input,
    error && styles.inputError,
    style,
  ];

  const animatedInputStyle = useMemo(
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

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <AnimatedTextInput
        ref={ref}
        style={[inputStyle, animatedInputStyle]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={theme.colors.text.tertiary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

FormInput.displayName = 'FormInput';

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
  input: {
    borderWidth: theme.borders.width.base,
    borderColor: '#D6DEEA',
    borderRadius: theme.borders.radius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md - theme.spacing.xs,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.normal,
    color: '#465264',
    backgroundColor: theme.colors.background.primary,
    shadowColor: '#90A4C6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  inputError: {
    borderColor: theme.colors.semantic.error,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.error,
    marginTop: theme.spacing.sm,
  },
});
