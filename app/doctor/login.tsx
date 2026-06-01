import { assets } from "@/assets/assets";
import { useDoctor } from "@/context/DoctorContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorLogin() {
  const router = useRouter();
  const { login } = useDoctor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Please enter both email and password.");
    }

    const result = await login(email, password);
    if (!result.ok) {
      return Alert.alert(result.message || "Doctor login failed.");
    }

    router.replace("/doctor/dashboard");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="items-center">
            <LinearGradient
              colors={["#2E86DE", "#82B1FF"]}
              className="w-full rounded-3xl p-4 mb-6"
              style={{ alignItems: "center" }}
            >
              <Image
                source={assets.frontimage}
                resizeMode="contain"
                style={{ width: 260, height: 220 }}
              />
            </LinearGradient>

            <Text className="text-4xl font-bold text-gray-800">Doctor</Text>
            <Text className="text-3xl font-bold text-blue-600">Login</Text>
            <Text className="text-center text-gray-500 mt-3 mb-6">
              Enter your doctor credentials to access the dashboard.
            </Text>

            <View className="w-full space-y-4">
              <View>
                <Text className="text-gray-700 font-semibold mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="doctor@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Password
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-2xl px-4 py-3">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    secureTextEntry={!showPassword}
                    className="flex-1"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((state) => !state)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#4B5563"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                className="flex-row items-center justify-center rounded-2xl bg-blue-600 py-4 px-6"
              >
                <Ionicons name="log-in" size={22} color="#fff" />
                <Text className="ml-3 text-white text-lg font-semibold">
                  Doctor Login
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center justify-center gap-2 px-2 my-4">
                <View className="flex-1 h-[1px] bg-gray-400" />
                <Text className="text-gray-500">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-400" />
              </View>

              <TouchableOpacity
                onPress={() => router.push("/doctor/signup")}
                className="items-center rounded-2xl bg-white border border-blue-600 py-4 px-6"
              >
                <Text className="text-blue-600 text-base font-semibold">
                  Don't have an account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
