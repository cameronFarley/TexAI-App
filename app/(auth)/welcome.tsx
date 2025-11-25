import { useAppearance } from "@/providers/AppearanceProvider";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Placeholder image
const TMP_IMAGE = "https://images.unsplash.com/photo-1639674242803-a9de33b3a835?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function Welcome() {
  const { colors, scaleFont } = useAppearance();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Image Section */}
      <View style={styles.cardsContainer}>
        <View style={[styles.cardWrapper, styles.cardCenter, { backgroundColor: colors.card }]}>
          <Image source={{uri: TMP_IMAGE}} style={styles.cardImage} />
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: colors.text, fontSize: scaleFont(35) },
          ]}
        >
          TexAI
        </Text>

        <View style={styles.taglineRow}>
          <Text style={[styles.taglineText, { color: colors.muted, fontSize: scaleFont(18) }]}>Learn</Text>
          <Text style={[styles.chevron, { color: colors.muted, fontSize: scaleFont(16) }]}>{'>'}</Text>
          <Text style={[styles.taglineText, { color: colors.muted, fontSize: scaleFont(18) }]}>Practice</Text>
          <Text style={[styles.chevron, { color: colors.muted, fontSize: scaleFont(16) }]}>{'>'}</Text>
          <Text style={[styles.taglineText, { color: colors.muted, fontSize: scaleFont(18) }]}>Succeed</Text>
        </View>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.muted,
              fontSize: scaleFont(16),
              lineHeight: scaleFont(24),
            },
          ]}
        >
          Your new favorite cybersecurity learning tool,{'\n'}curated for Texas Law Enforcement.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.cardButton,
            { backgroundColor: colors.card },
          ]}
          onPress={() => router.push("/(auth)/signup/name")}
        >
          <Text
            style={[
              styles.cardButtonText,
              { fontSize: scaleFont(18), color: colors.primary },
            ]}
          >
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => router.replace("/(main)/home/home")}
        >
          <Text
            style={[
              styles.primaryButtonText,
              { color: colors.onPrimary, fontSize: scaleFont(18) },
            ]}
          >
            Log In
          </Text>
        </TouchableOpacity>

        <Text style={[styles.legalText, { color: colors.muted }]}>
           By continuing you agree to TexAI's{'\n'}
           <Text style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text> and <Text style={{ textDecorationLine: 'underline' }}>Terms and Conditions</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingBottom: 40,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  // Image
  cardsContainer: {
    height: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative', 
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    padding: 0,
    borderRadius: 12,
    position: 'absolute',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  cardCenter: {
    transform: [{ rotate: '0deg' }, { translateY: -10 }],
    zIndex: 2,
  },

  // Text Content
  content: {
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "DMSerifDisplay", 
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
    fontFamily: 'DMSans-Regular',
  },
  taglineText: {
    fontWeight: '600',
  },
  chevron: {
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 10,
  },

  // Buttons
  buttonContainer: {
    gap: 16,
    marginTop: 20,
  },
  cardButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardButtonText: {
    fontWeight: "700",
    fontFamily: 'DMSans-Bold',
  },
  primaryButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "700",
  },
  legalText: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 10,
    lineHeight: 16,
  },
});