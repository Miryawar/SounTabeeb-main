import { View, Text, FlatList,Pressable, Image, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { doctors, specialityData } from "@/assets/assets";

import Footer from "@/components/Footer";

export default function DoctorsByCategory() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
    const decodedCategory = decodeURIComponent(String(category));

  // 🔥 selected category state
  const [selectedCategory, setSelectedCategory] = useState(decodedCategory);
  const [showFilter, setShowFilter] = useState(false);

  // 🔥 FILTER
  const filteredDoctors = doctors.filter((doc) =>
      doc.speciality.toLowerCase().trim() === selectedCategory.toLowerCase().trim());

  return (
    <View className="flex-1 mt-16 px-6">

        <View className="flex flex-row gap-3  justify-between items-center mb-4">
          <TouchableOpacity onPress={()=>router.back()} className="bg-white p-2 items-center rounded-full">
          <Ionicons name="arrow-back" size={28} color={"gray"}></Ionicons>
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
              <Text className="text-gray-700">
                {item.speciality}
              </Text>
            </Pressable>
          ))}

        </View>
      )}

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/appointment/${item._id}`)}
            className="border rounded-lg border-blue-200 m-4 "
          >

            
            <Image
              source={item.image} className="bg-blue-50 w-full h-96" resizeMode="contain"  />

              <View className="p-5">
              <View className="flex flex-row items-center gap-2">
                <View className="bg-green-500 w-3 h-3 rounded-full"></View>
                <Text className="text-green-600">Available</Text>
            </View>

            <Text className="text-gray-600 text-xl font-bold" >
              {item.name}
            </Text>


            <Text className="text-gray-600 text-lg">{item.speciality}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    
    </View>
  );
}