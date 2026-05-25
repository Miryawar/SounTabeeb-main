import SearchBar from "@/components/SearchBar";
import useDoctors from "@/utils/useDoctors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AllDoctors() {
  const router = useRouter();
  const { doctors, loading } = useDoctors();
  return (
    <SafeAreaView className="flex-1 ">
      <ScrollView className="px-4">
        <View className="flex flex-row items-center gap-8">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={"gray"}></Ionicons>
          </TouchableOpacity>
          <Text className="text-gray-800 font-bold text-2xl">All Doctors</Text>
        </View>
        <SearchBar></SearchBar>
        <View className="mt-6">
          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" />
          ) : (
            doctors.map((item, index) => (
              <View
                key={item._id || index}
                className="bg-[#fff] border border-blue-100 rounded-lg mb-4"
              >
                <View className=" flex flex-row items-center py-8 gap-4 px-4">
                  <Image
                    source={item.image}
                    className="w-32 h-32 bg-blue-50 rounded-full"
                  ></Image>
                  <View>
                    <Text className="text-xl font-bold text-gray-800">
                      {item.name}
                    </Text>
                    <Text className="text-lg font-medium text-gray-600">
                      {item.experience}
                    </Text>
                    <Text className="text-lg font-medium text-gray-600">
                      {item.speciality}
                    </Text>
                  </View>
                </View>
                <View className="flex flex-row items-center justify-center gap-8 mb-4">
                  <Text className="text-lg text-gray-800 bg-gray-200 px-2 py-3 rounded-xl font-semibold">
                    {item.speciality}
                  </Text>
                  <TouchableOpacity
                    className="bg-gray-100 border border-blue-200 px-3 py-2 rounded-xl"
                    onPress={() => router.push(`/appointment/${item._id}`)}
                  >
                    <Text className="text-lg font-bold text-center text-blue-500">
                      Book Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
