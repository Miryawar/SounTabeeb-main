import { assets } from "@/assets/assets";
import { useDoctor } from "@/context/DoctorContext";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorProfile() {
  const router = useRouter();
  const { doctor, loading, logout, updateDoctorProfile } = useDoctor();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    profilePicture: "",
    speciality: "",
    qualification: "",
    experience: "",
    bio: "",
  });

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  useEffect(() => {
    if (doctor) {
      setForm({
        profilePicture: doctor.profilePicture || "",
        speciality: doctor.speciality || "",
        qualification: doctor.qualification || "",
        experience: doctor.experience || "",
        bio: doctor.bio || "",
      });
    }
  }, [doctor]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    if (!editing) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert(
        "Permission required",
        "Please allow access to your photo library to update your profile picture.",
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const imageData = asset.base64
      ? `data:image/jpeg;base64,${asset.base64}`
      : asset.uri;

    setForm((prev) => ({ ...prev, profilePicture: imageData }));
  };

  const handleSave = async () => {
    const { ok, message } = await updateDoctorProfile(form);
    if (!ok) {
      return Alert.alert("Unable to save", message || "Please try again.");
    }
    Alert.alert("Saved", "Your profile has been updated.");
    setEditing(false);
  };

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          Doctor Profile
        </Text>
        <Text className="text-gray-600 mb-6">
          Manage your account details and clinic information.
        </Text>

        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={editing ? 0.7 : 1}
          >
            <Image
              source={
                form.profilePicture
                  ? { uri: form.profilePicture }
                  : doctor.profilePicture
                    ? { uri: doctor.profilePicture }
                    : assets.doctor_icon || assets.profile_pic
              }
              style={{ width: 140, height: 140, borderRadius: 70 }}
            />
          </TouchableOpacity>
          {editing && (
            <Text className="text-xs text-gray-500 mt-2">
              Change profile picture
            </Text>
          )}
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            {doctor.name}
          </Text>
          <Text className="text-sm text-gray-500">{doctor.email}</Text>
        </View>

        <View className="rounded-3xl bg-white p-6 shadow-sm space-y-4 mb-6">
          <View>
            <Text className="text-sm text-gray-500">About</Text>
            {editing ? (
              <TextInput
                value={form.bio}
                onChangeText={(val) => handleChange("bio", val)}
                placeholder="Write a short bio about your experience"
                multiline
                numberOfLines={4}
                className="border border-gray-200 rounded-2xl px-4 py-3 mt-2 text-start"
                style={{ minHeight: 100, textAlignVertical: "top" }}
              />
            ) : (
              <Text className="text-gray-700 mt-2 leading-7">
                {doctor.bio || "No bio added yet."}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-sm text-gray-500">Speciality</Text>
            {editing ? (
              <TextInput
                value={form.speciality}
                onChangeText={(val) => handleChange("speciality", val)}
                placeholder="e.g., Cardiology"
                className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
              />
            ) : (
              <Text className="text-gray-700 mt-2">
                {doctor.speciality || "Not set"}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-sm text-gray-500">Qualification</Text>
            {editing ? (
              <TextInput
                value={form.qualification}
                onChangeText={(val) => handleChange("qualification", val)}
                placeholder="e.g., MBBS, MD"
                className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
              />
            ) : (
              <Text className="text-gray-700 mt-2">
                {doctor.qualification || "Not set"}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-sm text-gray-500">Experience</Text>
            {editing ? (
              <TextInput
                value={form.experience}
                onChangeText={(val) => handleChange("experience", val)}
                placeholder="e.g., 10 years"
                className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
              />
            ) : (
              <Text className="text-gray-700 mt-2">
                {doctor.experience || "Not set"}
              </Text>
            )}
          </View>
        </View>

        <View className="space-y-4">
          {editing ? (
            <>
              <TouchableOpacity
                onPress={handleSave}
                className="rounded-3xl bg-blue-600 py-4 items-center"
              >
                <Text className="text-white font-semibold text-lg">
                  Save Changes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditing(false)}
                className="rounded-3xl bg-gray-100 py-4 items-center"
              >
                <Text className="text-gray-700 font-semibold text-lg">
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setEditing(true)}
              className="rounded-3xl bg-blue-600 py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">
                Edit Profile
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace("/");
            }}
            className="rounded-3xl bg-red-600 py-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
