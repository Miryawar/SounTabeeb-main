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

import { apiPost } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Chat() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const router = useRouter();

  const fetchAiChat = async (query: string) => {
    setLoading(true);
    try {
      const res = await apiPost("/api/ai-chat", { text: query });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.answer || "");
        setRecommendations(data.recommendations || []);
      } else {
        const error = await res.json();
        console.warn("AI chat failed", error);
      }
    } catch (err) {
      console.warn("AI chat failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // No doctor-specific chat behavior is used; this screen only handles AI assistant queries.
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await fetchAiChat(text.trim());
      setText("");
    } catch (err) {
      console.warn("AI send failed", err);
    }
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#2563EB", "#DBEAFE"]} className="flex-1">
        <SafeAreaView className="flex-1">
          {/* AI Chat Assistant */}
          <ScrollView
            ref={(r) => (scrollRef.current = r)}
            className="flex-1 px-4 pt-6"
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View>
                {aiResponse ? (
                  <View className="mb-4 bg-white rounded-3xl px-4 py-3">
                    <Text className="text-gray-800 font-semibold mb-3">
                      AI Assistant Response
                    </Text>
                    <Text className="text-gray-700 text-base">
                      {aiResponse}
                    </Text>
                  </View>
                ) : (
                  <View className="mb-4 bg-white rounded-3xl px-4 py-3">
                    <Text className="text-gray-800 font-semibold mb-3">
                      Ask about your symptoms or health concerns.
                    </Text>
                    <Text className="text-gray-700 text-base">
                      The AI assistant will answer your questions and suggest
                      suitable available doctors.
                    </Text>
                  </View>
                )}

                {recommendations.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-white font-semibold text-lg mb-3">
                      Recommended Doctors
                    </Text>
                    {recommendations.map((doc) => (
                      <View
                        key={doc._id}
                        className="bg-white rounded-3xl p-4 mb-3"
                      >
                        <Text className="text-gray-800 font-bold text-lg">
                          {doc.name}
                        </Text>
                        <Text className="text-gray-600">{doc.speciality}</Text>
                        <Text className="text-gray-600">
                          Experience: {doc.experience}
                        </Text>
                        <Text className="text-gray-600">
                          Fee: Rs {doc.fees}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Bottom Input */}
          <View className="px-4 py-4 bg-white rounded-t-3xl">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <TouchableOpacity>
                <Ionicons name="happy-outline" size={24} color="gray" />
              </TouchableOpacity>

              <TextInput
                placeholder="Ask the AI assistant about your symptoms..."
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
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}
