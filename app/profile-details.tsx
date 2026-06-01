import { assets } from "@/assets/assets";
import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileDetails() {
  const router = useRouter();
  const { user, profileImage, userName, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    dob: "",
    gender: "",
    state: "",
    city: "",
    district: "",
    pincode: "",
    address: "",
    contact: "",
  });

  useEffect(() => {
    setForm({
      dob: user?.dob || "",
      gender: user?.gender || "",
      state: user?.state || "",
      city: user?.city || "",
      district: user?.district || "",
      pincode: user?.pincode || "",
      address: user?.address || "",
      contact: user?.phone || user?.phonenumber || "",
    });
  }, [user]);

  const missingFields = [
    "dob",
    "gender",
    "state",
    "city",
    "district",
    "pincode",
    "address",
  ].filter((key) => !form[key as keyof typeof form]);

  const handleSave = async () => {
    const payload = {
      dob: form.dob,
      gender: form.gender,
      state: form.state,
      city: form.city,
      district: form.district,
      pincode: form.pincode,
      address: form.address,
      phone: form.contact,
    };

    console.log("PROFILE SAVE - Sending payload:", payload);

    const { ok, message } = await updateUserProfile(payload);

    console.log("PROFILE SAVE - Response:", { ok, message });

    if (!ok) {
      return Alert.alert("Update failed", message || "Could not save profile");
    }

    Alert.alert("Profile updated", "Your profile details were saved.");
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        >
          <View className="flex flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="gray" />
            </TouchableOpacity>
            <Text className="text-gray-800 text-2xl font-bold">
              Profile Details
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View className="items-center mb-6">
            <Image
              source={profileImage ? { uri: profileImage } : assets.profile_pic}
              className="w-40 h-40 rounded-full"
            />
            <Text className="text-2xl font-bold text-gray-800 mt-4">
              {userName || user?.name || "User"}
            </Text>
            <Text className="text-gray-600 text-base mt-1">
              {user?.email || "No email"}
            </Text>
          </View>

          <View className="bg-white rounded-3xl px-5 py-5 shadow-sm mb-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xl font-bold text-gray-800">
                  Personal Information
                </Text>
                {missingFields.length > 0 ? (
                  <Text className="text-sm text-orange-600 mt-1">
                    {missingFields.length} field(s) are missing.
                  </Text>
                ) : (
                  <Text className="text-sm text-gray-500 mt-1">
                    All fields are filled.
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                className="bg-blue-50 px-3 py-2 rounded-full"
              >
                <Text className="text-blue-600 font-semibold">
                  {isEditing
                    ? "Cancel"
                    : missingFields.length > 0
                      ? "Complete"
                      : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-600 mb-2">Date of Birth</Text>
                  <TextInput
                    placeholder="DD/MM/YYYY"
                    value={form.dob}
                    onChangeText={(value) => setForm({ ...form, dob: value })}
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <View>
                  <Text className="text-gray-600 mb-2">Gender</Text>
                  <TextInput
                    placeholder="Male / Female / Other"
                    value={form.gender}
                    onChangeText={(value) =>
                      setForm({ ...form, gender: value })
                    }
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <View>
                  <Text className="text-gray-600 mb-2">State</Text>
                  <TextInput
                    placeholder="Enter state"
                    value={form.state}
                    onChangeText={(value) => setForm({ ...form, state: value })}
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <View>
                  <Text className="text-gray-600 mb-2">City</Text>
                  <TextInput
                    placeholder="Enter city"
                    value={form.city}
                    onChangeText={(value) => setForm({ ...form, city: value })}
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <View>
                  <Text className="text-gray-600 mb-2">District</Text>
                  <TextInput
                    placeholder="Enter district"
                    value={form.district}
                    onChangeText={(value) =>
                      setForm({ ...form, district: value })
                    }
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <View>
                  <Text className="text-gray-600 mb-2">Pincode</Text>
                  <TextInput
                    placeholder="Enter pincode"
                    value={form.pincode}
                    onChangeText={(value) =>
                      setForm({ ...form, pincode: value })
                    }
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <View>
                  <Text className="text-gray-600 mb-2">Address</Text>
                  <TextInput
                    placeholder="Enter full address"
                    value={form.address}
                    onChangeText={(value) =>
                      setForm({ ...form, address: value })
                    }
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <View>
                  <Text className="text-gray-600 mb-2">Phone</Text>
                  <TextInput
                    placeholder="Enter phone number"
                    value={form.contact}
                    onChangeText={(value) =>
                      setForm({ ...form, contact: value })
                    }
                    keyboardType="phone-pad"
                    className="border border-gray-300 rounded-xl px-4 py-3"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-blue-600 rounded-xl px-4 py-4 items-center"
                >
                  <Text className="text-white text-lg font-semibold">
                    Save Profile
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-4">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Date of Birth</Text>
                  <Text className="text-gray-800">{form.dob || "Not set"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Gender</Text>
                  <Text className="text-gray-800">
                    {form.gender || "Not set"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">State</Text>
                  <Text className="text-gray-800">
                    {form.state || "Not set"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">City</Text>
                  <Text className="text-gray-800">
                    {form.city || "Not set"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">District</Text>
                  <Text className="text-gray-800">
                    {form.district || "Not set"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Pincode</Text>
                  <Text className="text-gray-800">
                    {form.pincode || "Not set"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Address</Text>
                  <Text className="text-gray-800 text-right">
                    {form.address || "Not set"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Phone</Text>
                  <Text className="text-gray-800">
                    {form.contact || "Not set"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
