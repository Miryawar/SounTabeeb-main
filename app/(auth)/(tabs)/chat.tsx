// import {View,Text,Image,ScrollView,TextInput,TouchableOpacity,} from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { SafeAreaProvider } from "react-native-safe-area-context";

// export default function Chat() {
//     return(
//         <SafeAreaProvider className="flex-1 py-40 px-48">
//             <View>
//             <LinearGradient colors={["#2563EB", "#DBEAFE"]} className="flex-1">
//                 <Text>Messafffffffffffges</Text>

//                 </LinearGradient>
//                 </View>
//             </SafeAreaProvider>

//     );
// }

import { apiGet, apiPost } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Chat() {
  const params = useLocalSearchParams();
  const doctorId = params.doctorId as string | undefined;
  const doctorName = params.doctorName as string | undefined;
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const router = useRouter();

  const fetchMessages = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await apiGet(`/api/chats/${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.warn("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoadingConvos(true);
    try {
      const res = await apiGet("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.warn("Failed to fetch conversations", err);
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchMessages();
      const iv = setInterval(fetchMessages, 3000);
      return () => clearInterval(iv);
    } else {
      fetchConversations();
    }
  }, [doctorId]);

  const handleSend = async () => {
    if (!text.trim() || !doctorId) return;
    try {
      const res = await apiPost(`/api/chats/${doctorId}`, {
        text: text.trim(),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((m) => [...m, newMsg]);
        setText("");
      }
    } catch (err) {
      console.warn("Send failed", err);
    }
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#2563EB", "#DBEAFE"]} className="flex-1">
        <SafeAreaView className="flex-1">
          {/* Chat Messages or Conversations */}
          {!doctorId ? (
            <ScrollView
              className="flex-1 px-4 pt-6"
              showsVerticalScrollIndicator={false}
            >
              {loadingConvos ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : conversations.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <Text className="text-white text-lg font-semibold">
                    No previous chats yet
                  </Text>
                  <Text className="text-white/70 mt-2 text-center px-6">
                    Your recent chats with doctors will appear here once you
                    start a conversation.
                  </Text>
                </View>
              ) : (
                conversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.doctorId}
                    onPress={() =>
                      router.push(
                        `/chat?doctorId=${conv.doctorId}&doctorName=${encodeURIComponent(
                          conv.doctorName || "Doctor",
                        )}`,
                      )
                    }
                    className="flex-row items-center px-4 py-3 border-b border-white/10"
                  >
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300",
                      }}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <View className="flex-1">
                      <Text className="text-white font-semibold">
                        {conv.doctorName || "Doctor"}
                      </Text>
                      <Text
                        className="text-white/80 text-sm mt-1"
                        numberOfLines={1}
                      >
                        {conv.lastMessage?.text}
                      </Text>
                    </View>
                    <Text className="text-white/60 text-xs">
                      {conv.lastMessage
                        ? new Date(
                            conv.lastMessage.createdAt,
                          ).toLocaleTimeString()
                        : ""}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          ) : (
            <ScrollView
              ref={(r) => (scrollRef.current = r)}
              className="flex-1 px-4 pt-6"
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                messages.map((message) => (
                  <View
                    key={message._id}
                    className={`mb-4 flex ${
                      message.senderRole === "user"
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <View
                      className={`max-w-[80%] px-4 py-3 rounded-3xl ${
                        message.senderRole === "user"
                          ? "bg-blue-600 rounded-br-md"
                          : "bg-white rounded-bl-md"
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          message.senderRole === "user"
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {message.text}
                      </Text>

                      <Text
                        className={`text-[10px] mt-2 text-right ${
                          message.senderRole === "user"
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}

          {/* Bottom Input */}
          {doctorId && (
            <View className="px-4 py-4 bg-white rounded-t-3xl">
              <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                <TouchableOpacity>
                  <Ionicons name="happy-outline" size={24} color="gray" />
                </TouchableOpacity>

                <TextInput
                  placeholder="Type your message..."
                  className="flex-1 px-3 text-base"
                  value={text}
                  onChangeText={setText}
                />

                <TouchableOpacity>
                  <Ionicons name="attach" size={24} color="gray" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSend}
                  className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center ml-3"
                >
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}
