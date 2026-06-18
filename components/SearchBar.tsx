import useDoctors from "@/utils/useDoctors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SearchBar() {
  const router = useRouter();
  const { doctors, loading } = useDoctors();
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [searchType, setSearchType] = useState("name");

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((item) => {
        if (!search.trim()) return false;
        const value = search.toLowerCase();
        if (searchType === "name") {
          return item.name?.toLowerCase().includes(value);
        }
        if (searchType === "specialty") {
          return item.speciality?.toLowerCase().includes(value);
        }
        return false;
      }),
    [doctors, search, searchType],
  );

  return (
    <View>
      <View className="flex flex-row justify-between items-center px-4 py-3 bg-white rounded-full shadow mt-6 mx-4">
        <Ionicons name="search" size={24} color="#2563EB" />
        <TextInput
          placeholder={`Search by ${searchType}`}
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-3"
        />
        <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
          <Ionicons name="options" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {showOptions && (
        <View className="bg-white mx-4 mt-2 rounded-2xl p-4 shadow">
          <TouchableOpacity
            onPress={() => {
              setSearchType("name");
              setShowOptions(false);
            }}
            className="py-2"
          >
            <Text className="text-lg">Search by Name</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSearchType("specialty");
              setShowOptions(false);
            }}
            className="py-2"
          >
            <Text className="text-lg">Search by Specialty</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}

      {search.trim() !== "" && !loading && (
        <View className="px-4 mt-4">
          {filteredDoctors.length === 0 ? (
            <Text className="text-center text-gray-500 py-8">
              No doctors found for {`"${search}"`}.
            </Text>
          ) : (
            filteredDoctors.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => router.push(`/appointment/${item._id}`)}
                className="flex-row items-center gap-4 bg-gray-100 p-4 mb-3 rounded-2xl"
              >
                <Image
                  source={
                    item.image?.uri ? { uri: item.image.uri } : item.image
                  }
                  className="w-20 h-20 rounded-full bg-blue-50"
                  resizeMode="contain"
                />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">
                    {item.name}
                  </Text>
                  <Text className="text-gray-500">{item.speciality}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}
