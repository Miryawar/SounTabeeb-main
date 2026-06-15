import { assets } from "@/assets/assets";
import useAppointments from "@/utils/useAppointments";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

export default function CompletedAppointments() {
  const { appointments, loading, error } = useAppointments();
  const completedAppointments = appointments
    .filter((item) => item.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-600">Loading completed appointments...</Text>
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

  if (!completedAppointments.length) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-xl font-bold text-gray-700 mb-2">
          No completed appointments
        </Text>
        <Text className="text-center text-gray-500">
          You do not have any completed consultations yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 pt-4">
      <View className="flex flex-row items-center justify-center gap-4 bg-green-50 p-4 mb-8 rounded-2xl">
        <Ionicons name="checkmark-done-circle" color={"green"} size={32} />
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-700">
            Your Completed Appointments
          </Text>
          <Text className="text-sm font-medium text-gray-600">
            View your past appointments and consultation details.
          </Text>
        </View>
      </View>

      {completedAppointments.map((item) => {
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
        const formattedTime = item.slot
          ? item.slot
          : appointmentDate
            ? appointmentDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--";

        return (
          <View
            key={item._id}
            className="bg-white px-4 py-6 mb-6 rounded-2xl border border-gray-100"
          >
            <View className="flex flex-row items-center gap-4">
              <Image
                source={imageSource}
                className="w-24 h-24 rounded-full bg-blue-50"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-gray-800 text-xl font-bold mb-1">
                  {doctor.name || "Doctor"}
                </Text>
                <Text className="text-gray-600 font-medium mb-1">
                  {doctor.speciality || "Speciality"}
                </Text>
                <Text className="text-gray-500">
                  {formattedDate} • {formattedTime}
                </Text>
              </View>
            </View>
            <View className="flex flex-row items-center justify-center mt-4 bg-gray-100 rounded-full w-1/2 self-end px-6 py-2 gap-2">
              <Ionicons name="checkmark-circle" size={24} color={"green"} />
              <Text className="text-green-800 text-base font-bold">
                Completed
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
