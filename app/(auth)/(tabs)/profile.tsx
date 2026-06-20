import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();
  const { logout, user, profileImage, userName } = useUser();
  const isPatient = user?.role === "user";
  const hasProfileImage = !!profileImage || !!user?.profilePicture;

  return (
    // 1. ADDED flex: 1 SO IT TAKES FULL HEIGHT
    <SafeAreaView style={{ flex: 1 }}>
      {/* 2. MOVED PADDING HERE AND ADDED paddingBottom */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
            </View>
          </View>
        </View>

        {/* 3. REMOVED THE NESTED SCROLLVIEW HERE */}
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

          <TouchableOpacity
            onPress={() => router.push("/appointment-history")}
            className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4"
          >
            <Text className="text-lg font-medium text-gray-600">
              Appointment History
            </Text>
            <Ionicons
              name="chevron-forward-sharp"
              size={24}
              color={"gray"}
            ></Ionicons>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/transaction-history")}
            className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4"
          >
            <Text className="text-lg font-medium text-gray-600">
              Transaction History
            </Text>
            <Ionicons
              name="chevron-forward-sharp"
              size={24}
              color={"gray"}
            ></Ionicons>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/medical-records")}
            className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4"
          >
            <Text className="text-lg font-medium text-gray-600">
              Medical Records
            </Text>
            <Ionicons
              name="chevron-forward-sharp"
              size={24}
              color={"gray"}
            ></Ionicons>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/notification-center")}
            className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4"
          >
            <Text className="text-lg font-medium text-gray-600">
              Notification Center
            </Text>
            <View className="flex flex-row items-center gap-2">
              {user?.notifications?.filter((n: any) => !n.read).length > 0 && (
                <View className="bg-red-500 rounded-full px-3 py-1">
                  <Text className="text-white text-sm font-bold">
                    {user.notifications.filter((n: any) => !n.read).length}
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward-sharp"
                size={24}
                color={"gray"}
              ></Ionicons>
            </View>
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
      {/* 4. FIXED THE CLOSING TAGS */}
      </ScrollView>
    </SafeAreaView>
  );
}