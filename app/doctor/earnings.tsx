import { useDoctor } from "@/context/DoctorContext";
import { apiGet } from "@/utils/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DoctorEarnings() {
  const router = useRouter();
  const { doctor, loading } = useDoctor();
  const [earnings, setEarnings] = useState<any | null>(null);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

  useEffect(() => {
    if (doctor) {
      fetchEarnings();
    }
  }, [doctor]);

  const fetchEarnings = async () => {
    setLoadingEarnings(true);
    try {
      const res = await apiGet("/api/doctors/me/earnings", "doctorToken");
      const data = await res.json();
      if (res.ok) {
        setEarnings(data);
      } else {
        console.warn("Failed to load earnings", data);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingEarnings(false);
    }
  };

  if (loading || !doctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading earnings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-3xl font-bold text-gray-900 mb-3">Earnings</Text>
        <Text className="text-gray-600 mb-6">
          Review your confirmed and completed appointment revenue.
        </Text>

        {loadingEarnings ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : earnings ? (
          <View className="space-y-5">
            <View className="rounded-3xl bg-white p-6 shadow-sm">
              <Text className="text-sm uppercase tracking-[0.15em] text-gray-500">
                Total revenue
              </Text>
              <Text className="mt-4 text-4xl font-bold text-gray-900">
                ₹{earnings.totalRevenue.toFixed(2)}
              </Text>
              <Text className="mt-2 text-gray-600">
                Generated from {earnings.appointmentCount} bookings.
              </Text>
            </View>

            <View className="grid space-y-4">
              <View className="rounded-3xl bg-white p-6 shadow-sm">
                <Text className="text-sm text-gray-500">
                  Completed appointments
                </Text>
                <Text className="mt-3 text-3xl font-bold text-gray-900">
                  {earnings.completedCount}
                </Text>
              </View>
              <View className="rounded-3xl bg-white p-6 shadow-sm">
                <Text className="text-sm text-gray-500">
                  Confirmed appointments
                </Text>
                <Text className="mt-3 text-3xl font-bold text-gray-900">
                  {earnings.confirmedCount}
                </Text>
              </View>
            </View>

            <View className="rounded-3xl bg-white p-6 shadow-sm">
              <Text className="text-sm text-gray-500">Monthly revenue</Text>
              {earnings.monthlyRevenue.length === 0 ? (
                <Text className="mt-3 text-gray-600">No revenue data yet.</Text>
              ) : (
                earnings.monthlyRevenue.map((item: any) => (
                  <View
                    key={item.month}
                    className="mt-4 rounded-3xl border border-gray-200 p-4"
                  >
                    <Text className="text-gray-900 font-semibold">
                      {item.month}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      ₹{item.revenue.toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        ) : (
          <Text className="text-gray-600">No earnings available.</Text>
        )}

        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 rounded-3xl bg-gray-200 py-4 items-center"
        >
          <Text className="text-gray-700 font-semibold text-lg">
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
