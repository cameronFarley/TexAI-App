import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppearance } from "@/providers/AppearanceProvider";

/*
This is the code for the Chat tab
- All messages creates a "connection error" response, maybe a limit of dev mode?
- Maybe create an AI specifically trained on the data of whatever were making this for?
- Should we create a banner at the top saying something? Feels like there should be
*/

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm TexAI, your personal law enforcement training AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { colors, scaleFont } = useAppearance();
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call Anthropic API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.content[0].text || "Sorry, I couldn't process that.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat request failed:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error connecting to the chatbot.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        style={{ flex: 1, padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={{
              marginBottom: 16,
              alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}
            >
              <View
                style={{
                  backgroundColor:
                    item.sender === "user" ? colors.primary : colors.card,
                  padding: 12,
                  borderRadius: 16,
                  borderBottomRightRadius: item.sender === "user" ? 4 : 16,
                  borderBottomLeftRadius: item.sender === "bot" ? 4 : 16,
                }}
              >
                <Text
                  style={{
                    color: item.sender === "user" ? colors.onPrimary : colors.text,
                    fontSize: scaleFont(16),
                  }}
                >
                  {item.text}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.muted,
                  fontSize: scaleFont(11),
                  marginTop: 4,
                  alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
                }}
            >
              {item.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={{ padding: 16, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          padding: 16,
          backgroundColor: colors.card,
          alignItems: "center",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          style={{
            flex: 1,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            padding: 12,
            borderRadius: 20,
            marginRight: 12,
            fontSize: scaleFont(16),
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            backgroundColor:
              input.trim() && !loading ? colors.primary : colors.border,
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="send" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
