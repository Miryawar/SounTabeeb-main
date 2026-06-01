import { assets } from "@/assets/assets";
import { useDoctor } from "@/context/DoctorContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorProfile() {
  const router = useRouter();
  const { doctor, loading, logout } = useDoctor();

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          Doctor Profile
        </Text>
        <Text className="text-gray-600 mb-6">
          Manage your account details and clinic information.
        </Text>

        <View className="items-center mb-6">
          <Image
            source={
              doctor.profilePicture
                ? { uri: doctor.profilePicture }
                : assets.doctor_icon || assets.profile_pic
            }
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
        </View>

        <View className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <View>
            <Text className="text-sm text-gray-500">Name</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {doctor.name}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Email</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {doctor.email}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Speciality</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {doctor.speciality}
            </Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Experience</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {doctor.experience}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={async () => {
            await logout();
            router.replace("/doctor/login");
          }}
          className="mt-8 rounded-3xl bg-red-600 py-4 items-center"
        >
          <Text className="text-white font-semibold text-lg">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
