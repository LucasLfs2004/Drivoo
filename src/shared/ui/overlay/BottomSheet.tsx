import {
  type BottomSheetBackdropProps,
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '../../../theme';
import { Typography } from '../primitives/Typography';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showHeader?: boolean;
  children: React.ReactNode;
  snapPoints?: Array<string | number>;
  scrollable?: boolean;
  footer?: React.ReactNode;
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  showHeader,
  children,
  snapPoints,
  scrollable = false,
  footer,
}) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const shouldShowHeader = showHeader ?? Boolean(title);
  const resolvedSnapPoints = useMemo(() => snapPoints ?? ['55%', '80%'], [snapPoints]);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.36}
      />
    ),

    [],
  );

  const handleClose = useCallback(() => {
    modalRef.current?.dismiss();
  }, []);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
      return;
    }

    modalRef.current?.dismiss();
  }, [visible]);

  const content = scrollable ? (
    <BottomSheetScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </BottomSheetScrollView>
  ) : (
    <BottomSheetView style={styles.staticContent}>{children}</BottomSheetView>
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={resolvedSnapPoints}
      onDismiss={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.container}>
        {shouldShowHeader && (
          <View style={styles.header}>
            {title && <Typography variant="h4">{title}</Typography>}
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <X color={theme.colors.text.primary} size={18} />
            </Pressable>
          </View>
        )}
        {content}
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borders.radius.xl,
    borderTopRightRadius: theme.borders.radius.xl,
  },
  handleIndicator: {
    width: 44,
    backgroundColor: theme.colors.coolGray[400],
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    rowGap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borders.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  staticContent: {
    rowGap: theme.spacing.md,
  },
  scrollContent: {
    paddingBottom: theme.spacing.md,
    rowGap: theme.spacing.md,
  },
});
