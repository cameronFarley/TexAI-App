import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
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

import { BACKEND_URL } from "@/config/environment";
import { useAppearance } from "@/providers/AppearanceProvider";

type InteractionMode = "informational" | "quiz" | "simulation";
type ToneMode = "field" | "training";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot" | "system";
  timestamp: Date;
  mode?: InteractionMode;
  tone?: ToneMode;
  metadata?: {
    summary?: string;
    references?: string[];
    score?: number;
    detailLevel?: "concise" | "detailed";
    steps?: string[];
  };
};

const MAX_MEMORY = 6;

const DEFAULT_BOT_MESSAGE: Message = {
  id: "welcome",
  text: "Welcome to TEXAI. Select a mode and let me know how I can assist—I'm ready for informational queries, quizzes, or full simulations.",
  sender: "bot",
  timestamp: new Date(),
  mode: "informational",
};

const MODE_LABELS: Record<InteractionMode, string> = {
  informational: "Informational",
  quiz: "Quiz",
  simulation: "Simulation",
};

const TONE_LABELS: Record<ToneMode, string> = {
  field: "Operational",
  training: "Training",
};

export default function TexAIChat() {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_BOT_MESSAGE]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<InteractionMode>("informational");
  const [tone, setTone] = useState<ToneMode>("field");
  const [loading, setLoading] = useState(false);
  const [promptHint, setPromptHint] = useState<string | null>(null);

  const flatListRef = useRef<FlatList<Message>>(null);
  const { colors, scaleFont } = useAppearance();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (promptHint) {
      setInput(promptHint);
      setPromptHint(null);
    }
  }, [promptHint]);

  const trimmedHistory = useMemo(() => {
    const convo = messages.filter((msg) => msg.sender !== "system");
    return convo.slice(-MAX_MEMORY).map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
      mode: msg.mode ?? "informational",
      tone: msg.tone ?? "training",
    }));
  }, [messages]);

  const handleQuickAction = (action: InteractionMode) => {
    setMode(action);
    switch (action) {
      case "informational":
        setPromptHint(
          "Provide a concise overview of Texas CJIS guidelines for handling digital evidence at a crime scene."
        );
        break;
      case "quiz":
        setPromptHint(
          "Generate a 3-question multiple choice quiz on ransomware response protocols for Texas law enforcement."
        );
        break;
      case "simulation":
        setPromptHint(
          "Simulate a scenario where an officer responds to a ransomware lockdown at a courthouse. Ask step-by-step questions and evaluate my decisions."
        );
        break;
    }
  };

  const sendMessage = async () => {
    const userInput = input.trim();
    if (!userInput) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: "user",
      timestamp: new Date(),
      mode,
      tone,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiText = await invokeChatGPT({
        userInput,
        mode,
        tone,
        history: trimmedHistory,
      });

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        text: aiText,
        sender: "bot",
        timestamp: new Date(),
        mode,
        tone,
        metadata: inferMetadataFromResponse(aiText, mode),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat request failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const rateLimited = /429|RATE_LIMIT/i.test(errorMessage);
      const fallback: Message = {
        id: `${Date.now()}-error`,
        text: rateLimited
          ? "TEXAI is hitting the OpenAI rate limit right now. Please wait a few seconds and try again."
          : generateFallbackResponse(userInput, mode, tone),
        sender: "bot",
        timestamp: new Date(),
        mode,
        tone,
        metadata: {
          summary: rateLimited ? "Rate limit" : "Offline fallback",
          detailLevel: "concise",
        },
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
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
          backgroundColor: colors.background,
        }}
      >
        <ModeSwitcher
          activeMode={mode}
          onChange={setMode}
          colors={colors}
          scaleFont={scaleFont}
        />
        <ToneSwitcher
          activeTone={tone}
          onChange={setTone}
          colors={colors}
          scaleFont={scaleFont}
        />
        <QuickActions
          onAction={handleQuickAction}
          colors={colors}
          scaleFont={scaleFont}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        style={{ flex: 1, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            colors={colors}
            scaleFont={scaleFont}
          />
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
          gap: 12,
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={`Ask TEXAI in ${MODE_LABELS[mode]} mode...`}
          placeholderTextColor={colors.muted}
          style={{
            flex: 1,
            backgroundColor: colors.inputBackground,
            color: colors.text,
            padding: 12,
            borderRadius: 20,
            fontSize: scaleFont(16),
          }}
          multiline
          maxLength={600}
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

function ModeSwitcher({
  activeMode,
  onChange,
  colors,
  scaleFont,
}: {
  activeMode: InteractionMode;
  onChange: (value: InteractionMode) => void;
  colors: ReturnType<typeof useAppearance>["colors"];
  scaleFont: (size: number) => number;
}) {
  const options: InteractionMode[] = [
    "informational",
    "quiz",
    "simulation",
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
      }}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor:
              option === activeMode ? colors.primary : "transparent",
          }}
        >
          <Text
            style={{
              color: option === activeMode ? colors.onPrimary : colors.text,
              fontWeight: "600",
              fontSize: scaleFont(14),
            }}
          >
            {MODE_LABELS[option]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ToneSwitcher({
  activeTone,
  onChange,
  colors,
  scaleFont,
}: {
  activeTone: ToneMode;
  onChange: (value: ToneMode) => void;
  colors: ReturnType<typeof useAppearance>["colors"];
  scaleFont: (size: number) => number;
}) {
  const tones: ToneMode[] = ["field", "training"];
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {tones.map((tone) => (
        <TouchableOpacity
          key={tone}
          onPress={() => onChange(tone)}
          style={{
            flex: 1,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: activeTone === tone ? colors.primary : colors.border,
            backgroundColor:
              activeTone === tone ? colors.primarySoft : colors.card,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: "600",
              fontSize: scaleFont(13),
            }}
          >
            {TONE_LABELS[tone]}
          </Text>
          <Text style={{ color: colors.muted, fontSize: scaleFont(11) }}>
            {tone === "field"
              ? "Concise, rapid guidance"
              : "Detailed explanations"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function QuickActions({
  onAction,
  colors,
  scaleFont,
}: {
  onAction: (mode: InteractionMode) => void;
  colors: ReturnType<typeof useAppearance>["colors"];
  scaleFont: (size: number) => number;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {(["informational", "quiz", "simulation"] as InteractionMode[]).map(
        (mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => onAction(mode)}
            style={{
              flex: 1,
              borderRadius: 10,
              paddingVertical: 10,
              backgroundColor: colors.surface,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "600",
                fontSize: scaleFont(12),
              }}
            >
              {MODE_LABELS[mode]}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

function MessageBubble({
  message,
  colors,
  scaleFont,
}: {
  message: Message;
  colors: ReturnType<typeof useAppearance>["colors"];
  scaleFont: (size: number) => number;
}) {
  const align = message.sender === "user" ? "flex-end" : "flex-start";
  const bubbleBg =
    message.sender === "user" ? colors.primary : colors.card;
  const textColor =
    message.sender === "user" ? colors.onPrimary : colors.text;

  return (
    <View
      style={{
        marginBottom: 16,
        alignSelf: align,
        maxWidth: "90%",
      }}
    >
      {message.mode && (
        <View style={{ flexDirection: "row", marginBottom: 4, gap: 6 }}>
          <Badge
            label={MODE_LABELS[message.mode]}
            colors={colors}
            tone={message.sender === "user" ? "neutral" : "primary"}
          />
          {message.tone && (
            <Badge
              label={TONE_LABELS[message.tone]}
              colors={colors}
              tone="neutral"
            />
          )}
        </View>
      )}
      <View
        style={{
          backgroundColor: bubbleBg,
          padding: 12,
          borderRadius: 16,
          borderBottomRightRadius: message.sender === "user" ? 4 : 16,
          borderBottomLeftRadius: message.sender === "bot" ? 4 : 16,
        }}
      >
        <Text style={{ color: textColor, fontSize: scaleFont(16) }}>
          {message.text}
        </Text>
        {message.metadata?.steps && (
          <View style={{ marginTop: 8, gap: 4 }}>
            {message.metadata.steps.map((step, idx) => (
              <Text
                key={idx}
                style={{
                  color: textColor,
                  fontSize: scaleFont(14),
                }}
              >
                {`${idx + 1}. ${step}`}
              </Text>
            ))}
          </View>
        )}
        {message.metadata?.references && (
          <View style={{ marginTop: 8 }}>
            <Text
              style={{
                color: textColor,
                fontSize: scaleFont(12),
                opacity: 0.8,
              }}
            >
              References: {message.metadata.references.join(", ")}
            </Text>
          </View>
        )}
        {typeof message.metadata?.score === "number" && (
          <Text
            style={{
              color: textColor,
              fontSize: scaleFont(12),
              marginTop: 6,
            }}
          >
            Quiz score: {message.metadata.score}/10
          </Text>
        )}
      </View>
      <Text
        style={{
          color: colors.muted,
          fontSize: scaleFont(11),
          marginTop: 4,
          alignSelf: align,
        }}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}

function Badge({
  label,
  colors,
  tone = "primary",
}: {
  label: string;
  colors: ReturnType<typeof useAppearance>["colors"];
  tone?: "primary" | "neutral";
}) {
  const background =
    tone === "primary" ? colors.primarySoft : colors.surface;
  const textColor = colors.text;

  return (
    <View
      style={{
        backgroundColor: background,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: textColor, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function generateFallbackResponse(
  prompt: string,
  mode: InteractionMode,
  tone: ToneMode
) {
  switch (mode) {
    case "quiz":
      return "Offline quiz assistant: 1) What is the first action when a ransomware alert appears? A) Ignore B) Disconnect affected systems C) Share creds D) Power off everything. Reply with your answer so I can evaluate.";
    case "simulation":
      return "Simulation stub: You arrive at a data center facing a possible breach. Step 1: Secure the perimeter and confirm safety. What is your next move?";
    default:
      return `Offline informational mode: I cannot reach the server right now, but based on TEXAI guidelines, ensure any response to "${prompt}" follows Texas CJIS procedures and document every action.`;
  }
}

function inferMetadataFromResponse(
  response: string,
  mode: InteractionMode
): Message["metadata"] {
  if (mode === "quiz" && response.toLowerCase().includes("score")) {
    return {
      score: 8,
      detailLevel: "detailed",
      summary: "Quiz evaluation included.",
    };
  }

  if (mode === "simulation" && response.toLowerCase().includes("step")) {
    const steps = response
      .split("\n")
      .filter((line) => /^\d+[\).]/.test(line.trim()));
    return {
      steps,
      detailLevel: "detailed",
    };
  }

  return {
    detailLevel: "concise",
  };
}

async function invokeChatGPT({
  userInput,
  mode,
  tone,
  history,
}: {
  userInput: string;
  mode: InteractionMode;
  tone: ToneMode;
  history: { role: string; content: string; mode: InteractionMode; tone: ToneMode }[];
}) {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userInput,
      mode,
      tone,
      history,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Backend error ${response.status}`);
  }

  const data = await response.json();
  return (
    data?.content?.trim() ?? generateFallbackResponse(userInput, mode, tone)
  );
}
