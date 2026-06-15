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
import { validatePassword } from "@/utils/validation";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token) return Alert.alert("Invalid reset link", "Missing token.");
    if (password !== confirmPassword)
      return Alert.alert("Passwords do not match");

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return Alert.alert(passwordCheck.message);

    setLoading(true);
    try {
      const res = await apiPost("/api/auth/reset-password", {
        token,
        password,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      Alert.alert(
        "Password reset",
        "You can now sign in with your new password.",
      );
      router.replace("/sign-in");
    } catch (err: any) {
      Alert.alert(err.message || "Failed to reset password");
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
              <Ionicons name="lock-closed" size={72} color="#fff" />
            </LinearGradient>

            <Text className="text-4xl font-bold text-gray-800 text-center">
              Reset Password
            </Text>
            <Text className="text-center text-gray-500 mt-2 mb-6">
              Enter a new password to complete reset.
            </Text>

            <View className="w-full space-y-4">
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  New Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  secureTextEntry
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  secureTextEntry
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              <TouchableOpacity
                onPress={handleReset}
                disabled={loading}
                className="flex-row items-center justify-center rounded-2xl bg-blue-600 py-4 px-6"
              >
                <Ionicons name="refresh" size={22} color="#fff" />
                <Text className="ml-3 text-white text-lg font-semibold">
                  {loading ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace("/sign-in")}
                className="items-center rounded-2xl bg-white border border-blue-600 py-4 px-6"
              >
                <Text className="text-blue-600 text-base font-semibold">
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
