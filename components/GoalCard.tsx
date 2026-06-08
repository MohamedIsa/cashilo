import { radius, shadow, spacing, typography, withAlpha } from '@/contants/theme';
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
  const accentColor = completed ? theme.secondary : theme.primary;

  return (
    <View
      style={{
        backgroundColor: completed ? withAlpha(theme.secondary, 0.08) : theme.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginVertical: spacing.sm,
        ...shadow.sm,
        borderWidth: completed ? 1 : 0,
        borderColor: completed ? withAlpha(theme.secondary, 0.25) : undefined,
      }}
    >
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.pill,
            backgroundColor: withAlpha(accentColor, 0.12),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialIcons
            name={completed ? 'emoji-events' : 'flag'}
            size={22}
            color={accentColor}
          />
        </View>

        <Text style={{ flex: 1, color: theme.headline, ...typography.heading }} numberOfLines={1}>
          {goal.name}
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} hitSlop={8} style={{ padding: spacing.xs }}>
              <MaterialIcons name="edit" size={20} color={theme.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} hitSlop={8} style={{ padding: spacing.xs }}>
              <MaterialIcons name="delete-outline" size={20} color={theme.error} />
            </TouchableOpacity>
          )}
          {onStopChanged && (
            <TouchableOpacity
              onPress={() => onStopChanged(!goal.stopped)}
              hitSlop={8}
              style={{
                width: 24,
                height: 24,
                borderRadius: radius.sm,
                borderWidth: 2,
                borderColor: theme.primary,
                backgroundColor: goal.stopped ? theme.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {goal.stopped && <MaterialIcons name="check" size={14} color="#fff" />}
            </TouchableOpacity>
          )}
          {onReactivate && (
            <TouchableOpacity onPress={onReactivate} hitSlop={8} style={{ padding: spacing.xs }}>
              <MaterialIcons name="refresh" size={22} color={theme.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 10,
          backgroundColor: withAlpha(accentColor, 0.15),
          borderRadius: radius.pill,
          overflow: 'hidden',
          marginBottom: spacing.sm,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percent * 100}%`,
            backgroundColor: accentColor,
            borderRadius: radius.pill,
          }}
        />
      </View>

      {/* Amounts + percent */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: theme.primaryText, ...typography.body }} selectable>
          {currency}{goal.savedAmount.toFixed(2)}
          <Text style={{ opacity: 0.5 }}> / {currency}{goal.targetAmount.toFixed(2)}</Text>
        </Text>
        <Text style={{ color: accentColor, ...typography.label }}>
          {(percent * 100).toFixed(0)}%
        </Text>
      </View>

      {completed && (
        <Text style={{ color: theme.secondary, ...typography.label, marginTop: spacing.sm }}>
          {t('goalCompleted')}
        </Text>
      )}
    </View>
  );
};

export default GoalCard;
