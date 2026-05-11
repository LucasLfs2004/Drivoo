import theme from '@/theme';
import { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Typography } from '../primitives/Typography';

interface InfoDisplayProps {
  title: string;
  info: string;
  icon: LucideIcon;
}

export const InfoDisplay = ({ title, info, icon: Icon }: InfoDisplayProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Icon color={theme.colors.primary[500]} size={18} />
        <Typography color="contrast" variant="body" weight={'medium'}>
          {title}
        </Typography>
      </View>
      <Typography color="primary" variant="body" weight={'normal'} style={styles.infoText}>
        {info}
        {/* {formatDate(bookingData.date)} às {bookingData.timeSlot} */}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
  infoText: {
    marginLeft: 26, // Para alinhar com o texto do título, considerando o ícone
  },
});
