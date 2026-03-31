import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "subtle";
  size?: "regular" | "hero";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function ActionButton({
  label,
  onPress,
  variant = "primary",
  size = "regular",
  style,
  testID,
}: ActionButtonProps) {
  const variantStyles: Record<string, ViewStyle> = {
    primary: styles.primaryButton,
    ghost: styles.ghostButton,
    subtle: styles.subtleButton,
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.baseButton,
        size === "hero" && styles.heroButton,
        variantStyles[variant],
        style,
        pressed && styles.pressed,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.label,
          variant === "ghost" && styles.ghostLabel,
          variant === "subtle" && styles.subtleLabel,
          size === "hero" && styles.heroLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#EF476F",
    shadowColor: "#EF476F",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },
  ghostButton: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
  },
  subtleButton: {
    backgroundColor: "rgba(26,26,26,0.08)",
  },
  heroButton: {
    minHeight: 62,
    paddingVertical: 18,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ghostLabel: {
    color: "#FFFFFF",
  },
  subtleLabel: {
    color: "#1A1A1A",
  },
  heroLabel: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
});