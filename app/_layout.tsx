// Root layout: wires up the highest-level navigation (auth, main app, modals).
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

import { useFonts, DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from "@expo-google-fonts/dm-sans";
import { AppearanceProvider, useAppearance } from "@/providers/AppearanceProvider";

SplashScreen.preventAutoHideAsync();

function ThemedStatusBar() {
  const { colorScheme, colors } = useAppearance();
  return (
    <StatusBar
      style={colorScheme === "light" ? "dark" : "light"}
      backgroundColor={colors.background}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "DMSerifDisplay": DMSerifDisplay_400Regular,
    "DMSans-Regular": DMSans_400Regular,
    "DMSans-Medium": DMSans_500Medium,
    "DMSans-Bold": DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <AppearanceProvider>
      <ThemedStatusBar />
      <Slot />
    </AppearanceProvider>
  );
}