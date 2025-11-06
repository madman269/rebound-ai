import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  FlatList,
  Animated,
  Platform,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";

const API = "https://rebound-ai.onrender.com";


export default function ReboundChat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // start new session on mount
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/rebound/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "closure",
          summary:
            "Relationship ended recently; user feels abandoned but seeks clarity.",
        }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    })();
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    try {
      const res = await fetch(`${API}/rebound/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: input }),
      });
      const data = await res.json();
      const aiMsg = { role: "assistant", content: data.reply };
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setMessages((m) => [...m, aiMsg]);
    } catch (err) {
      console.error(err);
    }
  }

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.role === "user" ? styles.user : styles.ai,
      ]}
    >
      <Text style={styles.text}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.View style={[styles.chatContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Talk to me..."
            placeholderTextColor="#999"
          />
          <Pressable onPress={sendMessage} style={styles.send}>
            <Text style={{ color: "white", fontWeight: "600" }}>→</Text>
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E2F" },
  chatContainer: { flex: 1 },
  bubble: {
    maxWidth: "80%",
    padding: 10,
    marginVertical: 4,
    borderRadius: 14,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#EAB0B0",
  },
  ai: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  text: { color: "white", fontSize: 16, lineHeight: 22 },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  send: {
    backgroundColor: "#EAB0B0",
    borderRadius: 10,
    padding: 10,
    marginLeft: 8,
  },
});
