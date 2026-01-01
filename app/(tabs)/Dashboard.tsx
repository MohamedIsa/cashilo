import SummaryCard from '@/components/SummaryCard';
import { useAppTheme } from '@/contexts/ThemeContext';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

function Dashboard() {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SummaryCard
          title="Revenue"
          amount={5000}
          icon={<FontAwesome6 name="wallet" size={24} color="#4CAF50" />}
          color="#4CAF50"
        />
        <SummaryCard
          title="Expenses"
          amount={2000}
          icon={<FontAwesome6 name="credit-card" size={24} color="#F44336" />}
          color="#F44336"
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          title="Savings"
          amount={1500}
          icon={<FontAwesome6 name="piggy-bank" size={24} color="#2196F3" />}
          color="#2196F3"
        />
        <SummaryCard
          title="Investments"
          amount={3000}
          icon={<FontAwesome6 name="chart-line" size={24} color="#FF9800" />}
          color="#FF9800"
        />
      </View>
    </View>
  );
}
export default Dashboard;

const useStyles = () => {
  const theme = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: theme.background,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginBottom: 20,
        },
      }),
    [theme],
  );
  return styles;
};
