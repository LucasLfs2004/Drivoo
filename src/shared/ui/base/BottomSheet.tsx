import {
  type BottomSheetBackdropProps,
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../theme';

const renderBottomSheetBackdrop = (backdropProps: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...backdropProps}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.36}
  />
);

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: Array<string | number>;
  scrollable?: boolean;
};

export const BottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  title,
  children,
  snapPoints,
  scrollable = false,
}) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const resolvedSnapPoints = useMemo(
    () => snapPoints ?? ['55%', '80%'],
    [snapPoints]
  );

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
      backdropComponent={renderBottomSheetBackdrop}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title ?? ''}</Text>
          <Pressable style={styles.closeButton} onPress={() => modalRef.current?.dismiss()}>
            <X color={theme.colors.text.primary} size={18} />
          </Pressable>
        </View>
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
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
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
