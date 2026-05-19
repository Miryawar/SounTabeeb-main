import { assets } from "@/assets/assets";
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

import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/utils/signupValidation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    const nameCheck = validateName(name);
    const emailCheck = validateEmail(email);
    const phoneCheck = validatePhone(phone);
    const passwordCheck = validatePassword(password);

    if (!nameCheck.valid) return alert(nameCheck.message);
    if (!emailCheck.valid) return alert(emailCheck.message);
    if (!phoneCheck.valid) return alert(phoneCheck.message);
    if (!passwordCheck.valid) return alert(passwordCheck.message);

    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    // backend call here
    // API CALL
    try {
      const res = await fetch("http://10.113.71.177:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert(data.message || "Signup failed");
      }

      Alert.alert("Success", "Account created");

      router.replace("/sign-in");
    } catch (error) {
      console.log(error);
      Alert.alert("Server error");
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView behavior="padding">
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex justify-center items-center  m-2">
            <LinearGradient
              colors={["#2E86DE", "#A9CCE3"]}
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 20, // optional
              }}
            >
              <Image
                source={assets.frontimage}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
              ></Image>
            </LinearGradient>

            <View>
              <View className="flex flex-row gap-3 items-center justify-center mt-8 mb-2">
                <Text className="text-gray-800 font-bold text-4xl">Create</Text>
                <Text className="text-blue-600 font-bold text-4xl">
                  Account
                </Text>
              </View>
              <Text className="text-gray-600 text-lg font-semibold  text-center">
                Sign up to get started with Soun Tabeeb
              </Text>

              <View className="flex-row items-center justify-center gap-2 px-2 m-4">
                <View className="flex-1 h-[2px] bg-blue-600" />
                <Ionicons name="heart" size={24} color={"#2563EB"} />
                <View className="flex-1 h-[2px] bg-blue-600" />
              </View>

              <Text className="text-gray-600 text-lg font-bold">Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor={"#4B5563"}
                value={name}
                onChangeText={setName}
                className="border border-gray-400 px-4 py-3 rounded-lg mb-4"
              />
              <Text className="text-gray-600 text-lg font-bold">
                Email Address
              </Text>
              <TextInput
                placeholder="Enter your email address"
                placeholderTextColor={"#4B5563"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                className="border border-gray-400 px-4 py-3 rounded-lg mb-4"
              />
              <Text className="text-gray-600 text-lg font-bold">
                Phone Number
              </Text>
              <TextInput
                placeholder="Enter your phone number"
                placeholderTextColor={"#4B5563"}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
                className="border border-gray-400 px-4 py-3 rounded-lg mb-4"
              />
              <Text className="text-gray-600 text-lg font-bold">Password</Text>
              <View className="flex flex-row items-center justify-between border border-gray-400 px-4 rounded-lg mb-4">
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor={"#4B5563"}
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

              <Text className="text-gray-600 text-lg font-bold">
                Confirm Password
              </Text>
              <View className="flex flex-row items-center justify-between border border-gray-400 px-4 rounded-lg mb-4">
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor={"#4B5563"}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  // className="border border-gray-400 px-4 py-3 rounded-lg mb-4"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={24}
                    color={"gray"}
                  ></Ionicons>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                className="border rounded-lg bg-blue-600 flex flex-row items-center  justify-between p-2 my-4 "
              >
                <Ionicons
                  className="person"
                  size={24}
                  color={"#fff"}
                ></Ionicons>
                <Text className="text-white text-lg font-semibold text-center">
                  Sign Up
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
                onPress={() => router.push("/sign-in")}
                className="flex flex-row items-center  gap-3"
              >
                <Text className="text-gray-600 font-semibold text-lg">
                  Already User?
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
