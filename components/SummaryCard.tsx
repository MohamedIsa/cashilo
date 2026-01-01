import { useAppTheme } from '@/contexts/ThemeContext';
import { Text, View } from 'react-native';

type SummaryCardProps = {
  title: string;
  amount: string | number;
  icon: React.ReactNode;
  color: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, color }) => {
  const styles = useStyles(color);
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>{amount} BHD</Text>
    </View>
  );
};
export default SummaryCard;

const useStyles = (color: string) => {
  const theme = useAppTheme();
  return {
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center' as const,
      width: 150,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: color,
    },
    iconContainer: {
      backgroundColor: `${color}33`,
      padding: 10,
      borderRadius: 25,
      marginBottom: 12,
    },
    title: {
      color: theme.primaryText,
      fontSize: 16,
      marginBottom: 8,
    },
    amount: {
      color: theme.primary,
      fontSize: 20,
      fontWeight: 'bold' as const,
    },
  };
};
