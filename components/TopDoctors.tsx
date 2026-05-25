import useDoctors from "@/utils/useDoctors";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
export const TopDoctors = () => {
  const router = useRouter();
  const { doctors, loading } = useDoctors();
  return (
    <View className="px-6  mt-10">
      <Text className=" text-gray-600 text-3xl text-center font-bold">
        Top Doctors to Book
      </Text>
      <Text className=" text-gray-600 text-center text-lg py-5">
        Simply browse through our extensive list of trusted doctors.
      </Text>
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          doctors.slice(0, 6).map((item, index) => (
            <Pressable
              key={item._id || index}
              onPress={() => router.push(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-lg mb-4 overflow-hidden bg-white"
            >
              <Image source={item.image} className="w-full h-30 bg-blue-50" />

              <View className="p-5">
                <View className="flex-row items-center gap-2 text-center">
                  <Text className="h-2 w-2 bg-green-500 rounded-full"></Text>
                  <Text className="text-green-500">Available</Text>
                </View>
                <Text className="text-gray-900 text-lg font-medium">
                  {item.name}
                </Text>
                <Text className="text-gray-600 text-sm">{item.speciality}</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
};
