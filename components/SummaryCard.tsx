import { useAppTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

type SummaryCardProps = {
  title: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
  currency?: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon, color, currency = '$' }) => {
  const theme = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: `${color}30`,
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${color}26`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          color: theme.headline,
          fontWeight: '600',
          fontSize: 15,
          letterSpacing: 0.2,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: color,
          fontWeight: 'bold',
          fontSize: 20,
          letterSpacing: 0.5,
        }}
      >
        {currency}{amount.toFixed(2)}
      </Text>
    </View>
  );
};

export default SummaryCard;

