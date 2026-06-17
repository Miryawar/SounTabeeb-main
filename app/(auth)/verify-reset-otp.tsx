import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiPost } from "@/utils/api";

export default function VerifyResetOtp() {
  const router = useRouter();
  const { email, returnTo } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      return Alert.alert("Enter OTP");
    }

    setLoading(true);

    try {
      const res = await apiPost("/api/auth/verify-reset-otp", {
        email,
        otp,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      router.replace({
        pathname: "/reset-password",
        params: {
          email,
          returnTo,
        },
      });
    } catch (err: any) {
      Alert.alert("Verification Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center px-6">
      <Text className="text-3xl font-bold mb-6">Verify OTP</Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        className="bg-blue-600 rounded-xl py-4"
      >
        <Text className="text-white text-center font-bold">
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
