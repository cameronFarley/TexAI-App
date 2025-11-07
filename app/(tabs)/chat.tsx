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
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
      style={{ flex: 1, backgroundColor: "#000" }}
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
                backgroundColor: item.sender === "user" ? "#007AFF" : "#1E1E1E",
                padding: 12,
                borderRadius: 16,
                borderBottomRightRadius: item.sender === "user" ? 4 : 16,
                borderBottomLeftRadius: item.sender === "bot" ? 4 : 16,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>{item.text}</Text>
            </View>
            <Text
              style={{
                color: "#666",
                fontSize: 11,
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
          <ActivityIndicator color="#007AFF" />
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          padding: 16,
          backgroundColor: "#1E1E1E",
          alignItems: "center",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#777"
          style={{
            flex: 1,
            backgroundColor: "#2C2C2C",
            color: "white",
            padding: 12,
            borderRadius: 20,
            marginRight: 12,
            fontSize: 16,
          }}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: input.trim() && !loading ? "#007AFF" : "#333",
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}