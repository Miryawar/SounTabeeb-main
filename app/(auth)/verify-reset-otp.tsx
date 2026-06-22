import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { apiPost } from "@/utils/api";

export default function VerifyResetOtp() {
  const router = useRouter();
  const { email, returnTo } = useLocalSearchParams();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // New state for the Resend OTP feature
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

  const handleResendOTP = async () => {
    setResending(true);
    try {
      // Ensure this matches the endpoint your backend uses to send the reset OTP initially
      const res = await apiPost("/api/auth/forgot-password", { email });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP");

      Alert.alert("Success", "A new OTP has been sent to your email.");
      setTimer(30); // Restart the countdown timer
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-2">Verify OTP</Text>
      
      {/* Optional UX improvement: Show the user which email the OTP went to */}
      <Text className="text-gray-500 mb-6">
        Enter the verification code sent to {email}
      </Text>

      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        className="bg-blue-600 rounded-xl py-4"
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>

      {/* Resend OTP Section */}
      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-gray-600 text-base">Didn't receive the OTP? </Text>
        <TouchableOpacity
          onPress={handleResendOTP}
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
              : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
