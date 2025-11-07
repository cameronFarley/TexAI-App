import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const first = await AsyncStorage.getItem("userFirstName");
      const last = await AsyncStorage.getItem("userLastName");
      if (first) setFirstName(first);
      if (last) setLastName(last);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            router.replace("/(onboarding)/welcome");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ padding: 20, paddingTop: 60 }}>
        <Text style={{ color: "white", fontSize: 32, fontWeight: "bold", marginBottom: 40 }}>
          Settings
        </Text>

        {/* Profile Section */}
        <View
          style={{
            backgroundColor: "#1E1E1E",
            padding: 20,
            borderRadius: 16,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#007AFF",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
            {firstName} {lastName}
          </Text>
        </View>

        {/* Settings Options */}
        <View style={{ backgroundColor: "#1E1E1E", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#2C2C2C",
            }}
          >
            <Ionicons name="person-outline" size={24} color="#888" />
            <Text style={{ color: "white", fontSize: 16, marginLeft: 16, flex: 1 }}>
              Edit Profile
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#2C2C2C",
            }}
          >
            <Ionicons name="notifications-outline" size={24} color="#888" />
            <Text style={{ color: "white", fontSize: 16, marginLeft: 16, flex: 1 }}>
              Notifications
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#2C2C2C",
            }}
          >
            <Ionicons name="moon-outline" size={24} color="#888" />
            <Text style={{ color: "white", fontSize: 16, marginLeft: 16, flex: 1 }}>
              Appearance
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
          >
            <Ionicons name="help-circle-outline" size={24} color="#888" />
            <Text style={{ color: "white", fontSize: 16, marginLeft: 16, flex: 1 }}>
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={{ backgroundColor: "#1E1E1E", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#2C2C2C",
            }}
          >
            <Ionicons name="information-circle-outline" size={24} color="#888" />
            <Text style={{ color: "white", fontSize: 16, marginLeft: 16, flex: 1 }}>
              About
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#888" />
            <Text style={{ color: "white", fontSize: 16, marginLeft: 16, flex: 1 }}>
              Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#FF3B30",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 40,
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}