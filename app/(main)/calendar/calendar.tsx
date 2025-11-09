import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppearance } from "@/providers/AppearanceProvider";

/*
This is the code for the calendar tab
- Maybe create a calendar view that knows current time and day
  = Can be configed to show day view, week view, and month view, like google calendar?
- Reconfigure the time input to a selection instead of typing
  = Maybe an option in setting to use 24hr time or 12hr time?
*/

type Event = {
  id: string;
  title: string;
  dateISO: string;
  dateLabel: string;
  time: string;
  description: string;
};

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const formatDisplayDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const showTimeError = time.length === 5 && !TIME_REGEX.test(time);

  const { colors, scaleFont, colorScheme } = useAppearance();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top + 20;

  const handleTimeChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/[^\d]/g, "").slice(0, 4);
    if (digitsOnly.length <= 2) {
      setTime(digitsOnly);
      return;
    }
    const hours = digitsOnly.slice(0, 2);
    const minutes = digitsOnly.slice(2);
    setTime(`${hours}:${minutes}`);
  };

  const addEvent = () => {
    if (!title || !selectedDate || !time) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!TIME_REGEX.test(time)) {
      Alert.alert("Error", "Please enter a valid time (00:00 - 23:59)");
      return;
    }

    const dateISO = selectedDate.toISOString().split("T")[0];
    const dateLabel = formatDisplayDate(selectedDate);

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      dateISO,
      dateLabel,
      time,
      description,
    };

    setEvents(
      [...events, newEvent].sort(
        (a, b) =>
          new Date(`${a.dateISO} ${a.time}`).getTime() -
          new Date(`${b.dateISO} ${b.time}`).getTime()
      )
    );

    setTitle("");
    setSelectedDate(null);
    setShowIOSDatePicker(false);
    setTime("");
    setDescription("");
    setModalVisible(false);
  };

  const deleteEvent = (id: string) => {
    Alert.alert("Delete Event", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setEvents(events.filter((e) => e.id !== id)),
      },
    ]);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        paddingTop: topPadding,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 20,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={{
            color: colors.onPrimary,
            fontSize: scaleFont(16),
            fontWeight: "600",
          }}
        >
          + Add Event
        </Text>
      </TouchableOpacity>

      {events.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="calendar-outline" size={64} color={colors.muted} />
          <Text
            style={{
              color: colors.muted,
              marginTop: 10,
              fontSize: scaleFont(16),
            }}
          >
            No events yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.card,
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: scaleFont(18),
                    fontWeight: "600",
                    flex: 1,
                  }}
                >
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => deleteEvent(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  color: colors.muted,
                  marginTop: 8,
                  fontSize: scaleFont(14),
                }}
              >
                {item.dateLabel} at {item.time}
              </Text>
              {item.description ? (
                <Text
                  style={{
                    color: colors.text,
                    marginTop: 8,
                    fontSize: scaleFont(14),
                  }}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: colors.overlay,
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
              style={{ flex: 1, width: "100%" }}
            >
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "flex-end",
                  paddingBottom: Platform.OS === "ios" ? 40 : 20,
                }}
                keyboardShouldPersistTaps="handled"
              >
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 20,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: scaleFont(24),
                      fontWeight: "bold",
                      marginBottom: 20,
                    }}
                  >
                    New Event
                  </Text>

                  <TextInput
                    placeholder="Event title *"
                    placeholderTextColor={colors.muted}
                    value={title}
                    onChangeText={setTitle}
                    style={{
                      color: colors.text,
                      backgroundColor: colors.inputBackground,
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 16,
                      fontSize: scaleFont(16),
                    }}
                  />

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      if (Platform.OS === "android") {
                        DateTimePickerAndroid.open({
                          value: selectedDate ?? new Date(),
                          onChange: (event, dateValue) => {
                            if (event.type === "set" && dateValue) {
                              setSelectedDate(dateValue);
                            }
                          },
                          mode: "date",
                          display: "calendar",
                        });
                      } else {
                        setShowIOSDatePicker(true);
                      }
                    }}
                    style={{
                      backgroundColor: colors.inputBackground,
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: selectedDate ? colors.text : colors.muted,
                        fontSize: scaleFont(16),
                      }}
                    >
                      {selectedDate ? formatDisplayDate(selectedDate) : "Select date *"}
                    </Text>
                    <Ionicons name="calendar" size={20} color={colors.text} />
                  </TouchableOpacity>

                  {Platform.OS === "ios" && showIOSDatePicker ? (
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        marginBottom: 12,
                        padding: 8,
                      }}
                    >
                      <DateTimePicker
                        value={selectedDate ?? new Date()}
                        mode="date"
                        display="inline"
                        themeVariant={colorScheme === "light" ? "light" : "dark"}
                        onChange={(_, dateValue) => {
                          if (dateValue) {
                            setSelectedDate(dateValue);
                          }
                        }}
                        style={{ alignSelf: "stretch" }}
                      />
                      <TouchableOpacity
                        style={{
                          marginTop: 8,
                          alignSelf: "flex-end",
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          backgroundColor: colors.card,
                          borderRadius: 8,
                        }}
                        onPress={() => setShowIOSDatePicker(false)}
                      >
                        <Text
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: scaleFont(14),
                          }}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <TextInput
                    placeholder="Time (HH:MM) *"
                    placeholderTextColor={colors.muted}
                    value={time}
                    onChangeText={handleTimeChange}
                    keyboardType="number-pad"
                    maxLength={5}
                    autoCorrect={false}
                    style={{
                      color: colors.text,
                      backgroundColor: colors.inputBackground,
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 4,
                      fontSize: scaleFont(16),
                    }}
                  />

                  {showTimeError ? (
                    <Text
                      style={{
                        color: colors.destructive,
                        marginBottom: 12,
                        fontSize: scaleFont(12),
                      }}
                    >
                      Please enter a valid 24-hour time (e.g. 09:30).
                    </Text>
                  ) : null}

                  <TextInput
                    placeholder="Description (optional)"
                    placeholderTextColor={colors.muted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    style={{
                      color: colors.text,
                      backgroundColor: colors.inputBackground,
                      padding: 14,
                      borderRadius: 10,
                      marginBottom: 20,
                      textAlignVertical: "top",
                      fontSize: scaleFont(16),
                    }}
                  />

                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.primary,
                      padding: 16,
                      borderRadius: 12,
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                    onPress={addEvent}
                  >
                    <Text
                      style={{
                        color: colors.onPrimary,
                        fontSize: scaleFont(16),
                        fontWeight: "600",
                      }}
                    >
                      Create Event
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.surface,
                      padding: 16,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      setShowIOSDatePicker(false);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: scaleFont(16),
                        fontWeight: "600",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
