import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem("userFirstName");
      if (name) {
        setFirstName(name);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ padding: 20, paddingTop: 60 }}>
        <Text style={{ 
          color: "white", 
          fontSize: 32, 
          fontWeight: "bold",
          marginBottom: 8
        }}>
          Welcome, {firstName}
        </Text>
        
        <Text style={{ 
          color: "#888", 
          fontSize: 16,
          marginBottom: 40
        }}>
          What would you like to do today?
        </Text>

        {/* Quick Actions */}
        <View style={{ gap: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#1E1E1E",
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(tabs)/calendar")}
          >
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#007AFF20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
                Manage Events
              </Text>
              <Text style={{ color: "#888", fontSize: 14 }}>
                View and create calendar events
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#1E1E1E",
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#34C75920",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}>
              <Ionicons name="chatbubbles" size={24} color="#34C759" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
                Chat with AI
              </Text>
              <Text style={{ color: "#888", fontSize: 14 }}>
                Get help from your AI assistant
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#1E1E1E",
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#FF9F0A20",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}>
              <Ionicons name="stats-chart" size={24} color="#FF9F0A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
                View Progress
              </Text>
              <Text style={{ color: "#888", fontSize: 14 }}>
                Track your achievements
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Today's Overview */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            Today's Overview
          </Text>
          
          <View style={{ backgroundColor: "#1E1E1E", padding: 20, borderRadius: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>Events</Text>
                <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>0</Text>
              </View>
              <View style={{ width: 1, backgroundColor: "#2C2C2C" }} />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>Completed</Text>
                <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>0</Text>
              </View>
              <View style={{ width: 1, backgroundColor: "#2C2C2C" }} />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text style={{ color: "#888", fontSize: 14, marginBottom: 4 }}>Pending</Text>
                <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>0</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}