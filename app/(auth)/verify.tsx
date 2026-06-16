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

import { useUser } from "@/context/UserContext";

export default function Verify() {
  const router = useRouter();
  const { pendingId, email } = useLocalSearchParams();
  const { verifyEmail, completeRegister } = useUser();
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [loading, setLoading] = useState(false);

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
  
    router.replace("/sign-in");
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
                Enter the verification code you received by email or phone.
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

              <Text className="text-gray-600 text-lg font-bold">
                Phone Code
              </Text>
              <TextInput
                placeholder="Enter phone verification code"
                placeholderTextColor="#4B5563"
                value={phoneCode}
                onChangeText={setPhoneCode}
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

              <View className="flex-row items-center justify-center gap-2 px-2 mt-4">
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
