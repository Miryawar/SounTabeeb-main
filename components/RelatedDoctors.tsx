import useDoctors from "@/utils/useDoctors";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const RelatedDoctors = ({ specialty, doctorId }: any) => {
  const router = useRouter();
  const { doctors, loading } = useDoctors();

  const filteredDoctors = doctors.filter(
    (doc) => doc.speciality === specialty && doc._id !== doctorId,
  );

  return (
    <View className="mt-4">
      <Text className="text-2xl font-bold text-gray-700 mb-2">
        Related Doctors
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredDoctors}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/appointment/${item._id}`)}
              className=" border border-blue-200 mr-4 px-4 py-4 rounded-lg"
            >
              <Image
                source={item.image}
                className="w-44 h-44 bg-blue-50 rounded-lg"
              />
              <Text className=" text-gray-600  text-lg font-bold text-center mt-2">
                {item.name}
              </Text>
              <Text className=" text-gray-600   font-medium text-center mt-2">
                {item.speciality}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default RelatedDoctors;
