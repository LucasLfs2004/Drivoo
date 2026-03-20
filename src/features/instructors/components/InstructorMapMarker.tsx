import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../../../theme';

interface InstructorMapMarkerProps {
  instructor: {
    id: string;
    primeiroNome: string;
    ultimoNome: string;
    avatar?: string;
    avaliacoes: {
      media: number;
    };
    precos: {
      valorHora: number;
    };
  };
  isSelected?: boolean;
}

export const InstructorMapMarker: React.FC<InstructorMapMarkerProps> = ({
  instructor,
  isSelected = false,
}) => {
  const renderAvatar = () => {
    if (instructor.avatar) {
      return <Image source={{ uri: instructor.avatar }} style={styles.avatar} />;
    }
    
    const initials = `${instructor.primeiroNome[0]}${instructor.ultimoNome[0]}`.toUpperCase();
    
    return (
      <View style={styles.defaultAvatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isSelected && styles.selectedContainer]}>
      <View style={[styles.marker, isSelected && styles.selectedMarker]}>
        {renderAvatar()}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {instructor.primeiroNome}
          </Text>
          <View style={styles.details}>
            <Text style={styles.rating}>⭐ {instructor.avaliacoes.media}</Text>
            <Text style={styles.price}>R$ {instructor.precos.valorHora}/h</Text>
          </View>
        </View>
      </View>
      <View style={[styles.arrow, isSelected && styles.selectedArrow]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  selectedContainer: {
    zIndex: 1000,
  },
  marker: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borders.radius.lg,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    maxWidth: 160,
    ...theme.shadows.md,
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  selectedMarker: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
    ...theme.shadows.lg,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  price: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.semantic.success,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.primary[500],
    marginTop: -1,
  },
  selectedArrow: {
    borderTopColor: theme.colors.primary[600],
  },
});
