import { useDoctor } from "@/context/DoctorContext";
import { apiGet } from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorPatients() {
  const router = useRouter();
  const { doctor, loading } = useDoctor();
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  useEffect(() => {
    if (doctor) {
      fetchPatients();
    }
  }, [doctor]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await apiGet("/api/doctors/me/patients", "doctorToken");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPatients(data);
      } else {
        setPatients([]);
        Alert.alert(data?.message || "Unable to load patients");
      }
    } catch (err) {
      console.warn(err);
      setPatients([]);
      Alert.alert("Unable to load patients");
    } finally {
      setLoadingPatients(false);
    }
  };

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading patients...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          My Patients
        </Text>
        <Text className="text-gray-600 mb-6">
          Active patient list from your appointments.
        </Text>

        {loadingPatients ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : patients.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-gray-600 text-lg">
              No patients found yet.
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {patients.map((item) => (
              <View
                key={item._id || item.id}
                className="rounded-3xl border border-gray-200 p-5 bg-white shadow-sm"
              >
                <Text className="text-xl font-semibold text-gray-900">
                  {item.name}
                </Text>
                <Text className="text-gray-500 mt-1">{item.email}</Text>
                <Text className="text-gray-600 mt-2">
                  {item.phone || "Phone not available"}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/doctor/dashboard")
          }
          className="mt-8 rounded-2xl bg-gray-200 py-3 items-center"
        >
          <Text className="text-gray-700 font-semibold">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
