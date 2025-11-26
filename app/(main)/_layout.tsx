// Main layout: defines the bottom tab navigation once the user is in the app.
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useAppearance } from "@/providers/AppearanceProvider";

export default function TabLayout() {
  const { colors, scaleFont } = useAppearance();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: scaleFont(12),
        },
      }}
    >

      {/* Each Tabs.Screen is a button at the bottom nav bar,
      name="" is set to the file desitination */}
      <Tabs.Screen
        name="home/home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="learn/learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => (
            <Ionicons name="library" size={24} color={color} />
          )
        }}
      />

      {/*<Tabs.Screen   -------- Just silencing warnings ----------
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={24} color={color} />
          )
        }}
      />*/}

      <Tabs.Screen
        name="texai/texai"
        options={{
          title: "TexAI",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles" size={24} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="calendar/calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={24} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="account/account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
