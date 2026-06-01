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
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="relative rounded-[34px] bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-500 p-6 mb-6 overflow-hidden shadow-2xl">
          <View className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <View className="absolute -bottom-8 left-4 h-24 w-24 rounded-full bg-white/10" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base font-semibold text-sky-100 uppercase tracking-[0.24em]">
                Doctor Dashboard
              </Text>
              <Text className="mt-3 text-3xl font-bold text-white">
                Welcome back, {doctor.name}
              </Text>
              <Text className="mt-3 text-sm leading-6 text-sky-100/90">
                {doctor.bio ||
                  "Write a short introduction so patients can get to know you."}
              </Text>
            </View>
            <View className="h-24 w-24 rounded-3xl border border-white/20 overflow-hidden bg-slate-200">
              <Image
                source={
                  doctor.profilePicture
                    ? { uri: doctor.profilePicture }
                    : assets.doctor_icon || assets.profile_pic
                }
                style={{ width: 96, height: 96, borderRadius: 22 }}
              />
            </View>
          </View>

          <View className="mt-6 rounded-[28px] bg-white/10 p-4">
            <Text className="text-sm font-semibold text-slate-100">
              Next appointment
            </Text>
            <Text className="mt-2 text-lg font-semibold text-white">
              {doctor.upcomingAppointments ?? 0} upcoming sessions
            </Text>
            <Text className="mt-1 text-sm text-sky-100/80">
              Keep your profile updated so patients can book with confidence.
            </Text>
          </View>
        </View>

        <View className="mb-6 space-y-4">
          <View className="flex-row items-center justify-between rounded-3xl bg-white p-4 shadow-md">
            <View>
              <Text className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Appointments
              </Text>
              <Text className="mt-2 text-3xl font-bold text-slate-900">
                {doctor.upcomingAppointments ?? 0}
              </Text>
            </View>
            <View className="rounded-3xl bg-sky-600 px-4 py-3">
              <Text className="text-base font-semibold text-white">Live</Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 rounded-3xl bg-white p-4 shadow-md">
              <Text className="text-sm text-slate-500">Patients</Text>
              <Text className="mt-3 text-2xl font-bold text-slate-900">
                {doctor.patients ?? 0}
              </Text>
              <Text className="mt-2 text-sm text-slate-500">
                Active this month
              </Text>
            </View>
            <View className="flex-1 rounded-3xl bg-white p-4 shadow-md">
              <Text className="text-sm text-slate-500">Rating</Text>
              <Text className="mt-3 text-2xl font-bold text-slate-900">
                {doctor.rating ?? 0}.0
              </Text>
              <Text className="mt-2 text-sm text-slate-500">
                Patient satisfaction
              </Text>
            </View>
          </View>
        </View>

        <View className="space-y-3">
          <Text className="text-base font-semibold text-slate-900">
            Quick actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/doctor/appointments")}
            className="rounded-3xl bg-white p-5 shadow-md"
          >
            <Text className="text-lg font-semibold text-slate-900">
              Manage appointments
            </Text>
            <Text className="mt-2 text-sm text-slate-500">
              Review bookings, confirm consultations, and see your day plan.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/patients")}
            className="rounded-3xl bg-white p-5 shadow-md"
          >
            <Text className="text-lg font-semibold text-slate-900">
              Patient records
            </Text>
            <Text className="mt-2 text-sm text-slate-500">
              Access patient history, messages, and appointment notes.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/profile")}
            className="rounded-3xl bg-slate-900 p-5 shadow-md"
          >
            <Text className="text-lg font-semibold text-white">
              Update profile
            </Text>
            <Text className="mt-2 text-sm text-slate-300">
              Edit your bio, picture, speciality and clinic information.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
