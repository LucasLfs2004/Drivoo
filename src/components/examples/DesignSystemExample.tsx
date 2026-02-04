import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Container } from '../common';
import { FormInput } from '../forms';
import { theme } from '../../themes';

export const DesignSystemExample: React.FC = () => {
  return (
    <Container>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Sistema de Design Drivoo</Text>
        
        {/* Buttons */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Botões</Text>
          <View style={styles.buttonRow}>
            <Button title="Primary" onPress={() => {}} variant="primary" size="sm" />
            <Button title="Secondary" onPress={() => {}} variant="secondary" size="sm" />
            <Button title="Outline" onPress={() => {}} variant="outline" size="sm" />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Medium" onPress={() => {}} variant="primary" size="md" />
            <Button title="Loading" onPress={() => {}} variant="primary" loading />
          </View>
          <Button title="Large Button" onPress={() => {}} variant="primary" size="lg" />
        </Card>

        {/* Form Inputs */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Formulários</Text>
          <FormInput
            label="Nome completo"
            placeholder="Digite seu nome"
            required
          />
          <FormInput
            label="Email"
            placeholder="Digite seu email"
            keyboardType="email-address"
          />
          <FormInput
            label="Campo com erro"
            placeholder="Digite algo"
            error="Este campo é obrigatório"
          />
        </Card>

        {/* Cards */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Card Elevado</Text>
          <Text style={styles.text}>Este é um card com sombra elevada.</Text>
        </Card>

        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitle}>Card com Borda</Text>
          <Text style={styles.text}>Este é um card com borda.</Text>
        </Card>

        <Card variant="filled" style={styles.section}>
          <Text style={styles.sectionTitle}>Card Preenchido</Text>
          <Text style={styles.text}>Este é um card com fundo preenchido.</Text>
        </Card>

        {/* Colors */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Paleta de Cores Drivoo</Text>
          
          {/* Cores Principais */}
          <Text style={styles.colorGroupTitle}>Cores Principais</Text>
          <View style={styles.colorRow}>
            <View style={styles.colorContainer}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.primary[500] }]} />
              <Text style={styles.colorLabel}>Azul Principal</Text>
              <Text style={styles.colorCode}>#0061CC</Text>
            </View>
            <View style={styles.colorContainer}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary[500] }]} />
              <Text style={styles.colorLabel}>Azul Médio</Text>
              <Text style={styles.colorCode}>#148AD9</Text>
            </View>
            <View style={styles.colorContainer}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.accent[500] }]} />
              <Text style={styles.colorLabel}>Azul Claro</Text>
              <Text style={styles.colorCode}>#17C8FD</Text>
            </View>
          </View>
          
          <View style={styles.colorRow}>
            <View style={styles.colorContainer}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.success[500] }]} />
              <Text style={styles.colorLabel}>Verde</Text>
              <Text style={styles.colorCode}>#13B57D</Text>
            </View>
            <View style={styles.colorContainer}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.warning[500] }]} />
              <Text style={styles.colorLabel}>Amarelo</Text>
              <Text style={styles.colorCode}>#FF9800</Text>
            </View>
            <View style={styles.colorContainer}>
              <View style={[styles.colorBox, { backgroundColor: theme.colors.semantic.error }]} />
              <Text style={styles.colorLabel}>Vermelho</Text>
              <Text style={styles.colorCode}>#F44336</Text>
            </View>
          </View>

          {/* Paleta Neutra */}
          <Text style={styles.colorGroupTitle}>Paleta Neutra (Dark/Light Mode Ready)</Text>
          <View style={styles.neutralRow}>
            {[0, 100, 300, 500, 700, 900].map((shade) => (
              <View key={shade} style={styles.neutralContainer}>
                <View 
                  style={[
                    styles.neutralBox, 
                    { backgroundColor: theme.colors.neutral[shade as keyof typeof theme.colors.neutral] }
                  ]} 
                />
                <Text style={styles.neutralLabel}>{shade}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  colorContainer: {
    alignItems: 'center',
    flex: 1,
  },
  colorBox: {
    width: theme.scaleUtils.moderateScale(50),
    height: theme.scaleUtils.moderateScale(50),
    borderRadius: theme.borders.radius.md,
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  colorLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  colorCode: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  colorGroupTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  neutralRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  neutralContainer: {
    alignItems: 'center',
  },
  neutralBox: {
    width: theme.scaleUtils.moderateScale(40),
    height: theme.scaleUtils.moderateScale(40),
    borderRadius: theme.borders.radius.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: theme.borders.width.thin,
    borderColor: theme.colors.border.light,
  },
  neutralLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
});