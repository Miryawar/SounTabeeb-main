import { useDoctor } from "@/context/DoctorContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const appointments = [
  {
    id: "1",
    patient: "Sara Ali",
    time: "09:00 AM",
    date: "2026-06-03",
    service: "General Checkup",
  },
  {
    id: "2",
    patient: "Zain Khan",
    time: "10:30 AM",
    date: "2026-06-03",
    service: "Cardiology Consultation",
  },
  {
    id: "3",
    patient: "Mina Hassan",
    time: "12:00 PM",
    date: "2026-06-03",
    service: "Follow-up",
  },
];

export default function DoctorAppointments() {
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
        <Text className="text-gray-600">Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          Doctor Appointments
        </Text>
        <Text className="text-gray-600 mb-6">
          Review your upcoming appointments for the week.
        </Text>

        <View className="space-y-5">
          {appointments.map((item) => (
            <View
              key={item.id}
              className="rounded-3xl border border-gray-200 p-5 bg-white shadow-sm"
            >
              <Text className="text-xl font-semibold text-gray-900">
                {item.patient}
              </Text>
              <Text className="text-gray-500 mt-1">{item.service}</Text>
              <Text className="text-gray-600 mt-2">
                {item.date} • {item.time}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/doctor/dashboard");
            }
          }}
          className="mt-8 rounded-2xl bg-gray-200 py-3 items-center"
        >
          <Text className="text-gray-700 font-semibold">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
