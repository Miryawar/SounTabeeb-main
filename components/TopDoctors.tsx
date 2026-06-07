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
        ) : doctors.length === 0 ? (
          <Text className="text-center text-gray-500 py-6">
            No doctors available.
          </Text>
        ) : (
          // Render one card per available doctor so the section height matches count
          doctors.map((item, index) => (
            <Pressable
              key={item._id || index}
              onPress={() => router.push(`/appointment/${item._id}`)}
              className="border border-blue-200 rounded-lg mb-4 overflow-hidden bg-white"
            >
              <Image source={item.image} className="w-full h-30 bg-blue-50" />

              <View className="p-5">
                <View className="flex-row items-center gap-2 text-center">
                  <Text
                    className={`h-2 w-2 rounded-full ${
                      item.available ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></Text>
                  <Text
                    className={
                      item.available ? "text-green-500" : "text-gray-500"
                    }
                  >
                    {item.available ? "Available" : "Not available"}
                  </Text>
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
