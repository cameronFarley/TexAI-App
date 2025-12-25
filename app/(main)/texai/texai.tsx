import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
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

// --- CONFIGURATION ---
// IMPORTANT: For Mac Simulator, use your Mac's LAN IP (e.g., http://192.168.1.50:8000)
// `ipconfig getifaddr en0` in the terminal
// 'localhost' will NOT work because it refers to the simulated phone, not your computer.
const BACKEND_URL = "http://10.0.0.46:8000"; 

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot" | "system";
  timestamp: Date;
  metadata?: {
    references?: string[];
  };
};

const DEFAULT_BOT_MESSAGE: Message = {
  id: "welcome",
  text: "Hello. I am TEXAI. How can I assist you with Texas statutes today?",
  sender: "bot",
  timestamp: new Date(),
};

export default function TexAIChat() {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_BOT_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);
  const { colors, scaleFont } = useAppearance();
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    const userInput = input.trim();
    if (!userInput) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Connect to the backend
      const responseData = await invokeBackend({
        userInput,
        history: messages.map(m => ({ role: m.sender, content: m.text })).slice(-5),
      });

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        text: responseData.content,
        sender: "bot",
        timestamp: new Date(),
        metadata: {
            references: responseData.sources?.map((s: any) => s.metadata?.title || "Source").slice(0, 3) || [],
        },
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat request failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      const fallback: Message = {
        id: `${Date.now()}-error`,
        text: `Connection Error: ${errorMessage}. \n\nEnsure BACKEND_URL is set to your Mac's IP (not localhost) and app.py is running.`,
        sender: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
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
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ color: colors.text, fontSize: scaleFont(18), fontWeight: "bold", textAlign: "center" }}>
          TEXAI Assistant
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        style={{ flex: 1, paddingHorizontal: 16 }}
        renderItem={({ item }) => <MessageBubble message={item} colors={colors} scaleFont={scaleFont} />}
      />

      {loading && (
        <View style={{ padding: 16, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      <View style={{ flexDirection: "row", padding: 16, backgroundColor: colors.card, alignItems: "center", gap: 12 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about Texas statutes..."
          placeholderTextColor={colors.muted}
          style={{ flex: 1, backgroundColor: colors.inputBackground, color: colors.text, padding: 12, borderRadius: 20, fontSize: scaleFont(16) }}
          multiline
          maxLength={600}
        />
        <TouchableOpacity onPress={sendMessage} disabled={!input.trim() || loading} style={{ backgroundColor: input.trim() && !loading ? colors.primary : colors.border, width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="send" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// --- HELPER COMPONENT: Message Bubble ---
function MessageBubble({ message, colors, scaleFont }: { message: Message; colors: any; scaleFont: (s: number) => number }) {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? colors.primary : isSystem ? colors.error : colors.card,
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
        maxWidth: "85%",
        borderBottomRightRadius: isUser ? 2 : 16,
        borderBottomLeftRadius: isUser ? 16 : 2,
      }}
    >
      <Text style={{ color: isUser ? "#121212" : colors.text, fontSize: scaleFont(16) }}>
        {message.text}
      </Text>
      
      {/* Show Source References if available */}
      {message.metadata?.references && message.metadata.references.length > 0 && (
        <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isUser ? "rgba(255,255,255,0.2)" : colors.border }}>
            <Text style={{ fontSize: scaleFont(10), color: isUser ? colors.text : colors.muted, fontWeight: 'bold' }}>SOURCES:</Text>
            {message.metadata.references.map((ref, idx) => (
                <Text key={idx} style={{ fontSize: scaleFont(10), color: isUser ? colors.text : colors.muted }}>• {ref}</Text>
            ))}
        </View>
      )}
    </View>
  );
}

// --- API CONNECTOR ---
async function invokeBackend({
  userInput,
  history,
}: {
  userInput: string;
  history: any[];
}) {
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userInput,
        history,
        k: 3 
      }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    throw error;
  }
}