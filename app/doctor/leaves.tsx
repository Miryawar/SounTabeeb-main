import { useDoctor } from "@/context/DoctorContext";
import { apiPut } from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDateInput = (date?: string) => {
  if (!date) return "";
  const d = new Date(date);
  const iso = d.toISOString();
  return iso.slice(0, 10);
};

export default function DoctorLeaves() {
  const router = useRouter();
  const { doctor, loading } = useDoctor();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [form, setForm] = useState({ from: "", to: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [loadingLeaves, setLoadingLeaves] = useState(true);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  useEffect(() => {
    if (doctor) {
      setLeaves(
        doctor.leaves?.map((leave: any) => ({
          ...leave,
          from: formatDateInput(leave.from),
          to: formatDateInput(leave.to),
        })) || [],
      );
      setLoadingLeaves(false);
    }
  }, [doctor]);

  const handleAddLeave = async () => {
    if (!form.from || !form.to) {
      return Alert.alert(
        "Validation",
        "Please provide both from and to dates.",
      );
    }

    const fromDate = new Date(form.from);
    const toDate = new Date(form.to);
    if (fromDate > toDate) {
      return Alert.alert(
        "Validation",
        "End date must be the same or after start date.",
      );
    }

    const newLeaves = [
      ...leaves,
      {
        from: form.from,
        to: form.to,
        reason: form.reason,
      },
    ];

    setSaving(true);
    try {
      const res = await apiPut(
        "/api/doctors/me",
        { leaves: newLeaves },
        "doctorToken",
      );
      const data = await res.json();
      if (!res.ok) {
        return Alert.alert(data.message || "Unable to save leave");
      }
      setLeaves(newLeaves);
      setForm({ from: "", to: "", reason: "" });
      Alert.alert("Saved", "Your leave has been scheduled.");
    } catch (err) {
      console.warn(err);
      Alert.alert("Unable to save leave");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLeave = async (index: number) => {
    const newLeaves = leaves.filter((_, idx) => idx !== index);
    setSaving(true);
    try {
      const res = await apiPut(
        "/api/doctors/me",
        { leaves: newLeaves },
        "doctorToken",
      );
      const data = await res.json();
      if (!res.ok) {
        return Alert.alert(data.message || "Unable to remove leave");
      }
      setLeaves(newLeaves);
    } catch (err) {
      console.warn(err);
      Alert.alert("Unable to remove leave");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !doctor || loadingLeaves) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading leave settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text className="text-3xl font-bold text-gray-900 mb-3">
            Leave Planner
          </Text>
          <Text className="text-gray-600 mb-6">
            Schedule vacation or unavailable days so patients can book around
            your time off.
          </Text>

          <View className="rounded-3xl bg-white p-4 shadow-sm space-y-4 mb-6">
            <View>
              <Text className="text-sm text-gray-500">From</Text>
              <TextInput
                value={form.from}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, from: text }))
                }
                placeholder="YYYY-MM-DD"
                className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-500">To</Text>
              <TextInput
                value={form.to}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, to: text }))
                }
                placeholder="YYYY-MM-DD"
                className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
              />
            </View>
            <View>
              <Text className="text-sm text-gray-500">Reason</Text>
              <TextInput
                value={form.reason}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, reason: text }))
                }
                placeholder="Reason for leave (optional)"
                className="border border-gray-200 rounded-2xl px-4 py-3 mt-2"
              />
            </View>
            <TouchableOpacity
              onPress={handleAddLeave}
              disabled={saving}
              className="rounded-3xl bg-blue-600 py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">
                {saving ? "Saving..." : "Add Leave"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4 mb-6">
            <Text className="text-xl font-semibold text-gray-900">
              Upcoming Leaves
            </Text>
            {leaves.length === 0 ? (
              <Text className="text-gray-600">No leave periods scheduled.</Text>
            ) : (
              leaves.map((leave, index) => (
                <View
                  key={`${leave.from}-${leave.to}-${index}`}
                  className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <Text className="text-gray-900 font-semibold">
                    {leave.from} → {leave.to}
                  </Text>
                  {leave.reason ? (
                    <Text className="text-gray-600 mt-1">{leave.reason}</Text>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => handleRemoveLeave(index)}
                    disabled={saving}
                    className="mt-4 rounded-2xl bg-red-600 py-3 items-center"
                  >
                    <Text className="text-white font-semibold">Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-3xl bg-gray-200 py-4 items-center"
          >
            <Text className="text-gray-700 font-semibold text-lg">
              Back to Dashboard
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
