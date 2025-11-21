import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppearance } from "@/providers/AppearanceProvider";

/*
This is the code for the learn tab
- Maybe create a way to specify what topics to parctice?
- I imagine we provide all of the information? Not let the user input it
- Connect: Flashcards, Quiz, Learn, Matching
- Create an update system for the mastery based on Learn perhaps?
- Unique the style so its not copy and paste of home page
*/

export default function Learn() {
  const { colors, scaleFont } = useAppearance();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 20;

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
            marginBottom: 30,
          }}
        >
          Learn
        </Text>

        {/* Quick Actions */}
        <View style={{ gap: 16 }}>
          {/* First quick action : Learn */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(main)/learn/learn")}
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
              <Ionicons name="book" size={24} color={colors.blue} />
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
                Learn
              </Text>
              <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                Customized learning experience
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Second Quick action box : Flashcards */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(main)/learn/learn")}
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
              <Ionicons name="albums" size={24} color={colors.yellow} />
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
                Flash Cards
              </Text>
              <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                Memorize!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* third Quick action box : Quiz */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => router.push("/(main)/learn/learn")}
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
              <Ionicons name="reader" size={24} color={colors.green} />
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
                Quiz
              </Text>
              <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                Test your knowledge
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* A fourth quick action : Matching */}
          <TouchableOpacity
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => router.push("/(main)/learn/learn")}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.purpleSoft,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <Ionicons name="copy" size={24} color={colors.purple} />
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
                  Matching
                </Text>
                <Text style={{ color: colors.muted, fontSize: scaleFont(14) }}>
                  Match the terms
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

        {/* Today's Overview */}
        <View style={{ marginTop: 40 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: scaleFont(20),
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Mastery
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
                  Terms
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
                  Topics
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
                  Completion
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: scaleFont(24),
                    fontWeight: "bold",
                  }}
                >
                  0%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
