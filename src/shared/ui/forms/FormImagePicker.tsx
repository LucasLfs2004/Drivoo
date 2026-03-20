import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../theme';

export interface FormImagePickerProps {
  label?: string;
  placeholder?: string;
  value?: string; // URI da imagem
  onImageSelect: (imageUri: string) => void;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  multiple?: boolean;
  maxImages?: number;
}

export const FormImagePicker: React.FC<FormImagePickerProps> = ({
  label,
  placeholder = 'Selecionar imagem',
  value,
  onImageSelect,
  error,
  required = false,
  containerStyle,
  disabled = false,
  multiple = false,
  maxImages = 5,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const showImagePicker = () => {
    Alert.alert(
      'Selecionar Imagem',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: () => openCamera(),
        },
        {
          text: 'Galeria',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    try {
      setIsLoading(true);
      // Mock camera functionality
      // In a real app, you'd use react-native-image-picker or expo-image-picker
      setTimeout(() => {
        const mockImageUri = 'https://via.placeholder.com/300x200/4285F4/FFFFFF?text=Camera+Image';
        onImageSelect(mockImageUri);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível abrir a câmera');
    }
  };

  const openGallery = async () => {
    try {
      setIsLoading(true);
      // Mock gallery functionality
      // In a real app, you'd use react-native-image-picker or expo-image-picker
      setTimeout(() => {
        const mockImageUri = 'https://via.placeholder.com/300x200/34A853/FFFFFF?text=Gallery+Image';
        onImageSelect(mockImageUri);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível abrir a galeria');
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remover Imagem',
      'Tem certeza que deseja remover esta imagem?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onImageSelect(''),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {value ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: value }} style={styles.selectedImage} />
          <View style={styles.imageOverlay}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={showImagePicker}
              disabled={disabled || isLoading}
            >
              <Text style={styles.changeButtonText}>Alterar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeImage}
              disabled={disabled || isLoading}
            >
              <Text style={styles.removeButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.pickerButton,
            error && styles.pickerButtonError,
            disabled && styles.pickerButtonDisabled,
          ]}
          onPress={showImagePicker}
          disabled={disabled || isLoading}
        >
          <View style={styles.pickerContent}>
            <Text style={styles.pickerIcon}>📷</Text>
            <Text
              style={[
                styles.pickerText,
                disabled && styles.disabledText,
              ]}
            >
              {isLoading ? 'Carregando...' : placeholder}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
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
  required: {
    color: theme.colors.semantic.error,
  },
  pickerButton: {
    borderWidth: theme.borders.width.base,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borders.radius.md,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.background.secondary,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerButtonError: {
    borderColor: theme.colors.semantic.error,
  },
  pickerButtonDisabled: {
    opacity: 0.6,
  },
  pickerContent: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  pickerIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  pickerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borders.radius.md,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borders.radius.md,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
  },
  changeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borders.radius.sm,
  },
  changeButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  removeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: theme.borders.radius.sm,
  },
  removeButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.error,
    marginTop: theme.spacing.xs,
  },
});