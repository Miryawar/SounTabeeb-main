import { assets } from "@/assets/assets";
import { useDoctor } from "@/context/DoctorContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorDashboard() {
  const router = useRouter();
  const { doctor, loading } = useDoctor();

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading doctor dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Welcome</Text>
            <Text className="text-3xl font-bold text-blue-600">
              {doctor.name}
            </Text>
          </View>
          <Image
            source={assets.doctor_icon || assets.profile_pic}
            style={{ width: 80, height: 80, borderRadius: 20 }}
          />
        </View>

        <View className="rounded-3xl bg-blue-50 p-5 mb-6">
          <Text className="text-lg font-semibold text-gray-700">
            Clinic Overview
          </Text>
          <View className="flex-row justify-between mt-4">
            <View className="rounded-3xl bg-white p-4 w-1/3 shadow-sm">
              <Text className="text-2xl font-bold text-blue-600">
                {doctor.upcomingAppointments ?? 0}
              </Text>
              <Text className="text-sm text-gray-500 mt-2">Appointments</Text>
            </View>
            <View className="rounded-3xl bg-white p-4 w-1/3 shadow-sm">
              <Text className="text-2xl font-bold text-blue-600">
                {doctor.patients ?? 0}
              </Text>
              <Text className="text-sm text-gray-500 mt-2">Patients</Text>
            </View>
            <View className="rounded-3xl bg-white p-4 w-1/3 shadow-sm">
              <Text className="text-2xl font-bold text-blue-600">
                {doctor.rating ?? 0}
              </Text>
              <Text className="text-sm text-gray-500 mt-2">Rating</Text>
            </View>
          </View>
        </View>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => router.push("/doctor/appointments")}
            className="rounded-3xl bg-blue-600 p-5"
          >
            <Text className="text-white text-xl font-semibold">
              My Appointments
            </Text>
            <Text className="text-blue-100 mt-2">
              View schedule, upcoming bookings, and patient details.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/patients")}
            className="rounded-3xl bg-white border border-gray-200 p-5"
          >
            <Text className="text-gray-900 text-xl font-semibold">
              Patient List
            </Text>
            <Text className="text-gray-500 mt-2">
              Review your active patients and health notes.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/profile")}
            className="rounded-3xl bg-white border border-gray-200 p-5"
          >
            <Text className="text-gray-900 text-xl font-semibold">
              Profile Settings
            </Text>
            <Text className="text-gray-500 mt-2">
              Update your doctor profile and clinic information.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
