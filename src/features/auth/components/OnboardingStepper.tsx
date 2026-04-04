import { Check } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../theme';

export interface OnboardingStepDefinition {
  id: string;
  title: string;
  subtitle: string;
}

interface OnboardingStepperProps {
  steps: OnboardingStepDefinition[];
  currentStep: number;
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  steps,
  currentStep,
}) => (
  <View style={styles.container}>
    {steps.map((step, index) => {
      const isCompleted = index < currentStep;
      const isActive = index === currentStep;

      return (
        <React.Fragment key={step.id}>
          <View style={styles.stepColumn} key={step.id}>
            <View
              style={[
                styles.circle,
                isCompleted && styles.completedCircle,
                isActive && styles.activeCircle,
              ]}
            >
              {isCompleted ? (
                <Check size={18} color={theme.colors.text.inverse} strokeWidth={2.5} />
              ) : (
                <Text
                  style={[
                    styles.circleText,
                    isActive && styles.activeCircleText,
                    isCompleted && styles.completedCircleText,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.title, isActive && styles.activeTitle]}>{step.title}</Text>
            {/* <Text style={styles.subtitle}>{step.subtitle}</Text> */}
          </View>

          {index < steps.length - 1 ? <View style={styles.connector} /> : null}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borders.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.coolGray[200],
    ...theme.shadows.md,
  },
  stepColumn: {
    flex: 1,
    alignItems: 'center',
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 2,
    borderColor: theme.colors.coolGray[300],
    marginBottom: theme.spacing.sm,
  },
  activeCircle: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  completedCircle: {
    backgroundColor: theme.colors.success[500],
    borderColor: theme.colors.success[500],
  },
  circleText: {
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.md,
  },
  activeCircleText: {
    color: theme.colors.text.inverse,
  },
  completedCircleText: {
    color: theme.colors.text.inverse,
  },
  connector: {
    height: 2,
    flex: 0.18,
    marginTop: 21,
    marginHorizontal: -6,
    backgroundColor: theme.colors.coolGray[300],
  },
  title: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    lineHeight: theme.typography.lineHeight.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: 2,
  },
  activeTitle: {
    color: theme.colors.primary[600],
  },
  subtitle: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    lineHeight: theme.typography.lineHeight.xs,
    color: theme.colors.text.secondary,
    maxWidth: 84,
  },
});
