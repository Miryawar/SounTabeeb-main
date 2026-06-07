import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAppointments from "@/utils/useAppointments";
import { assets } from "@/assets/assets";

export default function CancelledAppointments() {
  const { appointments, loading, error } = useAppointments();
  const cancelledAppointments = appointments
    .filter((item) => item.status === "cancelled")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-600">Loading cancelled appointments...</Text>
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

  if (!cancelledAppointments.length) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-xl font-bold text-gray-700 mb-2">No cancelled appointments</Text>
        <Text className="text-center text-gray-500">
          You do not have any cancelled appointments.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 pt-4">
      <View className="flex flex-row items-center justify-center gap-4 bg-red-100 p-4 mb-8 rounded-2xl">
        <Ionicons name="close" color={"red"} size={32} />
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-700">Your Cancelled Appointments</Text>
          <Text className="text-sm font-medium text-gray-600">
            These appointments were cancelled by you or the doctor.
          </Text>
        </View>
      </View>

      {cancelledAppointments.map((item) => {
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
          <View key={item._id} className="bg-white rounded-2xl mb-8 px-4 py-6 border border-gray-100">
            <View className="flex flex-row items-center gap-4">
              <Image
                source={imageSource}
                className="w-24 h-24 rounded-full bg-blue-50"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-gray-800 text-xl font-bold mb-1">{doctor.name || "Doctor"}</Text>
                <Text className="text-gray-600 font-medium mb-1">{doctor.speciality || "Speciality"}</Text>
                <Text className="text-gray-500">{formattedDate} • {formattedTime}</Text>
              </View>
            </View>
            <View className="flex flex-row items-center justify-center mt-4 bg-gray-100 rounded-full self-end px-6 py-2 gap-2">
              <Ionicons name="close-circle-outline" size={24} color={"red"} />
              <Text className="text-red-600 text-base font-bold">Cancelled</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
