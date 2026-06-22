import { assets } from "@/assets/assets";
import { useDoctor } from "@/context/DoctorContext";
import {
    validateEmail,
    validateName,
    validatePassword,
    validatePhone,
} from "@/utils/signupValidation";
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

export default function DoctorSignUp() {
  const router = useRouter();
  const { register } = useDoctor();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    speciality: "",
    qualification: "",
    experience: "",
    licenseNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    const nameCheck = validateName(formData.name);
    const emailCheck = validateEmail(formData.email);
    const phoneCheck = validatePhone(formData.phone);
    const passwordCheck = validatePassword(formData.password);

    if (!nameCheck.valid) return Alert.alert("Error", nameCheck.message);
    if (!emailCheck.valid) return Alert.alert("Error", emailCheck.message);
    if (!phoneCheck.valid) return Alert.alert("Error", phoneCheck.message);
    if (!passwordCheck.valid)
      return Alert.alert("Error", passwordCheck.message);

    if (!formData.speciality.trim()) {
      return Alert.alert("Error", "Speciality is required");
    }
    if (!formData.qualification.trim()) {
      return Alert.alert("Error", "Qualification is required");
    }
    if (!formData.experience.trim()) {
      return Alert.alert("Error", "Experience is required");
    }
    if (!formData.licenseNumber.trim()) {
      return Alert.alert("Error", "License number is required");
    }

    if (formData.password !== formData.confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    setLoading(true);
    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        {
          phone: formData.phone,
          speciality: formData.speciality,
          qualification: formData.qualification,
          experience: formData.experience,
          licenseNumber: formData.licenseNumber,
        },
      );

      if (!result.ok) {
        return Alert.alert(
          "Signup Failed",
          result.message || "Could not create account",
        );
      }

      if (result.pendingId) {
        router.push({
          pathname: "/verify",
          params: {
            pendingId: result.pendingId,
            email: formData.email,
            role: "doctor",
          },
        });
        return;
      }

      Alert.alert("Success", "Doctor account created successfully");
      router.replace("/doctor/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <LinearGradient
              colors={["#2E86DE", "#82B1FF"]}
              className="w-full rounded-3xl p-4 mb-6"
              style={{ alignItems: "center" }}
            >
              <Image
                source={assets.frontimage}
                resizeMode="contain"
                style={{ width: 240, height: 200 }}
              />
            </LinearGradient>
    
              <View className="flex flex-row gap-3 items-center justify-center mt-8 mb-2">
                <Text className="text-gray-800 font-bold text-4xl">Create</Text>
                <Text className="text-blue-600 font-bold text-4xl">
                  Account
                </Text>
              </View>
              <Text className="text-gray-600 text-lg font-semibold  text-center">
              Create your professional account and start connecting with
              patients.
              </Text>

              <View className="flex-row items-center justify-center gap-2 px-2 m-4">
                <View className="flex-1 h-[2px] bg-blue-600" />
                <Ionicons name="heart" size={24} color={"#2563EB"} />
                <View className="flex-1 h-[2px] bg-blue-600" />
              </View>
          
            <View className="w-full space-y-4">
              {/* Name */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Full Name
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(val) => handleChange("name", val)}
                  placeholder="Dr. John"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              {/* Email */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">Email</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(val) => handleChange("email", val)}
                  placeholder="doctor@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              {/* Phone */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Phone Number
                </Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(val) => handleChange("phone", val)}
                  placeholder="03001234567"
                  keyboardType="phone-pad"
                  maxLength={10}
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              {/* Speciality */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Speciality
                </Text>
                <TextInput
                  value={formData.speciality}
                  onChangeText={(val) => handleChange("speciality", val)}
                  placeholder="e.g., Cardiology, Pediatrics"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              {/* Qualification */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Qualification
                </Text>
                <TextInput
                  value={formData.qualification}
                  onChangeText={(val) => handleChange("qualification", val)}
                  placeholder="e.g., MBBS, MD"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              {/* Experience */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Years of Experience
                </Text>
                <TextInput
                  value={formData.experience}
                  onChangeText={(val) => handleChange("experience", val)}
                  placeholder="e.g., 10"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              {/* License Number */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  License Number
                </Text>
                <TextInput
                  value={formData.licenseNumber}
                  onChangeText={(val) => handleChange("licenseNumber", val)}
                  placeholder="Medical license number"
                  className="border border-gray-300 rounded-2xl px-4 py-3"
                />
              </View>

              {/* Password */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Password
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-2xl px-4 py-3">
                  <TextInput
                    value={formData.password}
                    onChangeText={(val) => handleChange("password", val)}
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    className="flex-1"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={22}
                      color="#4B5563"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Confirm Password
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-2xl px-4 py-3">
                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(val) => handleChange("confirmPassword", val)}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={22}
                      color="#4B5563"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                className={`flex-row items-center justify-center rounded-2xl bg-blue-600 py-4 px-6 mt-6 ${loading ? "opacity-50" : ""}`}
              >
                <Ionicons name="person-add" size={22} color="#fff" />
                <Text className="ml-3 text-white text-lg font-semibold">
                  {loading ?  "Signing Up..." : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/doctor/login")}
                className="items-center rounded-2xl bg-gray-100 py-4 px-6"
              >
                <Text className="text-gray-700 text-base">
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
