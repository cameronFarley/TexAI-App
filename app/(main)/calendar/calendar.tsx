import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  SectionList,
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

const pad = (value: number) => value.toString().padStart(2, "0");

const formatLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseLocalDateKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDateTimeValue = (dateKey: string, time: string) => {
  const date = parseLocalDateKey(dateKey);
  if (TIME_REGEX.test(time)) {
    const [hour, minute] = time.split(":").map(Number);
    date.setHours(hour, minute, 0, 0);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.getTime();
};

type ThemeColors = ReturnType<typeof useAppearance>["colors"];

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedDateInput, setSelectedDateInput] = useState<Date | null>(null);
  const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [viewMode, setViewMode] = useState<"agenda" | "calendar">("agenda");
  const showTimeError = time.length === 5 && !TIME_REGEX.test(time);

  const todayISO = formatLocalDateKey(new Date());
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateISO, setSelectedDateISO] = useState(todayISO);

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
    if (!title || !selectedDateInput || !time) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!TIME_REGEX.test(time)) {
      Alert.alert("Error", "Please enter a valid time (00:00 - 23:59)");
      return;
    }

    const dateISO = formatLocalDateKey(selectedDateInput);
    const dateLabel = formatDisplayDate(selectedDateInput);

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      dateISO,
      dateLabel,
      time,
      description,
    };

    setEvents((prev) =>
      [...prev, newEvent].sort(
        (a, b) => getDateTimeValue(a.dateISO, a.time) - getDateTimeValue(b.dateISO, b.time)
      )
    );

    setTitle("");
    setSelectedDateInput(null);
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
        onPress: () => setEvents((prev) => prev.filter((e) => e.id !== id)),
      },
    ]);
  };

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => getDateTimeValue(a.dateISO, a.time) - getDateTimeValue(b.dateISO, b.time)
      ),
    [events]
  );

  const eventsByDate = useMemo(() => {
    const acc: Record<string, Event[]> = {};
    sortedEvents.forEach((event) => {
      if (!acc[event.dateISO]) {
        acc[event.dateISO] = [];
      }
      acc[event.dateISO].push(event);
    });
    return acc;
  }, [sortedEvents]);

  const selectedDateEvents = eventsByDate[selectedDateISO] ?? [];

  const agendaSections = useMemo(() => {
    const groups: Record<
      string,
      { title: string; data: Event[] }
    > = {};
    sortedEvents.forEach((event) => {
      const dateObj = parseLocalDateKey(event.dateISO);
      const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
      if (!groups[key]) {
        groups[key] = {
          title: dateObj.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          }),
          data: [],
        };
      }
      groups[key].data.push(event);
    });
    return Object.values(groups);
  }, [sortedEvents]);

  const calendarMatrix = useMemo(() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const startDay = firstDay.getDay();
    const matrix: { date: Date; inMonth: boolean; iso: string }[][] = [];
    const cursor = new Date(firstDay);
    cursor.setDate(cursor.getDate() - startDay);

    for (let week = 0; week < 6; week++) {
      const row: { date: Date; inMonth: boolean; iso: string }[] = [];
      for (let day = 0; day < 7; day++) {
        const clone = new Date(cursor);
        row.push({
          date: clone,
          inMonth: clone.getMonth() === currentMonth.getMonth(),
          iso: formatLocalDateKey(clone),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      matrix.push(row);
    }
    return matrix;
  }, [currentMonth]);

  const renderEventCard = (item: Event) => (
    <EventCard
      key={item.id}
      item={item}
      colors={colors}
      scaleFont={scaleFont}
      onDelete={deleteEvent}
    />
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        paddingTop: topPadding,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.card,
          padding: 4,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        {(["agenda", "calendar"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={{
              flex: 1,
              borderRadius: 8,
              paddingVertical: 10,
              backgroundColor:
                viewMode === mode ? colors.primary : "transparent",
              alignItems: "center",
            }}
            onPress={() => setViewMode(mode)}
          >
            <Text
              style={{
                color: viewMode === mode ? colors.onPrimary : colors.text,
                fontWeight: "600",
                fontSize: scaleFont(14),
              }}
            >
              {mode === "agenda" ? "Agenda" : "Calendar"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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

      {viewMode === "agenda" ? (
        events.length === 0 ? (
          <EmptyState colors={colors} scaleFont={scaleFont} />
        ) : (
          <SectionList
            sections={agendaSections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <Text
                style={{
                  color: colors.text,
                  fontSize: scaleFont(16),
                  fontWeight: "600",
                  marginTop: 20,
                  marginBottom: 8,
                }}
              >
                {section.title}
              </Text>
            )}
            renderItem={({ item }) => renderEventCard(item)}
          />
        )
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 8,
                backgroundColor: colors.card,
                borderRadius: 8,
              }}
              onPress={() =>
                setCurrentMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.text,
                fontSize: scaleFont(18),
                fontWeight: "600",
              }}
            >
              {currentMonth.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              style={{
                padding: 8,
                backgroundColor: colors.card,
                borderRadius: 8,
              }}
              onPress={() =>
                setCurrentMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text
                key={day}
                style={{
                  width: `${100 / 7}%`,
                  textAlign: "center",
                  color: colors.muted,
                  fontSize: scaleFont(12),
                }}
              >
                {day}
              </Text>
            ))}
          </View>

          <View style={{ flex: 1 }}>
            {calendarMatrix.map((week, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                {week.map((day) => {
                  const isSelected = day.iso === selectedDateISO;
                  const isToday = day.iso === todayISO;
                  const hasEvents = (eventsByDate[day.iso] ?? []).length > 0;
                  return (
                    <TouchableOpacity
                      key={day.iso}
                      style={{
                        width: `${100 / 7}%`,
                        aspectRatio: 1,
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                        borderWidth: isToday && !isSelected ? 1 : 0,
                        borderColor: colors.primary,
                        opacity: day.inMonth ? 1 : 0.35,
                      }}
                      onPress={() => {
                        setSelectedDateISO(day.iso);
                        setCurrentMonth(
                          new Date(
                            day.date.getFullYear(),
                            day.date.getMonth(),
                            1
                          )
                        );
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.onPrimary : colors.text,
                          fontWeight: isSelected ? "700" : "500",
                          fontSize: scaleFont(14),
                        }}
                      >
                        {day.date.getDate()}
                      </Text>
                      {hasEvents ? (
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            marginTop: 4,
                            backgroundColor: isSelected
                              ? colors.onPrimary
                              : colors.primary,
                          }}
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: scaleFont(16),
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Events on{" "}
              {parseLocalDateKey(selectedDateISO).toLocaleDateString(
                undefined,
                {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                }
              )}
            </Text>
            {selectedDateEvents.length === 0 ? (
              <Text style={{ color: colors.muted }}>
                No events scheduled for this day.
              </Text>
            ) : (
              selectedDateEvents.map((event) => renderEventCard(event))
            )}
          </View>
        </View>
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
                      const baseDate = selectedDateInput ?? parseLocalDateKey(selectedDateISO);
                      if (Platform.OS === "android") {
                        DateTimePickerAndroid.open({
                          value: baseDate,
                          onChange: (event, dateValue) => {
                            if (event.type === "set" && dateValue) {
                              setSelectedDateInput(dateValue);
                            }
                          },
                          mode: "date",
                          display: "calendar",
                        });
                      } else {
                        setSelectedDateInput(baseDate);
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
                        color: selectedDateInput ? colors.text : colors.muted,
                        fontSize: scaleFont(16),
                      }}
                    >
                      {selectedDateInput
                        ? formatDisplayDate(selectedDateInput)
                        : "Select date *"}
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
                        value={selectedDateInput ?? parseLocalDateKey(selectedDateISO)}
                        mode="date"
                        display="inline"
                        themeVariant={colorScheme === "light" ? "light" : "dark"}
                        onChange={(_, dateValue) => {
                          if (dateValue) {
                            setSelectedDateInput(dateValue);
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

type EventCardProps = {
  item: Event;
  colors: ThemeColors;
  scaleFont: (size: number) => number;
  onDelete: (id: string) => void;
};

function EventCard({ item, colors, scaleFont, onDelete }: EventCardProps) {
  return (
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
        <TouchableOpacity onPress={() => onDelete(item.id)}>
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
  );
}

function EmptyState({
  colors,
  scaleFont,
}: {
  colors: ThemeColors;
  scaleFont: (size: number) => number;
}) {
  return (
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
  );
}
