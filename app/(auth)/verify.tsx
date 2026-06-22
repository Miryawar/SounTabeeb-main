import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
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

import { useUser } from "@/context/UserContext";
import { apiPost } from "@/utils/api";

export default function Verify() {
  const router = useRouter();
  const { pendingId, email, role } = useLocalSearchParams();
  const { verifyEmail, completeRegister } = useUser();
  const [emailCode, setEmailCode] = useState("");
  const [loading, setLoading] = useState(false);

  // New state for the Resend Code feature
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!pendingId || !email) {
      return Alert.alert(
        "Verification error",
        "Missing verification information.",
      );
    }
  
    if (!emailCode) {
      return Alert.alert(
        "Enter code",
        "Please enter the email verification code.",
      );
    }
  
    setLoading(true);
  
    const verifyResult = await verifyEmail(
      email.toString(),
      emailCode,
    );
  
    if (!verifyResult.ok) {
      setLoading(false);
  
      return Alert.alert(
        "Verification failed",
        verifyResult.message,
      );
    }
  
    const result = await completeRegister(
      pendingId.toString(),
    );
  
    setLoading(false);
  
    if (!result.ok) {
      return Alert.alert(
        "Registration failed",
        result.message,
      );
    }
  
    Alert.alert(
      "Account verified",
      "Your account is now active.",
    );
  
    if (role === "doctor") {
      router.replace("/doctor/login");
    } else {
      router.replace("/sign-in");
    }
  };

  const handleResendCode = async () => {
    if (!email) return Alert.alert("Error", "Missing email address.");
    setResending(true);
    try {
      // Hit the endpoint dedicated to sending the verification code
      const res = await apiPost("/api/auth/send-email-verification", { email });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to resend code");

      Alert.alert("Success", "A new verification code has been sent to your email.");
      setTimer(30); // Restart the countdown timer
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex items-center justify-center m-2">
            <LinearGradient
              colors={["#2E86DE", "#A9CCE3"]}
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 20,
              }}
            >
              <View className="p-10" />
            </LinearGradient>

            <View className="w-full mt-8">
              <Text className="text-gray-800 font-bold text-4xl text-center">
                Verify Account
              </Text>
              <Text className="text-gray-600 text-lg font-semibold text-center mt-2">
                Enter the verification code you received by email.
              </Text>

              <View className="flex-row items-center justify-center gap-3 px-2 my-6">
                <View className="flex-1 h-[1px] bg-blue-600" />
                <Ionicons
                  name="checkmark-done-circle"
                  size={28}
                  color="#2563EB"
                />
                <View className="flex-1 h-[1px] bg-blue-600" />
              </View>

              <Text className="text-gray-600 text-lg font-bold">
                Email Code
              </Text>
              <TextInput
                placeholder="Enter email verification code"
                placeholderTextColor="#4B5563"
                value={emailCode}
                onChangeText={setEmailCode}
                keyboardType="numeric"
                maxLength={6}
                className="border border-gray-400 px-4 py-3 rounded-lg mb-4"
              />

              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                className="border rounded-lg bg-blue-600 flex flex-row items-center justify-between p-2 my-4"
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text className="text-white text-lg font-semibold text-center">
                  {loading ? "Verifying..." : "Verify Account"}
                </Text>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>

              {/* Resend Code Section */}
              <View className="flex-row justify-center items-center mt-2">
                <Text className="text-gray-600 text-base">Didn't receive the code? </Text>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={timer > 0 || resending}
                >
                  <Text 
                    className={`text-base font-bold ${
                      timer > 0 ? "text-gray-400" : "text-blue-600"
                    }`}
                  >
                    {resending 
                      ? "Resending..." 
                      : timer > 0 
                      ? `Resend in ${timer}s` 
                      : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-center gap-2 px-2 mt-6">
                <View className="flex-1 h-[1px] bg-gray-600" />
                <Text className="text-gray-600 font-bold">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-600" />
              </View>

              <TouchableOpacity
                onPress={() => router.replace("/sign-in")}
                className="flex flex-row items-center gap-2 justify-center mt-4"
              >
                <Text className="text-gray-600 text-lg font-semibold">
                  Already verified?
                </Text>
                <Text className="text-blue-600 text-xl font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}