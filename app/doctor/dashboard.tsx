import { assets } from "@/assets/assets";
import { useDoctor } from "@/context/DoctorContext";
import { LinearGradient } from "expo-linear-gradient";
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
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-950">
        <Text className="text-slate-100">Loading doctor dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <LinearGradient
        colors={["#0f172a", "#0f1d44", "#102a43"]}
        className="absolute inset-0"
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        className="relative"
      >
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
                    : assets.doclogo || assets.profile_pic
                }
                style={{ width: 96, height: 96, borderRadius: 22 }}
              />
            </View>
          </View>

          <LinearGradient
            colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0.08)"]}
            className="mt-6 rounded-[28px] p-4"
          >
            <Text className="text-sm font-semibold text-slate-100">
              Next appointment
            </Text>
            <Text className="mt-2 text-lg font-semibold text-white">
              {doctor.upcomingAppointments ?? 0} upcoming sessions
            </Text>
            <Text className="mt-1 text-sm text-sky-100/80">
              Keep your profile updated so patients can book with confidence.
            </Text>
          </LinearGradient>
        </View>

        <View className="mb-6 space-y-4">
          <LinearGradient
            colors={["#d946ef", "#f472b6", "#f59e0b"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-between rounded-3xl p-4 shadow-md"
          >
            <View>
              <Text className="text-sm uppercase tracking-[0.2em] text-white/90">
                Appointments
              </Text>
              <Text className="mt-2 text-3xl font-bold text-white">
                {doctor.upcomingAppointments ?? 0}
              </Text>
            </View>
            <View className="rounded-3xl bg-white/20 px-4 py-3">
              <Text className="text-base font-semibold text-white">Live</Text>
            </View>
          </LinearGradient>

          <View className="flex-row gap-4">
            <LinearGradient
              colors={["#10b981", "#06b6d4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-3xl p-4 shadow-md"
            >
              <Text className="text-sm text-white/90">Patients</Text>
              <Text className="mt-3 text-2xl font-bold text-white">
                {doctor.patients ?? 0}
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                Active this month
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-3xl p-4 shadow-md"
            >
              <Text className="text-sm text-white/90">Rating</Text>
              <Text className="mt-3 text-2xl font-bold text-white">
                {doctor.rating ?? 0}.0
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                Patient satisfaction
              </Text>
            </LinearGradient>
          </View>
        </View>

        <View className="space-y-3">
          <Text className="text-base font-semibold text-white">
            Quick actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/doctor/appointments")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#0284c7", "#0c4a6e"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <Text className="text-lg font-semibold text-white">
                Manage appointments
              </Text>
              <Text className="mt-2 text-sm text-slate-100">
                Review bookings, confirm consultations, and see your day plan.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/patients")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#c2410c", "#9a3412"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <Text className="text-lg font-semibold text-white">
                Patient records
              </Text>
              <Text className="mt-2 text-sm text-slate-100">
                Access patient history, messages, and appointment notes.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/profile")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#6d28d9", "#be185d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5"
            >
              <Text className="text-lg font-semibold text-white">
                Update profile
              </Text>
              <Text className="mt-2 text-sm text-slate-100">
                Edit your bio, picture, speciality and clinic information.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
