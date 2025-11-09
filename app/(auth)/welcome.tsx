import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppearance } from "@/providers/AppearanceProvider";

/* 
Welcome screen,  when you launch the app for the first time this is what shows
Prompts the user with the option to create an account or log in to one
*/

export default function Welcome() {
  const { colors, scaleFont } = useAppearance();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="calendar" size={80} color={colors.primary} />
        </View>

        <Text
          style={[
            styles.title,
            { color: colors.text, fontSize: scaleFont(32) },
          ]}
        >
          Welcome to TexAI
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.muted,
              fontSize: scaleFont(18),
              lineHeight: scaleFont(26),
            },
          ]}
        >
          Organize your schedule and chat with AI - all in one place
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => router.push("/(auth)/signup/name")}
        >
          <Text
            style={[
              styles.primaryButtonText,
              { fontSize: scaleFont(18), color: colors.onPrimary },
            ]}
          >
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { backgroundColor: colors.card },
          ]}
          onPress={() => router.replace("/(main)/home/home")}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              { color: colors.primary, fontSize: scaleFont(16) },
            ]}
          >
            Already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 40,
  },
  primaryButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "600",
  },
  secondaryButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
});
