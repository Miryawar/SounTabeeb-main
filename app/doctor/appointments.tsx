import { useDoctor } from "@/context/DoctorContext";
import { apiGet, apiPut } from "@/utils/api";
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

export default function DoctorAppointments() {
  const router = useRouter();
  const { doctor, loading } = useDoctor();
  const { touchRefresh } = useDoctor();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  useEffect(() => {
    if (doctor) {
      fetchAppointments();
    }
  }, [doctor]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await apiGet("/api/doctors/me/appointments", "doctorToken");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
        Alert.alert(data?.message || "Failed to load appointments");
      }
    } catch (err) {
      console.warn(err);
      setAppointments([]);
      Alert.alert("Unable to load appointments");
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await apiPut(
        `/api/appointments/${id}/status`,
        { status },
        "doctorToken",
      );
      const data = await res.json();
      if (!res.ok) {
        Alert.alert(data.message || "Unable to update status");
      } else {
        fetchAppointments();
        try {
          touchRefresh && touchRefresh();
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Unable to update appointment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const upcomingAppointments = appointments.filter((item) =>
    ["pending", "confirmed"].includes(item.status),
  );
  const pastAppointments = appointments.filter((item) =>
    ["cancelled", "completed"].includes(item.status),
  );

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-3">
          Doctor Appointments
        </Text>
        <Text className="text-gray-600 mb-6">
          Review and update your appointments.
        </Text>

        {loadingAppointments ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : upcomingAppointments.length === 0 &&
          pastAppointments.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-gray-600 text-lg">
              No appointments available.
            </Text>
          </View>
        ) : (
          <View className="space-y-6">
            {upcomingAppointments.length > 0 && (
              <View>
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Upcoming Appointments
                </Text>
                {upcomingAppointments.map((item) => {
                  const appointmentDate = item.date
                    ? new Date(item.date)
                    : null;
                  return (
                    <View
                      key={item._id}
                      className="rounded-3xl border border-gray-200 p-5 bg-white shadow-sm mb-4"
                    >
                      <Text className="text-xl font-semibold text-gray-900">
                        {item.user?.name || "Patient"}
                      </Text>
                      <Text className="text-gray-500 mt-1">
                        {item.user?.email}
                      </Text>
                      <Text className="text-gray-600 mt-2">
                        {appointmentDate
                          ? appointmentDate.toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Date not set"}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        Status: {item.status}
                      </Text>
                      <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity
                          onPress={() =>
                            handleStatusChange(item._id, "completed")
                          }
                          disabled={updatingId === item._id}
                          className="flex-1 rounded-xl bg-green-600 px-4 py-3"
                        >
                          <Text className="text-center text-white font-bold">
                            {updatingId === item._id
                              ? "Updating..."
                              : "Mark Completed"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            handleStatusChange(item._id, "cancelled")
                          }
                          disabled={updatingId === item._id}
                          className="flex-1 rounded-xl bg-red-600 px-4 py-3"
                        >
                          <Text className="text-center text-white font-bold">
                            {updatingId === item._id ? "Updating..." : "Cancel"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {pastAppointments.length > 0 && (
              <View>
                <Text className="text-xl font-semibold text-gray-800 mb-4">
                  Past Appointments
                </Text>
                {pastAppointments.map((item) => {
                  const appointmentDate = item.date
                    ? new Date(item.date)
                    : null;
                  return (
                    <View
                      key={item._id}
                      className="rounded-3xl border border-gray-200 p-5 bg-white shadow-sm mb-4"
                    >
                      <Text className="text-xl font-semibold text-gray-900">
                        {item.user?.name || "Patient"}
                      </Text>
                      <Text className="text-gray-500 mt-1">
                        {item.user?.email}
                      </Text>
                      <Text className="text-gray-600 mt-2">
                        {appointmentDate
                          ? appointmentDate.toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Date not set"}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        Status: {item.status}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
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
