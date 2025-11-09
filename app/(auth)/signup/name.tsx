import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useAppearance } from "@/providers/AppearanceProvider";

/* 
This page opens when a user wants to create an account from the welcome screen 
It current asks for a first name and last name
- Add an account system tied to email and password
- Add an option for google account?
- Add an ability for multiple account? Very likely not a necessary feature.
*/

export default function NameInput() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { colors, scaleFont } = useAppearance();

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please enter both first and last name");
      return;
    }
    
    try {
      // Save user data
      await AsyncStorage.setItem("userFirstName", firstName.trim());
      await AsyncStorage.setItem("userLastName", lastName.trim());
      await AsyncStorage.setItem("isLoggedIn", "true");
      
      // Navigate to tabs
      router.replace("/(main)/home/home");
    } catch (error) {
      console.error("Failed to save user names:", error);
      Alert.alert("Error", "Failed to save your information");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: scaleFont(32),
          fontWeight: "bold",
          marginBottom: 10,
        }}
      >
        What’s your name?
      </Text>

      <Text
        style={{
          color: colors.muted,
          fontSize: scaleFont(16),
          marginBottom: 30,
        }}
      >
        Let’s get to know you better
      </Text>

      {/* Entry boxes */}
      <TextInput
        placeholder="First name"
        placeholderTextColor={colors.muted}
        value={firstName}
        onChangeText={setFirstName}
        style={{
          marginTop: 20,
          color: colors.text,
          backgroundColor: colors.inputBackground,
          padding: 14,
          borderRadius: 10,
          fontSize: scaleFont(16),
        }}
      />

      <TextInput
        placeholder="Last name"
        placeholderTextColor={colors.muted}
        value={lastName}
        onChangeText={setLastName}
        style={{
          marginTop: 10,
          color: colors.text,
          backgroundColor: colors.inputBackground,
          padding: 14,
          borderRadius: 10,
          fontSize: scaleFont(16),
        }}
      />

      {/* Submission button */}
      <TouchableOpacity
        style={{
          marginTop: 40,
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
        onPress={handleContinue}
      >
        <Text
          style={{
            color: colors.onPrimary,
            fontSize: scaleFont(16),
            fontWeight: "600",
          }}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}
