import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export interface StepFlowItem {
  id: string;
  render: () => React.ReactNode;
}

interface StepFlowHeaderRenderParams {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => Promise<boolean>;
  goBack: () => Promise<boolean>;
  goToStep: (stepIndex: number) => Promise<boolean>;
}

type StepFlowFooterRenderParams = StepFlowHeaderRenderParams;

export interface StepFlowProps {
  steps: StepFlowItem[];
  currentStep: number;
  onStepChange?: (nextStep: number) => void;
  onBeforeNext?: (currentStep: number) => boolean | Promise<boolean>;
  onBeforeBack?: (currentStep: number) => boolean | Promise<boolean>;
  animationDurationMs?: number;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  renderHeader?: (params: StepFlowHeaderRenderParams) => React.ReactNode;
  renderFooter?: (params: StepFlowFooterRenderParams) => React.ReactNode;
}

const DEFAULT_DURATION_MS = 220;
const TRANSLATE_X = 20;

const clampStepIndex = (stepIndex: number, totalSteps: number) => {
  if (totalSteps <= 0) {
    return 0;
  }

  return Math.min(Math.max(stepIndex, 0), totalSteps - 1);
};

const renderStepContent = (step: StepFlowItem | undefined) => {
  if (!step) {
    return null;
  }

  return step.render();
};

export const StepFlow: React.FC<StepFlowProps> = ({
  steps,
  currentStep,
  onStepChange,
  onBeforeNext,
  onBeforeBack,
  animationDurationMs = DEFAULT_DURATION_MS,
  containerStyle,
  contentContainerStyle,
  renderHeader,
  renderFooter,
}) => {
  const safeCurrentStep = useMemo(
    () => clampStepIndex(currentStep, steps.length),
    [currentStep, steps.length]
  );

  const [displayedStep, setDisplayedStep] = useState(safeCurrentStep);
  const [incomingStep, setIncomingStep] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [heightByStep, setHeightByStep] = useState<Record<number, number>>({});

  const progress = useRef(new Animated.Value(1)).current;
  const isTransitioningRef = useRef(false);
  const queuedStepRef = useRef<number | null>(null);
  const latestDisplayedStepRef = useRef(displayedStep);

  useEffect(() => {
    latestDisplayedStepRef.current = displayedStep;
  }, [displayedStep]);

  useEffect(() => {
    if (!steps.length) {
      setDisplayedStep(0);
      setIncomingStep(null);
      return;
    }

    setDisplayedStep(previousStep => clampStepIndex(previousStep, steps.length));
    setIncomingStep(previousStep =>
      previousStep === null ? null : clampStepIndex(previousStep, steps.length)
    );
  }, [steps.length]);

  const commitHeight = useCallback((stepIndex: number, event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);

    setHeightByStep(previousHeights => {
      if (previousHeights[stepIndex] === nextHeight) {
        return previousHeights;
      }

      return {
        ...previousHeights,
        [stepIndex]: nextHeight,
      };
    });
  }, []);

  const finishTransition = useCallback((nextDisplayedStep: number) => {
    setDisplayedStep(nextDisplayedStep);
    setIncomingStep(null);
    progress.setValue(1);
    isTransitioningRef.current = false;

    if (
      queuedStepRef.current !== null &&
      queuedStepRef.current !== nextDisplayedStep
    ) {
      const queuedStep = queuedStepRef.current;
      queuedStepRef.current = null;
      setTimeout(() => {
        setIncomingStep(queuedStep);
      }, 0);
      return;
    }

    queuedStepRef.current = null;
  }, [progress]);

  useEffect(() => {
    if (!steps.length) {
      return;
    }

    if (incomingStep !== null) {
      return;
    }

    if (safeCurrentStep === displayedStep) {
      return;
    }

    if (isTransitioningRef.current) {
      queuedStepRef.current = safeCurrentStep;
      return;
    }

    setDirection(safeCurrentStep > displayedStep ? 1 : -1);
    setIncomingStep(safeCurrentStep);
  }, [displayedStep, incomingStep, safeCurrentStep, steps.length]);

  useEffect(() => {
    if (incomingStep === null) {
      return;
    }

    isTransitioningRef.current = true;
    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration: animationDurationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        isTransitioningRef.current = false;
        return;
      }

      finishTransition(incomingStep);
    });
  }, [animationDurationMs, finishTransition, incomingStep, progress]);

  const goToStep = useCallback(
    async (targetStepIndex: number) => {
      if (!steps.length) {
        return false;
      }

      const nextStep = clampStepIndex(targetStepIndex, steps.length);
      const activeStep = clampStepIndex(latestDisplayedStepRef.current, steps.length);

      if (nextStep === activeStep) {
        return true;
      }

      if (nextStep > activeStep && onBeforeNext) {
        const canProceed = await onBeforeNext(activeStep);
        if (!canProceed) {
          return false;
        }
      }

      if (nextStep < activeStep && onBeforeBack) {
        const canGoBack = await onBeforeBack(activeStep);
        if (!canGoBack) {
          return false;
        }
      }

      onStepChange?.(nextStep);
      return true;
    },
    [onBeforeBack, onBeforeNext, onStepChange, steps.length]
  );

  const goNext = useCallback(() => goToStep(safeCurrentStep + 1), [goToStep, safeCurrentStep]);
  const goBack = useCallback(() => goToStep(safeCurrentStep - 1), [goToStep, safeCurrentStep]);

  const currentStepHeight = heightByStep[displayedStep] ?? 0;
  const incomingStepHeight = incomingStep === null ? 0 : heightByStep[incomingStep] ?? 0;
  const contentMinHeight =
    incomingStep === null
      ? currentStepHeight || undefined
      : Math.max(currentStepHeight, incomingStepHeight) || undefined;

  const outgoingStep = steps[displayedStep];
  const enteringStep = incomingStep === null ? undefined : steps[incomingStep];
  const isFirstStep = safeCurrentStep === 0;
  const isLastStep = safeCurrentStep === steps.length - 1;

  return (
    <View style={containerStyle}>
      {renderHeader?.({
        currentStep: safeCurrentStep,
        totalSteps: steps.length,
        isFirstStep,
        isLastStep,
        goNext,
        goBack,
        goToStep,
      })}

      <View
        style={[
          styles.contentContainer,
          { minHeight: contentMinHeight },
          contentContainerStyle,
        ]}
      >
        {incomingStep === null ? (
          <View onLayout={event => commitHeight(displayedStep, event)}>
            {renderStepContent(outgoingStep)}
          </View>
        ) : (
          <>
            <Animated.View
              onLayout={event => commitHeight(displayedStep, event)}
              style={[
                styles.transitionLayer,
                {
                  opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                  transform: [
                    {
                      translateX: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -direction * TRANSLATE_X],
                      }),
                    },
                  ],
                },
              ]}
            >
              {renderStepContent(outgoingStep)}
            </Animated.View>

            <Animated.View
              onLayout={event => commitHeight(incomingStep, event)}
              style={[
                styles.transitionLayer,
                styles.incomingLayer,
                {
                  opacity: progress,
                  transform: [
                    {
                      translateX: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [direction * TRANSLATE_X, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {renderStepContent(enteringStep)}
            </Animated.View>
          </>
        )}
      </View>

      {renderFooter?.({
        currentStep: safeCurrentStep,
        totalSteps: steps.length,
        isFirstStep,
        isLastStep,
        goNext,
        goBack,
        goToStep,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    position: 'relative',
  },
  transitionLayer: {
    width: '100%',
  },
  incomingLayer: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
