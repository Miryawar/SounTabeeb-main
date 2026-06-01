import { useDoctor } from "@/context/DoctorContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const patients = [
  { id: "1", name: "Umar Ahmed", age: 32, condition: "Hypertension" },
  { id: "2", name: "Ayesha Fatima", age: 28, condition: "Asthma" },
  { id: "3", name: "Omar Saleem", age: 45, condition: "Diabetes" },
];

export default function DoctorPatients() {
  const router = useRouter();
  const { doctor, loading } = useDoctor();

  useEffect(() => {
    if (!loading && !doctor) {
      router.replace("/doctor/login");
    }
  }, [doctor, loading, router]);

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
          Active patient list with recent conditions.
        </Text>

        <View className="space-y-4">
          {patients.map((item) => (
            <View
              key={item.id}
              className="rounded-3xl border border-gray-200 p-5 bg-white shadow-sm"
            >
              <Text className="text-xl font-semibold text-gray-900">
                {item.name}
              </Text>
              <Text className="text-gray-500 mt-1">Age: {item.age}</Text>
              <Text className="text-gray-600 mt-2">
                Condition: {item.condition}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/doctor/dashboard");
            }
          }}
          className="mt-8 rounded-2xl bg-gray-200 py-3 items-center"
        >
          <Text className="text-gray-700 font-semibold">Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
