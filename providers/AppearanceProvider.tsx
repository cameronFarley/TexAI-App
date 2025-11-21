import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Appearance,
  type ColorSchemeName,
} from "react-native";

type ThemeColors = {
  background: string;
  card: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  overlay: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  inputBackground: string;
  chip: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  purple: string;
  purpleSoft: string;
  blue: string;
  blueSoft: string;
  yellow: string;
  yellowSoft: string;
  green: string;
  greenSoft: string;
  destructive: string;
};

type AppearanceContextValue = {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
  setLightModeEnabled: (enabled: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  fontScale: number;
  setFontScale: (value: number) => void;
  colors: ThemeColors;
  scaleFont: (size: number) => number;
};

const STORAGE_KEY = "appearance-preferences";

const basePalette = {
  dark: {
    background: "#000000", 
    card: "#121212",       
    surface: "#1C1C1C",    
    text: "#F5F5F5",       
    muted: "#8A8A8A",      
    border: "#333333",     
    overlay: "rgba(0,0,0,0.85)",
  },
  light: {
    background: "#FFFFFF", 
    card: "#FDFDFD",       
    surface: "#F5F5F5",
    text: "#121212",       
    muted: "#666666",
    border: "#E0E0E0",
    overlay: "rgba(0,0,0,0.3)",
  },
};

const highContrastOverrides = {
  dark: {
    text: "#FFFFFF",
    muted: "#E5E5E5",
    border: "#D4AF37",
    background: "#000000",
    card: "#000000",
    surface: "#000000",
  },
  light: {
    text: "#000000",
    muted: "#000000",
    border: "#000000",
    background: "#FFFFFF",
    card: "#FFFFFF",
    surface: "#FFFFFF",
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const FONT_SCALE_MIN = 0.9;
export const FONT_SCALE_MAX = 1.3;

export const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const systemScheme = Appearance.getColorScheme() ?? "dark";
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemScheme);
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScaleState] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.colorScheme === "light" || parsed.colorScheme === "dark") {
            setColorScheme(parsed.colorScheme);
          }
          if (typeof parsed.highContrast === "boolean") {
            setHighContrast(parsed.highContrast);
          }
          if (typeof parsed.fontScale === "number") {
            setFontScaleState(parsed.fontScale);
          }
        }
      } catch (error) {
        console.warn("Failed to load appearance preferences", error);
      } finally {
        setHydrated(true);
      }
    };

    loadPreferences();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const persistPreferences = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            colorScheme,
            highContrast,
            fontScale,
          })
        );
      } catch (error) {
        console.warn("Failed to store appearance preferences", error);
      }
    };

    persistPreferences();
  }, [colorScheme, highContrast, fontScale, hydrated]);

  const setLightModeEnabled = useCallback(
    (enabled: boolean) => {
      setColorScheme(enabled ? "light" : "dark");
    },
    []
  );

  const setFontScale = useCallback((value: number) => {
    setFontScaleState(clamp(value, FONT_SCALE_MIN, FONT_SCALE_MAX));
  }, []);

  const colors = useMemo<ThemeColors>(() => {
    const palette = { ...basePalette[colorScheme ?? "light"] };

    if (highContrast) {
      Object.assign(palette, highContrastOverrides[colorScheme ?? "light"]);
    }

    const primary = highContrast
      ? colorScheme === "light"
        ? "#806000" 
        : "#FFD700" 
      : colorScheme === "light"
        ? "#B4922B" 
        : "#D4AF37";

    const onPrimary =
      colorScheme === "dark" ? "#000000" : "#FFFFFF"; 

    const purple = colorScheme === "dark" ? "#AA6FD6" : "#8A4FFF";
    const blue = colorScheme === "dark" ? "rgba(0, 122, 255, 0.8)" : "rgba(0, 98, 202, 0.8)";
    const yellow = colorScheme === "dark" ? "rgba(255, 255, 0, 0.8)" : "rgba(184, 184, 2, 0.8)";
    const green = colorScheme === "dark" ? "rgba(0, 255, 145, 0.8)" : "rgba(0, 255, 145, 0.6)";

    return {
      ...palette,
      primary,
      primarySoft:
        colorScheme === "dark"
          ? "rgba(212, 175, 55, 0.2)"
          : "rgba(180, 146, 43, 0.15)",
      onPrimary,
      inputBackground: highContrast
        ? colorScheme === "dark"
          ? "#000000"
          : "#FFFFFF"
        : colorScheme === "dark"
          ? "#1A1A1A" 
          : "#F0F0F5",
      chip: colorScheme === "dark" ? "#1A1A1A" : "#E5E5EA",
      success: "#34C759",
      successSoft:
        colorScheme === "dark"
          ? "rgba(52,199,89,0.2)"
          : "rgba(52,199,89,0.12)",
      warning: "#FFD700", 
      warningSoft:
        colorScheme === "dark"
          ? "rgba(255, 215, 0, 0.2)"
          : "rgba(255, 215, 0, 0.12)",
      purple,
      purpleSoft:
        colorScheme === "dark"
          ? "rgba(170,111,214,0.25)"
          : "rgba(170,111,214,0.18)",
      blue,
      blueSoft:
        colorScheme === "dark"
          ? "rgba(0, 122, 255, 0.2)"
          : "rgba(0, 122, 255, 0.1)",
      yellow,
      yellowSoft:
        colorScheme === "dark"
          ? "rgba(255, 255, 0, 0.2)"
          : "rgba(255, 255, 0, 0.1)",
      green,
      greenSoft:
        colorScheme === "dark"
          ? "rgba(52,199,89,0.2)"
          : "rgba(52,199,89,0.12)",
      destructive: "#FF453A",
    };
  }, [colorScheme, highContrast]);

  const scaleFont = useCallback(
    (size: number) => Number((size * fontScale).toFixed(2)),
    [fontScale]
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      setLightModeEnabled,
      highContrast,
      setHighContrast,
      fontScale,
      setFontScale,
      colors,
      scaleFont,
    }),
    [
      colorScheme,
      setLightModeEnabled,
      highContrast,
      fontScale,
      setFontScale,
      colors,
      scaleFont,
    ]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}