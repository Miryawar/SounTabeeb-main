import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#f0f9ff", "#e0f2fe", "#bae6fd"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 30,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mt-8 mb-8">
            <View className="items-center mb-6">
              <LinearGradient
                colors={["#2E86DE", "#82B1FF"]}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="heart" size={60} color="#fff" />
              </LinearGradient>

              <View className="flex-row items-center justify-center gap-1 mb-3">
                <Text className="text-4xl font-bold text-gray-900">Soun</Text>
                <Text className="text-4xl font-bold text-blue-600">Tabeeb</Text>
              </View>
              <Text className="text-center text-gray-600 text-base font-semibold">
                Your Health, Our Priority
              </Text>
            </View>

            <View className="bg-white bg-opacity-80 rounded-3xl p-6 shadow-lg">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Healthcare
              </Text>
              <Text className="text-gray-600 text-base leading-6">
                Connect with qualified doctors, book appointments, and manage
                your health seamlessly.
              </Text>
            </View>
          </View>

          {/* User Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              For Patients
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, overflow: "hidden" }}
              >
                <View className="flex-row items-center p-5">
                  <View className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                    <Ionicons name="person" size={32} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">
                      Patient Login
                    </Text>
                    <Text className="text-blue-100 text-sm">
                      Access your appointments
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              activeOpacity={0.8}
              className="mt-3"
            >
              <LinearGradient
                colors={["#DBEAFE", "#BFDBFE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, overflow: "hidden" }}
              >
                <View className="flex-row items-center p-5">
                  <View className="bg-blue-600 bg-opacity-10 rounded-full p-4 mr-4">
                    <Ionicons name="person-add" size={32} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-blue-900 text-lg font-bold">
                      Create Patient Account
                    </Text>
                    <Text className="text-blue-700 text-sm">
                      New to our platform?
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#2563EB" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Doctor Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              For Doctors
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/doctor/login")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, overflow: "hidden" }}
              >
                <View className="flex-row items-center p-5">
                  <View className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                    <Ionicons name="medkit" size={32} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">
                      Doctor Login
                    </Text>
                    <Text className="text-green-100 text-sm">
                      Manage your practice
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => router.push("/doctor/signup")}
              activeOpacity={0.8}
              className="mt-3"
            >
              <LinearGradient
                colors={["#D1FAE5", "#A7F3D0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, overflow: "hidden" }}
              >
                <View className="flex-row items-center p-5">
                  <View className="bg-green-600 bg-opacity-10 rounded-full p-4 mr-4">
                    <Ionicons name="medical" size={32} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-green-900 text-lg font-bold">
                      Register as Doctor
                    </Text>
                    <Text className="text-green-700 text-sm">
                      Join our network
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#10B981" />
                </View>
              </LinearGradient>
            </TouchableOpacity> */}
          </View>

          {/* Features Section */}
          <View className="mt-12 bg-white bg-opacity-60 rounded-3xl p-6 shadow-md">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Why Choose Us?
            </Text>
            <View className="space-y-4">
              <View className="flex-row gap-3">
                <View className="bg-blue-100 rounded-full p-3">
                  <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    Easy Booking
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Schedule appointments in minutes
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="bg-green-100 rounded-full p-3">
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    Verified Doctors
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    All professionals are certified
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="bg-purple-100 rounded-full p-3">
                  <Ionicons name="checkmark-circle" size={24} color="#A855F7" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    Secure & Private
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Your data is encrypted and safe
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
