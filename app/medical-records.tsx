import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MedicalRecords() {
  const router = useRouter();
  const { user } = useUser();
  const medicalRecords = user?.medicalRecords || [];

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View className="flex flex-row items-center justify-between mb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="gray" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">
          Medical Records
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Text className="text-gray-600 mb-5">
        View your saved health records and doctor notes.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {medicalRecords.length === 0 ? (
          <View className="items-center py-20 px-6">
            <Text className="text-xl font-bold text-gray-700 mb-2">
              No medical records yet
            </Text>
            <Text className="text-center text-gray-500">
              Your past summaries and consultations will appear here.
            </Text>
          </View>
        ) : (
          medicalRecords.map((record: any) => {
            const recordDate = record.date ? new Date(record.date) : null;
            const formattedDate = recordDate
              ? recordDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Unknown date";
            return (
              <View
                key={record._id || `${record.title}-${record.date}`}
                className="bg-white rounded-3xl border border-gray-100 p-4 mb-4 shadow-sm"
              >
                <Text className="text-lg font-bold text-gray-800 mb-1">
                  {record.title || "Medical Record"}
                </Text>
                <Text className="text-sm text-gray-500 mb-2">
                  {formattedDate}
                </Text>
                <Text className="text-gray-700 mb-3">
                  {record.description || "No description provided."}
                </Text>
                <Text className="text-gray-600 font-semibold">
                  Doctor: {record.doctor || "Not specified"}
                </Text>
                <Text className="text-gray-600 mt-2">
                  Notes: {record.notes || "No notes available."}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
