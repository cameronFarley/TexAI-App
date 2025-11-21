import { useState, useEffect } from "react";
import type { ComponentProps } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  useAppearance,
} from "@/providers/AppearanceProvider";

type IconName = ComponentProps<typeof Ionicons>["name"];

/*
This file defines the Account tab
- Need working redirects for the following:
  = Edit Profile
  = Help & Support
  = Appearance
  = Notifications
  = About
  = Privacy Policy
- Add a settings redirect?
  = Put the notifications and appearance in settings??
- Tie logout button to an improved account system
- Maybe generate a random profile pic for different accounts? Just for visual stimulation
*/

export default function Settings() {
  // Loading user first name and last name
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [appearanceExpanded, setAppearanceExpanded] = useState(false);

  const {
    colors,
    scaleFont,
    setLightModeEnabled,
    colorScheme,
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
  } = useAppearance();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 20;

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

  // Logout button handling
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            router.replace("/(auth)/welcome");
          } catch (error) {
            console.error("Failed to logout user:", error);
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  const sliderValue =
    (fontScale - FONT_SCALE_MIN) / (FONT_SCALE_MAX - FONT_SCALE_MIN);

  const handleFontScaleChange = (value: number) => {
    const scaled = FONT_SCALE_MIN + value * (FONT_SCALE_MAX - FONT_SCALE_MIN);
    setFontScale(scaled);
  };

  const quickSettings: { icon: IconName; label: string }[] = [
    { icon: "person-outline", label: "Edit Profile" },
    { icon: "notifications-outline", label: "Notifications" },
    { icon: "help-circle-outline", label: "Help & Support" },
  ];

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
            fontFamily: 'DMSerifDisplay',
            marginBottom: 40,
          }}
        >
          Account
        </Text>

        {/* Profile Section */}
        <View
          style={{
            backgroundColor: colors.card,
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
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="person" size={40} color={colors.onPrimary} />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: scaleFont(24),
              fontWeight: "bold",
            }}
          >
            {firstName} {lastName}
          </Text>
        </View>

        {/* Settings Options */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {quickSettings.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: index === 2 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <Ionicons name={item.icon} size={24} color={colors.muted} />
              <Text
                style={{
                  color: colors.text,
                  fontSize: scaleFont(16),
                  marginLeft: 16,
                  flex: 1,
                }}
              >
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </TouchableOpacity>
            )
          )}

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
            onPress={() => setAppearanceExpanded((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons name="moon-outline" size={24} color={colors.muted} />
            <Text
              style={{
                color: colors.text,
                fontSize: scaleFont(16),
                marginLeft: 16,
                flex: 1,
              }}
            >
              Appearance
            </Text>
            <Ionicons
              name={appearanceExpanded ? "chevron-up" : "chevron-forward"}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>

          {appearanceExpanded ? (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <Ionicons name="sunny-outline" size={24} color={colors.muted} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: scaleFont(16),
                    marginLeft: 16,
                    flex: 1,
                  }}
                >
                  Light Mode
                </Text>
                <Switch
                  value={colorScheme === "light"}
                  onValueChange={setLightModeEnabled}
                  thumbColor={colors.onPrimary}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <Ionicons name="contrast-outline" size={24} color={colors.muted} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: scaleFont(16),
                    marginLeft: 16,
                    flex: 1,
                  }}
                >
                  High Contrast
                </Text>
                <Switch
                  value={highContrast}
                  onValueChange={setHighContrast}
                  thumbColor={colors.onPrimary}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View
                style={{
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="text-outline" size={24} color={colors.muted} />
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: scaleFont(16),
                      marginLeft: 16,
                      flex: 1,
                    }}
                  >
                    Font Size
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: 120,
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                      Aa
                    </Text>
                    <Text style={{ color: colors.text, fontSize: scaleFont(18) }}>
                      Aa
                    </Text>
                  </View>
                </View>
                <Slider
                  value={sliderValue}
                  minimumValue={0}
                  maximumValue={1}
                  onValueChange={handleFontScaleChange}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                  style={{ marginTop: 12 }}
                />
              </View>
            </View>
          ) : null}
        </View>

        {/* About Section */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.muted}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: scaleFont(16),
                marginLeft: 16,
                flex: 1,
              }}
            >
              About
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={colors.muted}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: scaleFont(16),
                marginLeft: 16,
                flex: 1,
              }}
            >
              Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.destructive,
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
          onPress={handleLogout}
        >
          <Text
            style={{
              color: colors.onPrimary,
              fontSize: scaleFont(16),
              fontWeight: "600",
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
