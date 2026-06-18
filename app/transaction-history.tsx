import { apiGet } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
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

export default function TransactionHistory() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet("/api/appointments/transactions/history");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
        setError(data?.message || "Failed to load transactions");
      }
    } catch (err: any) {
      setTransactions([]);
      setError(err.message || "Unable to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
      case "failed":
        return <Ionicons name="close-circle" size={24} color="#EF4444" />;
      default:
        return <Ionicons name="time" size={24} color="#F59E0B" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View className="flex flex-row items-center justify-between mb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="gray" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Transactions</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text className="text-gray-600 mb-5">
        Track all your payments and appointment transactions.
      </Text>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}

      {error && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">{error}</Text>
          <TouchableOpacity
            onPress={fetchTransactions}
            className="mt-4 bg-blue-600 rounded-2xl px-6 py-3"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && transactions.length === 0 && (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-bold text-gray-700 mb-2">
            No transactions yet
          </Text>
          <Text className="text-center text-gray-500">
            Your payment history will appear here after your first appointment
            booking.
          </Text>
        </View>
      )}

      {!loading && !error && transactions.length > 0 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {transactions.map((txn) => {
            const createdAt = txn.createdAt ? new Date(txn.createdAt) : null;
            const formattedDate = createdAt
              ? createdAt.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "";
            const formattedTime = createdAt
              ? createdAt.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <View
                key={txn._id}
                className={`rounded-3xl border p-5 mb-4 ${getStatusColor(txn.status)}`}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    {getStatusIcon(txn.status)}
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-800">
                        Rs {txn.amount}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {txn.doctor?.name || "Doctor"}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View
                      className={`px-3 py-1 rounded-full ${
                        txn.status === "success"
                          ? "bg-green-200"
                          : txn.status === "failed"
                            ? "bg-red-200"
                            : "bg-yellow-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          txn.status === "success"
                            ? "text-green-800"
                            : txn.status === "failed"
                              ? "text-red-800"
                              : "text-yellow-800"
                        }`}
                      >
                        {getStatusText(txn.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="border-t border-gray-300 pt-3 mt-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600 text-sm">Date & Time</Text>
                    <Text className="text-gray-800 font-semibold">
                      {formattedDate} {formattedTime}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600 text-sm">Method</Text>
                    <Text className="text-gray-800 font-semibold">
                      {txn.method}
                    </Text>
                  </View>
                  {txn.transactionRef && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600 text-sm">Ref ID</Text>
                      <Text className="text-gray-800 font-mono text-xs">
                        {txn.transactionRef.substring(0, 20)}...
                      </Text>
                    </View>
                  )}
                  {txn.failureReason && (
                    <View className="mt-2">
                      <Text className="text-red-700 text-sm">
                        Reason: {txn.failureReason}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
