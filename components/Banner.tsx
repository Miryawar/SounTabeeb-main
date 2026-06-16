import { assets, specialityData } from "@/assets/assets";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
export default function Banner() {
  const router = useRouter();
  return (
    <View className="px-4 mt-4">
      <LinearGradient
        colors={["#F4F7FF", "#EEF4FF", "#E8F0FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-3xl overflow-hidden"
      >
        <View className="px-4 pb-8">
          <Image
            source={assets.header_img}
            className="w-full h-96"
            resizeMode="contain"
          />

          <View>
            <Text className="text-gray-800 text-3xl font-bold pb-2 ">
              Quality Care,
            </Text>

            <Text className="text-blue-700 text-3xl font-bold pb-3">
              Right When You Need It
            </Text>

            <Text className="text-gray-600 text-lg leading-6">
              Book appointments with trusted doctors and specialists.
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/doctors/${encodeURIComponent(specialityData[0].speciality)}`,
                )
              }
              className="bg-blue-700 p-4 flex-row items-center  justify-center rounded-2xl mt-6 gap-4 self-center"
            >
              <Text className="text-white text-lg font-medium">
                Book Appointment
              </Text>

              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
