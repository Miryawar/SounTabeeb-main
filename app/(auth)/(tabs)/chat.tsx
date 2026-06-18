import { apiGet, apiPost } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Type annotations removed to avoid build-time TypeScript parsing issues in Metro.
// The runtime behavior is unchanged; these are simple JS objects with the
// shape used below (id, author, text, optional attachment) for messages,
// and doctor recommendation objects with _id, name, speciality, etc.

export default function Chat() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef(null);
  const router = useRouter();

  const fetchAiChat = async (query: string) => {
    setLoading(true);
    setRecommendations([]);
    try {
      const res = await apiPost("/api/ai-chat", { text: query });
      const data = await res.json();
      if (!res.ok) {
        console.warn("AI chat failed", data);
        return (
          data?.message ||
          "I couldn't get a response from the assistant. Please try again."
        );
      }

      setRecommendations(data.recommendations || []);
      return (
        data.answer || "I'm sorry, I couldn't find an answer to that right now."
      );
    } catch (err) {
      console.warn("AI chat failed", err);
      return "I couldn't connect to the assistant. Please try again.";
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const loadChatHistory = async () => {
    try {
      const res = await apiGet("/api/ai-chat/history");
      const data = await res.json();
      if (!res.ok) {
        console.warn("Failed to load chat history", data);
        return;
      }

      const historyMessages = (data.messages || []).map((message) => ({
        id: `${message._id}-${message.role}`,
        author: message.role === "assistant" ? "assistant" : "user",
        text: message.text,
      }));
      setMessages(historyMessages);
    } catch (err) {
      console.warn("Failed to load chat history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setAttachment({
      name: asset.name,
      uri: asset.uri,
      size: asset.size,
      mimeType: asset.mimeType,
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    setRecommendations([]);
    setAttachment(null);
    setText("");
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    const hasContent = !!trimmed || !!attachment;
    if (!hasContent) return;

    const messageText = trimmed
      ? trimmed
      : attachment
        ? `Attached document: ${attachment.name}`
        : "";

    const newMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      author: "user",
      text: messageText,
      attachment: attachment || undefined,
    };
    setMessages((prev) => [...prev, newMessage]);
    setText("");
    setAttachment(null);

    if (trimmed) {
      const answer = await fetchAiChat(trimmed);
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        author: "assistant",
        text: answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        author: "assistant",
        text: "Document attached. Describe your question and I can help with guidance.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#2563EB", "#DBEAFE"]} className="flex-1">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1">
              <ScrollView
                ref={scrollRef}
                className="flex-1 px-4 pt-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="mb-4 bg-white rounded-3xl px-4 py-4 shadow-sm">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-800 font-semibold text-lg">
                      AI Health Assistant
                    </Text>
                    <TouchableOpacity
                      onPress={handleClearChat}
                      className="rounded-full bg-blue-50 px-3 py-2"
                    >
                      <Text className="text-blue-600 font-semibold text-sm">
                        Clear
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-gray-600 text-base">
                    Ask your question about your health and symptoms.
                  </Text>
                </View>

                {loadingHistory ? (
                  <View className="py-12 items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="text-white text-base mt-3">
                      Loading conversation...
                    </Text>
                  </View>
                ) : messages.length === 0 ? (
                  <View className="py-12 items-center">
                    <Text className="text-white text-base">
                      Start your first health question by typing below.
                    </Text>
                  </View>
                ) : (
                  messages.map((message) => (
                    <View
                      key={message.id}
                      className={`mb-3 flex-row ${
                        message.author === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <View
                        className={`rounded-3xl px-4 py-3 max-w-[80%] ${
                          message.author === "user"
                            ? "bg-blue-600"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-base ${
                            message.author === "user"
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {message.text}
                        </Text>
                      </View>
                    </View>
                  ))
                )}

                {loading && (
                  <ActivityIndicator
                    size="large"
                    color="#fff"
                    className="mb-4"
                  />
                )}

                {recommendations.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-semibold text-lg mb-3">
                      Recommended Doctors
                    </Text>
                    {recommendations.map((doc) => (
                      <TouchableOpacity
                        key={doc._id}
                        onPress={() => router.push(`/appointment/${doc._id}`)}
                        className="bg-white rounded-3xl p-4 mb-3 flex-row items-center"
                      >
                        <View className="mr-4 h-16 w-16 rounded-3xl bg-blue-50 items-center justify-center overflow-hidden">
                          {doc.profilePicture ? (
                            <Image
                              source={{ uri: doc.profilePicture }}
                              className="h-16 w-16 rounded-3xl"
                            />
                          ) : (
                            <Ionicons
                              name="person-circle-outline"
                              size={36}
                              color="#2563EB"
                            />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-800 font-bold text-lg">
                            {doc.name}
                          </Text>
                          <Text className="text-gray-600">
                            {doc.speciality}
                          </Text>
                          <Text className="text-gray-600">
                            Experience: {doc.experience || "N/A"}
                          </Text>
                          <Text className="text-gray-600">
                            Fee: Rs {doc.fees ?? "N/A"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>

              <View className="px-4 py-4 bg-white rounded-t-3xl">
                {attachment && (
                  <View className="mb-3 rounded-3xl bg-gray-100 px-4 py-3 flex-row items-center justify-between">
                    <View>
                      <Text className="font-semibold text-gray-900">
                        Attached document
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {attachment.name}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setAttachment(null)}>
                      <Ionicons name="close-circle" size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                )}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                  <TouchableOpacity onPress={handlePickDocument}>
                    <Ionicons name="document-outline" size={24} color="gray" />
                  </TouchableOpacity>
                  <TextInput
                    placeholder="Ask the AI assistant about your symptoms..."
                    className="flex-1 px-3 text-base"
                    value={text}
                    onChangeText={setText}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center ml-3"
                  >
                    <Ionicons name="send" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}
