import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();
  const {
    logout,
    user,
    profileImage,
    userName,
    uploadProfilePic,
    removeProfilePic,
  } = useUser();
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setUploading(true);
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const response = await uploadProfilePic(base64Image);

        if (response.ok) {
          Alert.alert("Success", "Profile picture updated successfully");
        } else {
          Alert.alert("Error", response.message || "Failed to upload picture");
        }
        setUploading(false);
      }
    } catch (error) {
      console.log("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Remove",
          onPress: async () => {
            setUploading(true);
            const response = await removeProfilePic();

            if (response.ok) {
              Alert.alert("Success", "Profile picture removed successfully");
            } else {
              Alert.alert(
                "Error",
                response.message || "Failed to remove picture",
              );
            }
            setUploading(false);
          },
          style: "destructive",
        },
      ],
    );
  };

  const isPatient = user?.role === "user";
  const hasProfileImage = !!profileImage || !!user?.profilePicture;

  return (
    <SafeAreaView style={{ padding: 16 }}>
      <View>
        <Text className=" text-gray-800 text-3xl font-bold mb-4">
          My Profile
        </Text>

        <View className="flex flex-row items-center gap-4 bg-[#fff] px-4 py-8 rounded-lg">
          {hasProfileImage && !isPatient ? (
            <Image
              source={{ uri: profileImage || user?.profilePicture }}
              className="w-32 h-32 rounded-full"
              resizeMode="contain"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="person" size={64} color="#6b7280" />
            </View>
          )}

          <View className="flex-1">
            <Text className="text-gray-700 text-2xl mb-4 font-bold">
              {user?.name || userName || "User"}
            </Text>
            <Text className="text-medium font-bold text-gray-600 mb-2">
              {user?.email || "No email"}
            </Text>
            <Text className="text-lg font-bold text-gray-600 mb-2">
              {user?.phone || "No phone"}
            </Text>

            {!isPatient && (
              <View className="mt-3 flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={pickImage}
                  disabled={uploading}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold">
                      Upload Profile Picture
                    </Text>
                  )}
                </TouchableOpacity>

                {hasProfileImage && (
                  <TouchableOpacity
                    onPress={handleRemoveProfilePicture}
                    disabled={uploading}
                    className="bg-red-500 px-4 py-2 rounded-lg"
                  >
                    {uploading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-semibold">
                        Delete Profile Picture
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
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
