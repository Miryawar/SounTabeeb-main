import { assets } from "@/assets/assets";
import { useUser } from "@/context/UserContext";
import { validateEmail, validatePassword } from "@/utils/validation";
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

export default function SignIn() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleLogin = async () => {
    const emailCheck = validateEmail(email);
    const passwordCheck = validatePassword(password);

    if (!emailCheck.valid) {
      return Alert.alert(emailCheck.message);
    }

    if (!passwordCheck.valid) {
      return Alert.alert(passwordCheck.message);
    }

    const { ok, message } = await login(email, password);
    if (!ok) return Alert.alert(message || "Login failed");
    Alert.alert("Success", "Login successful");
    router.replace("/home");
  };
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <ScrollView
          contentContainerStyle={{ padding: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex justify-center items-center  m-1">
            <LinearGradient
              colors={["#4d7cab", "#9aafbd", "#f7fcff"]}
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 40, // optional
              }}
            >
              <Image
                source={assets.frontimage}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
              ></Image>
            </LinearGradient>

            <View>
              <View className="flex flex-row gap-4 items-center justify-center mt-5 mb-2">
                <Text className="text-gray-800 font-bold text-4xl">
                  Welcome
                </Text>
                <Text className="text-blue-600 font-bold text-4xl">Back</Text>
              </View>
              <Text className="text-gray-600 text-lg font-semibold  text-center">
                Sign in to continue to Soun Tabeeb
              </Text>

              <View className="flex-row items-center justify-center gap-2 px-2 m-4">
                <View className="flex-1 h-[1px] bg-gray-600" />
                <Ionicons name="heart" size={24} color={"#2563EB"} />
                <View className="flex-1 h-[1px] bg-gray-600" />
              </View>

              <Text className="text-gray-600 text-lg font-bold">Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={"#4B5563"}
                value={email}
                onChangeText={setEmail}
                className="border border-gray-400 px-4 py-3 rounded-lg mb-4"
              />
              <Text className="text-gray-600 text-lg font-bold">Password</Text>

              <View className="flex flex-row items-center justify-between border border-gray-400 px-4 rounded-lg mb-4">
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={"#000000"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color={"gray"}
                  ></Ionicons>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleLogin}
                className="border rounded-lg bg-blue-600 flex flex-row items-center  justify-between p-2 my-4 "
              >
                <Ionicons name="person" size={24} color={"#fff"}></Ionicons>
                <Text className="text-white text-lg font-semibold text-center">
                  Sign In
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={"#fff"}
                ></Ionicons>
              </TouchableOpacity>

              <View className="flex-row items-center justify-center gap-2 px-2 m-4">
                <View className="flex-1 h-[1px] bg-gray-600" />
                <Text className="text-gray-600 font-bold">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-600" />
              </View>

              <TouchableOpacity
                onPress={() => router.push("/sign-up")}
                className="flex flex-row items-center  gap-2"
              >
                <Text className="text-gray-600 font-semibold text-lg">
                  Don`t have an account?
                </Text>
                <Text className="text-blue-600 text-xl font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
