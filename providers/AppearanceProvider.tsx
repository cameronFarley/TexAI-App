import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Appearance,
  type ColorSchemeName,
} from "react-native";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
    card: "#1E1E1E",
    surface: "#2C2C2C",
    text: "#FFFFFF",
    muted: "#B0B0B0",
    border: "#2C2C2C",
    overlay: "rgba(0,0,0,0.65)",
  },
  light: {
    background: "#F7F7F7",
    card: "#FFFFFF",
    surface: "#EFEFF4",
    text: "#111111",
    muted: "#5C5C5C",
    border: "#E5E5EA",
    overlay: "rgba(0,0,0,0.2)",
  },
};

const highContrastOverrides = {
  dark: {
    text: "#FFFFFF",
    muted: "#FFFFFF",
    border: "#FFFFFF",
    background: "#000000",
    card: "#050505",
    surface: "#0C0C0C",
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
        ? "#1A73E8"
        : "#FFD60A"
      : "#007AFF";

    const onPrimary =
      highContrast && colorScheme === "dark" ? "#000000" : "#FFFFFF";
    const purple = colorScheme === "dark" ? "#AA6FD6" : "#8A4FFF";

    return {
      ...palette,
      primary,
      primarySoft:
        colorScheme === "dark"
          ? "rgba(0,122,255,0.2)"
          : "rgba(0,122,255,0.12)",
      onPrimary,
      inputBackground: highContrast
        ? colorScheme === "dark"
          ? "#000000"
          : "#FFFFFF"
        : colorScheme === "dark"
          ? "#2C2C2C"
          : "#E8E8ED",
      chip: colorScheme === "dark" ? "#2C2C2C" : "#E5E5EA",
      success: "#34C759",
      successSoft:
        colorScheme === "dark"
          ? "rgba(52,199,89,0.2)"
          : "rgba(52,199,89,0.12)",
      warning: "#FF9F0A",
      warningSoft:
        colorScheme === "dark"
          ? "rgba(255,159,10,0.2)"
          : "rgba(255,159,10,0.12)",
      purple,
      purpleSoft:
        colorScheme === "dark"
          ? "rgba(170,111,214,0.25)"
          : "rgba(170,111,214,0.18)",
      destructive: "#FF3B30",
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
