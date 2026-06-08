import { specialityData } from "@/assets/assets";
import useDoctors from "@/utils/useDoctors";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DoctorsByCategory() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const decodedCategory = decodeURIComponent(String(category || ""));
  const [selectedCategory, setSelectedCategory] = useState(decodedCategory);
  const [showFilter, setShowFilter] = useState(false);
  const { doctors, loading } = useDoctors();

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z]/g, "")
      .replace(/s$/, "");

  const selectedCategoryNormalized = normalize(selectedCategory);
  const hasRelatedRoot = (a: string, b: string) => {
    const minLen = Math.min(a.length, b.length, 6);
    return a.slice(0, minLen) === b.slice(0, minLen);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const speciality = doc.speciality || "";
    const specialityNormalized = normalize(speciality);
    return (
      specialityNormalized === selectedCategoryNormalized ||
      specialityNormalized.includes(selectedCategoryNormalized) ||
      selectedCategoryNormalized.includes(specialityNormalized) ||
      hasRelatedRoot(specialityNormalized, selectedCategoryNormalized)
    );
  });

  return (
    <View className="flex-1 mt-16 px-6">
      <View className="flex flex-row gap-3 justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white p-2 items-center rounded-full"
        >
          <Ionicons name="arrow-back" size={28} color="gray" />
        </TouchableOpacity>

        <Text className="text-2xl text-gray-600 font-semibold">
          {selectedCategory}
        </Text>

        <Pressable onPress={() => setShowFilter(!showFilter)}>
          <Ionicons name="filter" size={24} color="gray" />
        </Pressable>
      </View>

      {showFilter && (
        <View className="bg-white border rounded-xl p-2 mb-4 shadow-md">
          {specialityData.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedCategory(item.speciality);
                setShowFilter(false);
              }}
              className="p-3 border-b"
            >
              <Text className="text-gray-700">{item.speciality}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-600">Loading doctors...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={() => (
            <View className="py-20 items-center">
              <Text className="text-gray-600 text-lg">No doctors found.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/appointment/${item._id}`)}
              className="border rounded-lg border-blue-200 m-4"
            >
              <Image
                source={item.image}
                className="bg-blue-50 w-full h-96"
                resizeMode="contain"
              />
              <View className="p-5">
                <View className="flex flex-row items-center gap-2">
                  <View className="bg-green-500 w-3 h-3 rounded-full" />
                  <Text className="text-green-600">Available</Text>
                </View>
                <Text className="text-gray-600 text-xl font-bold">
                  {item.name}
                </Text>
                <Text className="text-gray-600 text-lg">{item.speciality}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
