import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // Clear user data and navigate to welcome
          router.replace("/welcome");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
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
          User Name
        </Text>
        <Text style={{ color: "#888", fontSize: 16, marginTop: 4 }}>
          user@example.com
        </Text>
      </View>

      <View style={{ backgroundColor: "#1E1E1E", borderRadius: 16, overflow: "hidden" }}>
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
          <Ionicons name="settings-outline" size={24} color="#888" />
          <Text style={{ color: "white", fontSize: 16, marginLeft: 16, flex: 1 }}>
            Settings
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

      <TouchableOpacity
        style={{
          backgroundColor: "#FF3B30",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 32,
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}