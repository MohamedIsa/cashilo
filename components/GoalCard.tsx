import { useAppTheme } from '@/contexts/ThemeContext';
import { Goal } from '@/model/Goal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

type GoalCardProps = {
  goal: Goal;
  completed: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStopChanged?: (stopped: boolean) => void;
  onReactivate?: () => void;
  currency?: string;
};

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  completed,
  onEdit,
  onDelete,
  onStopChanged,
  onReactivate,
  currency = '$',
}) => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const percent = Math.min(goal.savedAmount / goal.targetAmount, 1);
  const bgColor = completed ? `${theme.secondary}1F` : theme.card;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <MaterialIcons
          name={completed ? 'emoji-events' : 'flag'}
          size={28}
          color={completed ? theme.secondary : theme.primary}
          style={{ marginRight: 10 }}
        />
        <Text
          style={{ flex: 1, color: theme.headline, fontWeight: 'bold', fontSize: 16 }}
          numberOfLines={1}
        >
          {goal.name}
        </Text>

        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={{ padding: 4 }}>
            <MaterialIcons name="edit" size={20} color={theme.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
            <MaterialIcons name="delete" size={20} color={theme.error} />
          </TouchableOpacity>
        )}
        {onStopChanged && (
          <TouchableOpacity
            onPress={() => onStopChanged(!goal.stopped)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: goal.stopped ? theme.primary : theme.primary,
              backgroundColor: goal.stopped ? theme.primary : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 4,
            }}
          >
            {goal.stopped && (
              <MaterialIcons name="check" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        )}
        {onReactivate && (
          <TouchableOpacity onPress={onReactivate} style={{ padding: 4 }}>
            <MaterialIcons name="refresh" size={22} color={theme.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 18,
          backgroundColor: `${theme.primary}22`,
          borderRadius: 9,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percent * 100}%`,
            backgroundColor: theme.primary,
            borderRadius: 9,
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: theme.primaryText, fontWeight: 'bold', fontSize: 11 }}>
            {(percent * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Amounts */}
      <Text style={{ color: theme.primaryText, fontWeight: '500', fontSize: 14 }}>
        {t('saved')}: {currency}{goal.savedAmount.toFixed(2)} / {currency}{goal.targetAmount.toFixed(2)}
      </Text>

      {completed && (
        <Text style={{ color: theme.secondary, fontWeight: 'bold', marginTop: 6 }}>
          {t('goalCompleted')}
        </Text>
      )}
    </View>
  );
};

export default GoalCard;
