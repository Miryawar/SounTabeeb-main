import { assets } from "@/assets/assets";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();
  const { logout, user, profileImage, userName } = useUser();
  return (
    <SafeAreaView style={{ padding: 16 }}>
      <View>
        <Text className=" text-gray-800 text-3xl font-bold mb-4">
          My Profile
        </Text>

        <View className="flex flex-row items-center gap-4 bg-[#fff] px-4 py-8 rounded-;">
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : user?.profilePicture
                  ? { uri: user.profilePicture }
                  : assets.profile_pic
            }
            className=" w-32 h-32 rounded-full"
            resizeMode="contain"
          />

          <View>
            {/* <Text className="text-2xl font-bold text-gray-800">{userDetail.name}</Text> */}
            <Text className="text-gray-700 text-2xl mb-4">
              {user?.name || userName || "User"}
            </Text>
            {/* <Text className="text-medium font-bold text-gray-600">{userDetail.email}</Text> */}

            <Text className="text-medium font-bold text-gray-600 mb-2">
              {user?.email || "No email"}
            </Text>

            {/* <Text className="text-lg font-bold text-gray-600">{userDetail.phone}</Text> */}
            <Text className="text-lg font-bold text-gray-600 mb-2">
              {user?.phone || "No phone"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView>
        <View className="mb-4 py-8">
          <TouchableOpacity
            onPress={() => router.push("/profile-details")}
            className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4"
          >
            <Text className="text-lg font-medium text-gray-600">
              Personal Details
            </Text>
            <Ionicons
              name="chevron-forward-sharp"
              size={24}
              color={"gray"}
            ></Ionicons>
          </TouchableOpacity>

          <Text className="text-dark text-lg font-bold mb-4">
            Support & More
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/contact")}
            className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4"
          >
            <Text className="text-lg font-medium text-gray-600">
              Contact Us
            </Text>
            <Ionicons
              name="chevron-forward-sharp"
              size={24}
              color={"gray"}
            ></Ionicons>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/about")}
            className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg"
          >
            <Text className="text-lg font-medium text-gray-600">About Us</Text>
            <Ionicons
              name="chevron-forward-sharp"
              size={24}
              color={"gray"}
            ></Ionicons>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={async () => {
          await logout();
          router.replace("/(auth)/sign-in");
        }}
        className="flex flex-row items-center gap-3 justify-center bg-red-100 px-4 py-2 rounded-lg"
      >
        <Ionicons name="log-out-outline" size={24} color={"red"}></Ionicons>
        <Text className="text-red-600 text-xl font-bold">Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
