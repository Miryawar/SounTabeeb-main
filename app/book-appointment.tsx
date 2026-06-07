import DateFormat from "@/components/DateFormat";
import useDoctors from "@/utils/useDoctors";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookAppointment() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { doctors, loading } = useDoctors();
  const selectedDoctor = doctors.find(
    (doc) => String(doc._id) === String(routeId),
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!selectedDoctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center px-6">
        <Text className="text-center text-gray-600 text-lg">
          Selected doctor not found. Please go back and choose a doctor again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const doctorId = String(selectedDoctor._id);

  return (
    <SafeAreaView className="flex-1">
      <View className="p-4">
        <View className="flex flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={"black"} />
          </TouchableOpacity>
          <Text className="text-gray-800 font-bold text-2xl">Book Appointment</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="border border-blue-100 bg-white rounded-lg mt-4 px-4 py-8 mb-8">
            <Text className="font-bold text-xl text-gray-800 mb-4">
              Selected Service & Doctor
            </Text>
            <View className="flex flex-row items-center gap-4">
              <Image
                source={selectedDoctor.image}
                className="w-28 h-28 rounded-full bg-blue-50"
                resizeMode="contain"
              />

              <View className="flex-1">
                <Text className="text-gray-800 text-lg font-bold">
                  {selectedDoctor.name}
                </Text>
                <Text className="text-gray-600 font-medium">
                  {selectedDoctor.speciality}
                </Text>
                <Text className="text-gray-600 font-medium">
                  {selectedDoctor.qualification || selectedDoctor.degree}
                </Text>
                <Text className="text-gray-600 font-medium">
                  Experience: {selectedDoctor.experience}
                </Text>
                <Text className="text-gray-800 font-bold mt-3">
                  Fee: Rs {selectedDoctor.fees}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/alldoctors")}
              className="mt-4 self-start"
            >
              <Text className="text-blue-600 text-lg font-bold">Change</Text>
            </TouchableOpacity>
          </View>

          <DateFormat doctorId={doctorId} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
