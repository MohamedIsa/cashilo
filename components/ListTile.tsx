import { useAppTheme } from '@/contexts/ThemeContext';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ListTileProps = {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  enablePress?: boolean;
  onPress?: () => void;
};

const ListTile: React.FC<ListTileProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  enablePress = false,
  onPress,
}) => {
  const styles = useStyles();
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!enablePress}
    >
      {leading && <View style={styles.leading}>{leading}</View>}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {trailing && <View style={styles.trailing}>{trailing}</View>}
    </TouchableOpacity>
  );
};

// const styles = StyleSheet.create({

// });

const useStyles = () => {
  const theme = useAppTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 20,
          backgroundColor: theme.background,
        },
        leading: {
          marginRight: 12,
        },
        textContainer: {
          flex: 1,
        },
        title: {
          fontSize: 16,
          color: theme.primaryText,
        },
        subtitle: {
          fontSize: 14,
          color: theme.secondary,
          marginTop: 2,
        },
        trailing: {
          marginLeft: 12,
        },
      }),
    [theme],
  );
  return styles;
};

export default ListTile;
