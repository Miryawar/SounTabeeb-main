import { View, Text, Image, TouchableOpacity } from "react-native";
import { doctors } from "@/assets/assets";
import { Ionicons } from "@expo/vector-icons";
export default function CompletedAppointments() {
  return (
    <View>
      <View className="flex flex-row items-center justify-center gap-4 bg-green-50 p-4  mb-8">
        <Ionicons name="checkmark-done-circle" color={"green"} size={32} />
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-700">
            Your Completed Appointments
          </Text>
          <Text className=" text-medium font-medium text-gray-600">
            View your past appointments and consultation details.
          </Text>
        </View>
      </View>

      {doctors.slice(3, 7).map((item, index) => (
        <View
          key={index}
          className="bg-white px-4 py-6 mb-6 rounded-lg border-gray-100"
        >
          <View className="flex flex-row items-center  gap-8">
            <Image
              source={item.image}
              className="w-32 h-32 rounded-full bg-blue-50"
              resizeMode="contain"
            ></Image>
            <View className=" w-[40%] flex-1">
              <Text className="text-gray-800 text-xl font-bold mb-1">
                {item.name}
              </Text>

              <Text className="text-gray-600  font-medium mb-1">
                {item.speciality}
              </Text>

              <View className="flex flex-row items-center gap-2">
                <Ionicons name="location-outline" size={24} color={"gray"} />
                <Text>{item.address.line1}</Text>
              </View>
            </View>
          </View>
          <View className="flex flex-row items-center justify-center mt-4 bg-gray-100 rounded-full w-1/2  self-end px-8 py-2 gap-2">
            <Ionicons name="checkmark-circle" size={32} color={"green"} />
            <Text className="text-green-800 text-xl font-bold text-center ">
              Completed
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
