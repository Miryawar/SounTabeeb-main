import { assets } from "@/assets/assets";
import { apiPost } from "@/utils/api";
import useAppointments from "@/utils/useAppointments";
import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

export default function UpComingAppointments() {
  const { appointments, loading, error, refresh } = useAppointments();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const pendingAppointments = appointments
    .filter((item) => item.status === "pending" || item.status === "confirmed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleCancel = async (appointmentId: string) => {
    setCancelingId(appointmentId);
    try {
      const res = await apiPost(
        `/api/appointments/${appointmentId}/cancel`,
        {},
      );
      const data = await res.json();
      if (!res.ok) {
        Alert.alert(data.message || "Unable to cancel appointment");
        return;
      }
      Alert.alert("Appointment cancelled");
      refresh();
    } catch (err) {
      Alert.alert("Unable to cancel appointment");
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-600">Loading appointments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  if (!pendingAppointments.length) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-xl font-bold text-gray-700 mb-2">
          No upcoming appointments
        </Text>
        <Text className="text-center text-gray-500">
          You do not have any upcoming booked appointments right now.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-xl font-bold text-gray-700 mb-4">
        Upcoming Appointments
      </Text>
      {pendingAppointments.map((item) => {
        const doctor = item.doctor || {};
        const imageSource = doctor.profilePicture
          ? { uri: doctor.profilePicture }
          : assets.doclogo;
        const appointmentDate = item.date ? new Date(item.date) : null;
        const formattedDate = appointmentDate
          ? appointmentDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "--";
        const formattedTime = appointmentDate
          ? appointmentDate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--";

        return (
          <View
            key={item._id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
          >
            <View className="flex flex-row items-center gap-4">
              <Image
                source={imageSource}
                className="w-24 h-24 rounded-full bg-blue-50"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-700">
                  {doctor.name || "Doctor"}
                </Text>
                <Text className="text-lg font-medium text-gray-500">
                  {doctor.speciality || "Speciality"}
                </Text>
                <Text className="text-gray-500 mt-1">
                  {formattedDate} • {formattedTime}
                </Text>
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleCancel(item._id)}
                disabled={cancelingId === item._id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3"
              >
                <Text className="text-center text-white font-bold">
                  {cancelingId === item._id ? "Cancelling..." : "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}
