import { assets } from "@/assets/assets";
import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
export default function DropdownMenu() {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const router = useRouter();
  const { profileImage, user } = useUser();
  const showDefaultPerson = user?.role === "user";
  return (
    <ScrollView className="flex-1 px-4">
      <TouchableOpacity onPress={() => setShowDropdownMenu(!showDropdownMenu)}>
        {showDefaultPerson ? (
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={28} color="gray" />
          </View>
        ) : (
          <Image
            source={profileImage ? { uri: profileImage } : assets.profile_pic}
            className="w-16 h-16  rounded-full"
          ></Image>
        )}
      </TouchableOpacity>

      {showDropdownMenu && (
        <View className="border border-gray-300 bg-white  rounded-lg  px-4 py-2 mt-2">
          <TouchableOpacity
            onPress={() => router.push("/appointment")}
            className="flex flex-row   items-center justify-between py-2"
          >
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="calendar-outline"
                size={24}
                color="gray"
              ></Ionicons>
              <Text className="text-gray-600 text-lg font-medium">
                {" "}
                My Appointments
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={"gray"}></Ionicons>
          </TouchableOpacity>
          <View className="border-b border-gray-100 my-1" />

          <TouchableOpacity
            onPress={() => router.push("/alldoctors")}
            className="flex flex-row   items-center justify-between py-2"
          >
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="calendar-outline"
                size={24}
                color="gray"
              ></Ionicons>
              <Text className="text-gray-600 text-lg font-medium">
                All Doctors
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={"gray"}></Ionicons>
          </TouchableOpacity>
          <View className="border-b border-gray-100 my-1"></View>

          <TouchableOpacity
            onPress={() => router.push("/profile-details")}
            className="flex flex-row items-center justify-between py-2"
          >
            <View className="flex flex-row items-center gap-3 ">
              <Ionicons name="person-outline" size={24} color="gray"></Ionicons>
              <Text className="text-gray-600 text-lg font-medium">
                My Profile
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={"gray"}></Ionicons>
          </TouchableOpacity>

          <View className="border-b border-gray-100 my-1"></View>
          <TouchableOpacity
            onPress={() => router.push("/about")}
            className="flex flex-row items-center justify-between py-2"
          >
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={"gray"}
              ></Ionicons>
              <Text className="text-gray-600 text-lg font-medium">
                About Us
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={24} color={"gray"}></Ionicons>
          </TouchableOpacity>
          <View className="border-b border-gray-100 my-1"></View>

          <TouchableOpacity
            onPress={() => router.push("/contact")}
            className="flex flex-row   items-center justify-between py-2"
          >
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="help-circle-outline"
                size={24}
                color="gray"
              ></Ionicons>
              <Text className="text-gray-600 font-medium  text-lg">
                Help & support
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={"gray"}></Ionicons>
          </TouchableOpacity>
          <View className="border-b border-gray-100 my-1"></View>

          <TouchableOpacity
            onPress={() => router.replace("/(auth)/sign-in")}
            className="flex flex-row items-center justify-between py-1"
          >
            <View className="flex flex-row items-center gap-3 ">
              <Ionicons name="log-out-outline" size={28} color="red"></Ionicons>
              <Text className="text-red-600 text-lg font-medium">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
