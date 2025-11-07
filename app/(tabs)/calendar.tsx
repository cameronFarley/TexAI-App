import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
};

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const addEvent = () => {
    if (!title || !date || !time) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title,
      date,
      time,
      description,
    };

    setEvents([...events, newEvent].sort((a, b) => 
      new Date(a.date + " " + a.time).getTime() - 
      new Date(b.date + " " + b.time).getTime()
    ));

    setTitle("");
    setDate("");
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
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#007AFF",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 20,
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
          + Add Event
        </Text>
      </TouchableOpacity>

      {events.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Ionicons name="calendar-outline" size={64} color="#333" />
          <Text style={{ color: "#888", marginTop: 10, fontSize: 16 }}>
            No events yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#1E1E1E",
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "600", flex: 1 }}>
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => deleteEvent(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              <Text style={{ color: "#888", marginTop: 8 }}>
                {item.date} at {item.time}
              </Text>
              {item.description ? (
                <Text style={{ color: "#CCC", marginTop: 8 }}>
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
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#1E1E1E", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
              New Event
            </Text>

            <TextInput
              placeholder="Event title *"
              placeholderTextColor="#777"
              value={title}
              onChangeText={setTitle}
              style={{
                color: "white",
                backgroundColor: "#2C2C2C",
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
              }}
            />

            <TextInput
              placeholder="Date (YYYY-MM-DD) *"
              placeholderTextColor="#777"
              value={date}
              onChangeText={setDate}
              style={{
                color: "white",
                backgroundColor: "#2C2C2C",
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
              }}
            />

            <TextInput
              placeholder="Time (HH:MM) *"
              placeholderTextColor="#777"
              value={time}
              onChangeText={setTime}
              style={{
                color: "white",
                backgroundColor: "#2C2C2C",
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
              }}
            />

            <TextInput
              placeholder="Description (optional)"
              placeholderTextColor="#777"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{
                color: "white",
                backgroundColor: "#2C2C2C",
                padding: 14,
                borderRadius: 10,
                marginBottom: 20,
                textAlignVertical: "top",
              }}
            />

            <TouchableOpacity
              style={{
                backgroundColor: "#007AFF",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 10,
              }}
              onPress={addEvent}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Create Event
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#2C2C2C",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}