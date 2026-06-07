import RelatedDoctors from "@/components/RelatedDoctors";
import useDoctors from "@/utils/useDoctors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const DoctorDetail = () => {
  const { id } = useLocalSearchParams();

  const { doctors, loading } = useDoctors();
  const doctor = doctors.find((doc) => doc._id === id?.toString());
  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#2563EB"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  if (!doctor) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Doctor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-5 mt-8">
      <View className="flex- bg-white mt-4 p-4 rounded-2xl shadow-md items-center relative">
        <Image
          source={doctor.image}
          className="w-full h-96 rounded-xl bg-blue-50"
          resizeMode="contain"
        ></Image>
        <View className="absolute top-6 left-6 bg-[#fff] p-3 rounded-full">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={"gray"}></Ionicons>
          </TouchableOpacity>
        </View>
        <View className=" flex-1 justify-center mt-4">
          <Text className="text-gray-800 text-xl font-bold mb-2">
            {doctor.name}
          </Text>

          <Text className="text-gray-600  font-medium mb-2">
            {doctor.qualification || doctor.degree}
          </Text>

          <Text className="text-gray-600  font-medium  mb-3">
            {doctor.speciality}
          </Text>
          <Text className="text-gray-600 font-medium ">
            {doctor.experience}
          </Text>

          <Text className="font-semibold flex-row items-center my-3 text-gray-800 font-bold text-lg">
            About <Text>ℹ️</Text>
          </Text>
          <Text className="text-gray-600 mb-3 leading-6">
            {doctor.bio || doctor.about || "No additional details available."}
          </Text>
          <Text className="text-gray-800 text-xl font-bold">
            Appointment fee: Rs {doctor.fees}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/book-appointment",
            params: { id },
          })
        }
        className="mt-4 border border-gray-200 bg-blue-400 px-4 py-3 rounded-full items-center justify-center"
      >
        <Text className="text-white font-bold text-lg">Book Appointment</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/chat",
            params: { doctorId: doctor._id, doctorName: doctor.name },
          })
        }
        className="mt-4 border border-gray-200 bg-green-500 px-4 py-3 rounded-full items-center justify-center"
      >
        <Text className="text-white font-bold text-lg">Chat with Doctor</Text>
      </TouchableOpacity>
      <View className="my-6">
        <RelatedDoctors doctorId={doctor._id} specialty={doctor.speciality} />

        {/* <DateSelecting></DateSelecting> */}
      </View>
    </ScrollView>
  );
};

export default DoctorDetail;
