import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentStatus() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const status = Array.isArray(params.status)
    ? params.status[0]
    : params.status || "processing";
  const amount = Array.isArray(params.amount)
    ? params.amount[0]
    : params.amount;
  const doctorName = Array.isArray(params.doctorName)
    ? params.doctorName[0]
    : params.doctorName;
  const transactionRef = Array.isArray(params.transactionRef)
    ? params.transactionRef[0]
    : params.transactionRef;
  const failureReason = Array.isArray(params.failureReason)
    ? params.failureReason[0]
    : params.failureReason;

  const isSuccess = status === "success";
  const isProcessing = status === "processing";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-6 py-10">
          {isProcessing && (
            <>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-xl font-semibold text-gray-800 mt-6 text-center">
                Processing Payment
              </Text>
              <Text className="text-gray-600 mt-2 text-center">
                Please wait while we process your payment...
              </Text>
            </>
          )}

          {isSuccess && (
            <>
              <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
                <Ionicons name="checkmark-done" size={48} color="#10B981" />
              </View>

              <Text className="text-2xl font-bold text-gray-900 text-center">
                Payment Successful
              </Text>

              <Text className="text-gray-600 text-center mt-2">
                Your payment has been successfully processed.
              </Text>

              <View className="w-full bg-green-50 rounded-3xl p-6 mt-8 border border-green-200">
                <View className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-1">
                    Amount Paid
                  </Text>
                  <Text className="text-2xl font-bold text-green-600">
                    Rs {amount}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-1">
                    Doctor
                  </Text>
                  <Text className="text-gray-900">{doctorName}</Text>
                </View>

                {transactionRef && (
                  <View>
                    <Text className="text-gray-700 font-semibold mb-1">
                      Transaction ID
                    </Text>
                    <Text className="text-gray-600 text-sm font-mono">
                      {transactionRef}
                    </Text>
                  </View>
                )}
              </View>

              <View className="w-full mt-10">
                <TouchableOpacity
                  onPress={() =>
                    router.replace(
                      "/(auth)/(tabs)/appointment?returnFromPayment=true",
                    )
                  }
                  className="w-full bg-green-600 rounded-2xl px-6 py-4 items-center"
                >
                  <Text className="text-white font-bold text-lg">
                    View Appointments
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.replace("/transaction-history")}
                  className="w-full bg-green-100 rounded-2xl px-6 py-4 items-center mt-3"
                >
                  <Text className="text-green-700 font-semibold text-lg">
                    View Transaction History
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!isSuccess && !isProcessing && (
            <>
              <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-6">
                <Ionicons name="close" size={48} color="#EF4444" />
              </View>

              <Text className="text-2xl font-bold text-gray-900 text-center">
                Payment Failed
              </Text>

              <Text className="text-gray-600 text-center mt-2">
                Unfortunately, your payment could not be processed.
              </Text>

              {failureReason && (
                <View className="w-full bg-red-50 rounded-3xl p-6 mt-8 border border-red-200">
                  <Text className="text-gray-700 font-semibold mb-2">
                    Reason
                  </Text>
                  <Text className="text-red-700">{failureReason}</Text>
                </View>
              )}

              <View className="w-full mt-10">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="w-full bg-red-600 rounded-2xl px-6 py-4 items-center"
                >
                  <Text className="text-white font-bold text-lg">
                    Try Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/(tabs)/appointment")}
                  className="w-full bg-gray-200 rounded-2xl px-6 py-4 items-center mt-3"
                >
                  <Text className="text-gray-700 font-semibold text-lg">
                    Back to Appointments
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
