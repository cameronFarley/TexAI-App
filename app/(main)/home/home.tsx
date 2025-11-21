import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppearance } from "@/providers/AppearanceProvider";

/*
This file is the home tab, main face of the app
- Maybe change the style to something more complex
*/

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const { colors, scaleFont } = useAppearance();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 20;

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
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, fontSize: scaleFont(16) }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={{ padding: 20, paddingTop: topPadding }}>
        <Text
          style={{
            color: colors.text,
            fontSize: scaleFont(32),
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Welcome, {firstName}
        </Text>

        <Text
          style={{
            color: colors.muted,
            fontSize: scaleFont(16),
            marginBottom: 40,
          }}
        >
          What would you like to do today?
        </Text>

        {/* Quick Actions */}
        <View style={{ gap: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(main)/calendar/calendar")}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.blueSoft,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="calendar" size={24} color={colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: scaleFont(18),
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                Manage Events
              </Text>
              <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                View and create calendar events
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(main)/texai/texai")}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.greenSoft,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="chatbubbles" size={24} color={colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: scaleFont(18),
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                Chat with AI
              </Text>
              <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                Get help from your AI assistant
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(main)/home/home")}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.yellowSoft,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="stats-chart" size={24} color={colors.yellow} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: scaleFont(18),
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                View Progress
              </Text>
              <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                Track your achievements
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Today’s Overview */}
        <View style={{ marginTop: 40 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: scaleFont(20),
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Today’s Overview
          </Text>
          
          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: scaleFont(14),
                    marginBottom: 4,
                  }}
                >
                  Events
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: scaleFont(24),
                    fontWeight: "bold",
                  }}
                >
                  0
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: scaleFont(14),
                    marginBottom: 4,
                  }}
                >
                  Completed
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: scaleFont(24),
                    fontWeight: "bold",
                  }}
                >
                  0
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: scaleFont(14),
                    marginBottom: 4,
                  }}
                >
                  Pending
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: scaleFont(24),
                    fontWeight: "bold",
                  }}
                >
                  0
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
