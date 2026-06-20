import { assets } from "@/assets/assets";
import { useDoctor } from "@/context/DoctorContext";
import { apiGet } from "@/utils/api";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorDashboard() {
  const router = useRouter();
  const { doctor, loading, logout } = useDoctor();
  const [appointmentsCount, setAppointmentsCount] = useState<number | null>(
    null,
  );
  const [patientsCount, setPatientsCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [cancelledCount, setCancelledCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  const { refreshKey } = useDoctor();

  useEffect(() => {
    const loadStats = async () => {
      if (!doctor) return;
      setStatsLoading(true);
      try {
        const [appointmentsRes, patientsRes] = await Promise.all([
          apiGet("/api/doctors/me/appointments", "doctorToken"),
          apiGet("/api/doctors/me/patients", "doctorToken"),
        ]);
        let appointmentsData: any = null;
        let patientsData: any = null;

        // Safely parse responses — some error pages may return HTML (starts with '<')
        try {
          const apptContentType =
            appointmentsRes.headers.get("content-type") || "";
          if (apptContentType.includes("application/json")) {
            appointmentsData = await appointmentsRes.json();
          } else {
            const txt = await appointmentsRes.text();
            console.warn(
              "Appointments response not JSON:",
              txt.substring(0, 200),
            );
          }
        } catch (e) {
          console.warn("Failed to parse appointments response", e);
        }

        try {
          const patContentType = patientsRes.headers.get("content-type") || "";
          if (patContentType.includes("application/json")) {
            patientsData = await patientsRes.json();
          } else {
            const txt = await patientsRes.text();
            console.warn("Patients response not JSON:", txt.substring(0, 200));
          }
        } catch (e) {
          console.warn("Failed to parse patients response", e);
        }

        if (appointmentsRes.ok && Array.isArray(appointmentsData)) {
          const upcoming = appointmentsData.filter((appt: any) =>
            ["pending", "confirmed"].includes(appt.status),
          ).length;
          const completed = appointmentsData.filter(
            (appt: any) => appt.status === "completed",
          ).length;
          const cancelled = appointmentsData.filter(
            (appt: any) => appt.status === "cancelled",
          ).length;
          setAppointmentsCount(upcoming);
          setCompletedCount(completed);
          setCancelledCount(cancelled);
        }
        if (patientsRes.ok && Array.isArray(patientsData)) {
          setPatientsCount(patientsData.length);
        }
      } catch (err) {
        console.warn("Failed to load doctor stats", err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [doctor, refreshKey]);

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1">
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

          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              {/* <Text className="text-xl font-semibold text-sky-100 uppercase tracking-[0.22em]">
              Doctor Dashboard
              </Text> */}
              <Text className="mt-1 text-2xl font-bold text-white">
                Welcome back, {doctor.name}
              </Text>
              <Text className="mt-3 text-sm leading-6 text-sky-100/90">
                {doctor.bio ||
                  "Write a short introduction so patients can get to know you."}
              </Text>
            </View>
            <View className="items-end">
              <TouchableOpacity
                onPress={async () => {
                  await logout();
                  router.replace("/doctor/login");
                }}
                className="mb-8 rounded-full bg-white/20 px-3 py-2 border border-white/20"
              >
                <Text className="text-sm font-semibold text-white">Logout</Text>
              </TouchableOpacity>
              <View className="h-35 w-30 rounded-3xl border border-white/20 overflow-hidden bg-slate-200">
                <Image
                  source={
                    doctor.profilePicture
                      ? { uri: doctor.profilePicture }
                      : assets.doclogo || assets.profile_pic
                  }
                  style={{ width: 110, height: 130, borderRadius: 22 }}
                />
              </View>
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
              {statsLoading
                ? "Loading..."
                : (appointmentsCount ?? doctor.upcomingAppointments ?? 0)}{" "}
              upcoming sessions
            </Text>
            <View className="mt-3 flex-row gap-3">
              <View className="bg-white/10 px-3 py-2 rounded-2xl">
                <Text className="text-sm text-white/90">Completed</Text>
                <Text className="text-lg font-bold text-white">
                  {statsLoading ? "..." : (completedCount ?? 0)}
                </Text>
              </View>
              <View className="bg-white/10 px-3 py-2 rounded-2xl">
                <Text className="text-sm text-white/90">Cancelled</Text>
                <Text className="text-lg font-bold text-white">
                  {statsLoading ? "..." : (cancelledCount ?? 0)}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-sm text-sky-100/80">
              Keep your profile updated so patients can book with confidence.
            </Text>
          </LinearGradient>
        </View>

        <View className="mb-6 space-y-4">
          <LinearGradient
            colors={["#7e7e66", "#735eb2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-between rounded-3xl p-3 shadow-md"
          >
            <View>
              <Text className="text-sm uppercase tracking-[0.2em] text-white/90">
                Appointments
              </Text>
              <Text className="mt-2 text-3xl font-bold text-white">
                {statsLoading
                  ? "..."
                  : (appointmentsCount ?? doctor.upcomingAppointments ?? 0)}
              </Text>
            </View>
            <View className="rounded-3xl bg-white/20 px-4 py-3">
              <Text className="text-base font-semibold text-white">Live</Text>
            </View>
          </LinearGradient>

          <View className="flex-row gap-4">
            <LinearGradient
              colors={["#7eb1e4", "#49ba82"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-3xl p-4 shadow-md"
            >
              <Text className="text-sm text-white/90">Patients</Text>
              <Text className="mt-3 text-2xl font-bold text-white">
                {statsLoading ? "..." : (patientsCount ?? doctor.patients ?? 0)}
              </Text>
              <Text className="mt-2 text-sm text-white/80">
                Active this month
              </Text>
            </LinearGradient>
            <LinearGradient
              colors={["#7eb1e4", "#49ba82"]}
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
          <Text className=" text-base font-semibold text-white">
            Quick actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/doctor/appointments")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#717683", "#346aac"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <Text className="text-lg font-semibold text-white">
                Manage appointments
              </Text>
              <Text className="mt-2 text-sm text-white/90">
                Review bookings, confirm consultations, and see your day plan.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/patients")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#9c3939", "#0ea5e9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <Text className="text-lg font-semibold text-white">
                Patient records
              </Text>
              <Text className="mt-2 text-sm text-white/90">
                Access patient history, messages, and appointment notes.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/working-hours")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#3b82f6", "#06b6d4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <Text className="text-lg font-semibold text-white">
                Working hours
              </Text>
              <Text className="mt-2 text-sm text-white/90">
                Manage your weekly availability and time slots.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/leaves")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#20367e", "#7b878f"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <Text className="text-lg font-semibold text-white">
                Leave planner
              </Text>
              <Text className="mt-2 text-sm text-white/90">
                Set unavailable days and vacation periods.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/earnings")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#10b981", "#14b8a6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <Text className="text-lg font-semibold text-white">Earnings</Text>
              <Text className="mt-2 text-sm text-white/90">
                Review booking income and revenue trends.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/doctor/profile")}
            className="rounded-3xl overflow-hidden shadow-md"
          >
            <LinearGradient
              colors={["#5db350", "#7a705b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-4"
            >
              <Text className="text-lg font-semibold text-white">
                Update profile
              </Text>
              <Text className="mt-2 text-sm text-white/90">
                Edit your bio, picture, speciality and clinic information.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
