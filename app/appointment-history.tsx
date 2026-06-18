import useAppointments from "@/utils/useAppointments";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppointmentHistory() {
  const router = useRouter();
  const { appointments, loading, error, refresh } = useAppointments();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sortedAppointments = appointments
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View className="flex flex-row items-center justify-between mb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="gray" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">
          Appointment History
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Text className="text-gray-600 mb-5">
        Here are your past and upcoming appointments in one place.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && (
          <View className="items-center py-20">
            <Text className="text-gray-600">Loading appointments...</Text>
          </View>
        )}

        {error && (
          <View className="items-center py-20 px-6">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        {!loading && !error && sortedAppointments.length === 0 && (
          <View className="items-center py-20 px-6">
            <Text className="text-xl font-bold text-gray-700 mb-2">
              No appointment history yet
            </Text>
            <Text className="text-center text-gray-500">
              Once you book appointments, they will appear here.
            </Text>
          </View>
        )}

        {sortedAppointments.map((item) => {
          const doctor = item.doctor || {};
          const appointmentDate = item.date ? new Date(item.date) : null;
          const formattedDate = appointmentDate
            ? appointmentDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "--";
          const formattedTime = item.slot || "--";
          const statusColor =
            item.status === "completed"
              ? "green"
              : item.status === "cancelled"
                ? "red"
                : "blue";

          return (
            <View
              key={item._id}
              className="bg-white rounded-3xl p-4 mb-4 border border-gray-100 shadow-sm"
            >
              <View className="flex flex-row items-center gap-4 mb-3">
                <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center">
                  <Ionicons name="medkit-outline" size={28} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">
                    {doctor.name || "Doctor"}
                  </Text>
                  <Text className="text-gray-500">
                    {doctor.speciality || "Speciality"}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor:
                      item.status === "completed"
                        ? "#DCFCE7"
                        : item.status === "cancelled"
                          ? "#FEE2E2"
                          : "#DBEAFE",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color:
                        item.status === "completed"
                          ? "#166534"
                          : item.status === "cancelled"
                            ? "#B91C1C"
                            : "#1D4ED8",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Date</Text>
                <Text className="text-gray-800">{formattedDate}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Time</Text>
                <Text className="text-gray-800">{formattedTime}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Booked on</Text>
                <Text className="text-gray-800">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "--"}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
