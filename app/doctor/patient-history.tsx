import { useDoctor } from "@/context/DoctorContext";
import { apiGet } from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorPatientHistory() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { doctor, loading } = useDoctor();
  const [history, setHistory] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  useEffect(() => {
    if (doctor && params.patientId) {
      fetchHistory(params.patientId as string);
    }
  }, [doctor, params.patientId]);

  const fetchHistory = async (patientId: string) => {
    setLoadingHistory(true);
    try {
      const res = await apiGet(
        `/api/doctors/me/patients/${patientId}/history`,
        "doctorToken",
      );
      const data = await res.json();
      if (res.ok) {
        setPatient(data.patient);
        setHistory(data.history || []);
      } else {
        console.warn("Failed to load patient history", data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading patient history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          Patient History
        </Text>
        <Text className="text-gray-600 mb-6">
          Review past appointments and visit details for this patient.
        </Text>

        {loadingHistory ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : patient ? (
          <View className="space-y-5">
            <View className="rounded-3xl bg-white p-6 shadow-sm">
              <Text className="text-xl font-semibold text-gray-900">
                {patient.name}
              </Text>
              <Text className="text-gray-600 mt-1">{patient.email}</Text>
              <Text className="text-gray-600 mt-1">
                {patient.phone || "Phone not available"}
              </Text>
            </View>

            <View className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
              <Text className="text-lg font-semibold text-gray-900">
                Appointment Timeline
              </Text>
              {history.length === 0 ? (
                <Text className="text-gray-600">
                  No appointment history found.
                </Text>
              ) : (
                history.map((appt) => {
                  const appointmentDate = appt.date
                    ? new Date(appt.date)
                    : null;
                  return (
                    <View
                      key={appt._id}
                      className="rounded-3xl border border-gray-200 p-4"
                    >
                      <Text className="font-semibold text-gray-900">
                        {appointmentDate
                          ? appointmentDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Unknown date"}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        {appt.slot || "Slot unknown"}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        Status: {appt.status}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        Fee: ₹{Number(appt.payment?.amount || 0).toFixed(2)}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        ) : (
          <Text className="text-gray-600">Unable to load patient details.</Text>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 rounded-3xl bg-gray-200 py-4 items-center"
        >
          <Text className="text-gray-700 font-semibold text-lg">Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
