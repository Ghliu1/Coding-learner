// Small reusable UI primitives shared across screens.

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../theme/theme';

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style,
}) => <View style={[styles.card, style]}>{children}</View>;

export const Button: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}> = ({ title, onPress, variant = 'primary', disabled, loading, style }) => {
  const bg =
    variant === 'primary'
      ? theme.colors.accent
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'ghost'
          ? 'transparent'
          : theme.colors.surfaceAlt;
  const color = variant === 'primary' || variant === 'danger' ? '#0b0f14' : theme.colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 1, borderColor: theme.colors.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.buttonText, { color }]}>{title}</Text>
      )}
    </Pressable>
  );
};

export const Badge: React.FC<{ text: string; color?: string; textStyle?: TextStyle }> = ({
  text,
  color = theme.colors.surfaceAlt,
  textStyle,
}) => (
  <View style={[styles.badge, { backgroundColor: color }]}>
    <Text style={[styles.badgeText, textStyle]}>{text}</Text>
  </View>
);

export const ProgressBar: React.FC<{ percent: number; color?: string }> = ({
  percent,
  color = theme.colors.success,
}) => (
  <View style={styles.progressTrack}>
    <View
      style={[
        styles.progressFill,
        { width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: color },
      ]}
    />
  </View>
);

export const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontWeight: '700', fontSize: 15 },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: { color: theme.colors.text, fontSize: 11, fontWeight: '600' },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing(1.5),
  },
});
