import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiPost } from "@/utils/api";
import { validateEmail } from "@/utils/validation";

export default function ForgotPassword() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequestReset = async () => {
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) return Alert.alert(emailCheck.message);

    setLoading(true);
    try {
      const res = await apiPost("/api/auth/forgot-password", { email });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      setSent(true);
      Alert.alert(
        "Password reset email sent",
        "Check your email for reset instructions.",
      );
    } catch (err: any) {
      Alert.alert(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="items-center">
            <LinearGradient
              colors={["#2E86DE", "#82B1FF"]}
              className="w-full rounded-3xl p-6 mb-6"
              style={{ alignItems: "center" }}
            >
              <Ionicons name="mail-open" size={72} color="#fff" />
            </LinearGradient>

            <Text className="text-4xl font-bold text-gray-800 text-center">
              Forgot Password
            </Text>
            <Text className="text-center text-gray-500 mt-2 mb-6">
              Enter your email and we will send a password reset link.
            </Text>

            <View className="w-full space-y-4">
              <View>
                <Text className="text-gray-700 font-semibold mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              <TouchableOpacity
                onPress={handleRequestReset}
                disabled={loading}
                className="flex-row items-center justify-center rounded-2xl bg-blue-600 py-4 px-6"
              >
                <Ionicons name="send" size={22} color="#fff" />
                <Text className="ml-3 text-white text-lg font-semibold">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Text>
              </TouchableOpacity>

              {sent && (
                <View className="bg-green-100 rounded-2xl p-4 mt-4">
                  <Text className="text-green-700 font-semibold mb-2">
                    Reset email sent
                  </Text>
                  <Text className="text-gray-700">
                    Open your email and follow the link to reset your password.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() =>
                  router.replace(
                    returnTo === "doctor-login" ? "/doctor/login" : "/sign-in",
                  )
                }
                className="items-center rounded-2xl bg-white border border-blue-600 py-4 px-6 mt-4"
              >
                <Text className="text-blue-600 text-base font-semibold">
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
