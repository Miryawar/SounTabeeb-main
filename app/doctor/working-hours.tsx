import { useDoctor } from "@/context/DoctorContext";
import { apiGet, apiPut } from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const defaultWorkingHours = [
  { day: "Sunday", start: "09:00", end: "17:00", active: false },
  { day: "Monday", start: "09:00", end: "17:00", active: true },
  { day: "Tuesday", start: "09:00", end: "17:00", active: true },
  { day: "Wednesday", start: "09:00", end: "17:00", active: true },
  { day: "Thursday", start: "09:00", end: "17:00", active: true },
  { day: "Friday", start: "09:00", end: "17:00", active: true },
  { day: "Saturday", start: "09:00", end: "13:00", active: false },
];

export default function DoctorWorkingHours() {
  const router = useRouter();
  const { doctor, loading } = useDoctor();
  const [workingHours, setWorkingHours] = useState<any[]>(defaultWorkingHours);
  const [saving, setSaving] = useState(false);
  const [loadingHours, setLoadingHours] = useState(true);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  useEffect(() => {
    if (doctor) {
      setWorkingHours(
        doctor.workingHours && doctor.workingHours.length > 0
          ? doctor.workingHours.map((item: any) => ({
              day: item.day,
              start: item.start || "09:00",
              end: item.end || "17:00",
              active: item.active ?? false,
            }))
          : defaultWorkingHours,
      );
      setLoadingHours(false);
    }
  }, [doctor]);

  const handleToggleActive = (index: number) => {
    setWorkingHours((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, active: !item.active } : item,
      ),
    );
  };

  const handleChangeHour = (index: number, field: string, value: string) => {
    setWorkingHours((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiPut(
        "/api/doctors/me",
        { workingHours },
        "doctorToken",
      );
      const data = await res.json();
      if (!res.ok) {
        return Alert.alert(data.message || "Unable to save working hours");
      }
      Alert.alert("Saved", "Your schedule has been updated.");
      router.back();
    } catch (err) {
      console.warn(err);
      Alert.alert("Unable to save working hours");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !doctor || loadingHours) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text className="text-3xl font-bold text-gray-900 mb-3">
            Working Hours
          </Text>
          <Text className="text-gray-600 mb-6">
            Set your availability for each day of the week.
          </Text>

          <View className="space-y-4 mb-6">
            {workingHours.map((item, index) => (
              <View
                key={item.day}
                className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-xl font-semibold text-gray-900">
                    {item.day}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleToggleActive(index)}
                    className={`rounded-full px-3 py-1 ${
                      item.active ? "bg-green-600" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        item.active ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {item.active ? "Active" : "Off"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500">Start time</Text>
                    <TextInput
                      value={item.start}
                      onChangeText={(text) =>
                        handleChangeHour(index, "start", text)
                      }
                      placeholder="09:00"
                      className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500">End time</Text>
                    <TextInput
                      value={item.end}
                      onChangeText={(text) =>
                        handleChangeHour(index, "end", text)
                      }
                      placeholder="17:00"
                      className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className="space-y-4">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="rounded-3xl bg-blue-600 py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">
                {saving ? "Saving..." : "Save Schedule"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-3xl bg-gray-200 py-4 items-center"
            >
              <Text className="text-gray-700 font-semibold text-lg">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
