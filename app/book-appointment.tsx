import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { } from "react-native";
import { doctors } from "@/assets/assets";
import DateFormat from "@/components/DateFormat";
export default function BookAppointment() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const selectedDoctor = doctors.find((doc) => doc._id.toString() === id);
  return (
    <SafeAreaView className="flex-1">
      <View className="p-4">
        <View className="flex flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={"black"}></Ionicons>
          </TouchableOpacity>
          <Text className="text-gray-800 font-bold text-2xl">
            Book Appointment
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="border border-blue-100 bg-[#fff] rounded-lg mt-4 bg-gray- px-4 py-8 mb-8">
            <Text className="font-bold text-xl text-gray-800">
              Selected Service & Doctor
            </Text>
            <View className="flex flex-row items-center">
              <View className="flex-1 flex-row items-center">
                <Image
                  source={selectedDoctor?.image}
                  className="w-28 h-28 rounded-full bg-blue-50"
                  resizeMode="contain"
                ></Image>

                <View className="ml-2 ">
                  <Text className="text-gray-600 text-lg font-bold">
                    {selectedDoctor?.name}
                  </Text>
                  <Text className="text-gray-600 font-medium">
                    {selectedDoctor?.speciality}
                  </Text>
                  <Text className="text-gray-600  font-medium">
                    Experience:{selectedDoctor?.experience}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => router.push("/alldoctors")}>
                <Text className="text-blue-600 text-lg font-bold">Change</Text>
              </TouchableOpacity>
            </View>
          </View>
          <DateFormat doctorId={selectedDoctor?._id}></DateFormat>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
