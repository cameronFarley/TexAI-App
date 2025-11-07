import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function NameInput() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to save your information");
    }
  };

  return (
    <View style={{
      flex: 1,
      padding: 20,
      backgroundColor: "black",
      justifyContent: "center"
    }}>
      <Text style={{ 
        color: "white", 
        fontSize: 32, 
        fontWeight: "bold",
        marginBottom: 10
      }}>
        What's your name?
      </Text>
      
      <Text style={{ 
        color: "#888", 
        fontSize: 16,
        marginBottom: 30
      }}>
        Let's get to know you better
      </Text>

      <TextInput
        placeholder="First name"
        placeholderTextColor="#777"
        value={firstName}
        onChangeText={setFirstName}
        style={{
          marginTop: 20,
          color: "white",
          backgroundColor: "#1E1E1E",
          padding: 14,
          borderRadius: 10,
          fontSize: 16
        }}
      />

      <TextInput
        placeholder="Last name"
        placeholderTextColor="#777"
        value={lastName}
        onChangeText={setLastName}
        style={{
          marginTop: 10,
          color: "white",
          backgroundColor: "#1E1E1E",
          padding: 14,
          borderRadius: 10,
          fontSize: 16
        }}
      />

      <TouchableOpacity
        style={{
          marginTop: 40,
          backgroundColor: "#007AFF",
          padding: 16,
          borderRadius: 12,
          alignItems: "center"
        }}
        onPress={handleContinue}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}