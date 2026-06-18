import { useUser } from "@/context/UserContext";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationCenter() {
  const router = useRouter();
  const { user, markNotificationRead } = useUser();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const notifications = useMemo(() => user?.notifications || [], [user]);

  const handleMarkRead = async (id: string) => {
    setLoadingIds((prev) => [...prev, id]);
    const { ok, message } = await markNotificationRead(id);
    setLoadingIds((prev) => prev.filter((item) => item !== id));
    if (!ok) {
      Alert.alert("Unable to mark read", message || "Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View className="flex flex-row items-center justify-between mb-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="gray" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text className="text-gray-600 mb-5">
        Your latest alerts, appointment updates, and reminders.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View className="items-center py-20 px-6">
            <Text className="text-xl font-bold text-gray-700 mb-2">
              No notifications yet
            </Text>
            <Text className="text-center text-gray-500">
              Notifications will appear when there is an update related to your
              appointments.
            </Text>
          </View>
        ) : (
          notifications.map((notification: any) => {
            const createdAt = notification.createdAt
              ? new Date(notification.createdAt)
              : null;
            const formattedTime = createdAt
              ? createdAt.toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            const isRead = notification.read;
            return (
              <View
                key={notification._id}
                className={`rounded-3xl border p-4 mb-4 ${
                  isRead
                    ? "border-gray-200 bg-gray-50"
                    : "border-blue-200 bg-white"
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-semibold text-gray-800">
                    {notification.title || "Notification"}
                  </Text>
                  <Text className="text-sm text-gray-500">{formattedTime}</Text>
                </View>
                <Text className="text-gray-700 mb-3">
                  {notification.body || "No details available."}
                </Text>
                {!isRead && (
                  <TouchableOpacity
                    onPress={() => handleMarkRead(notification._id)}
                    disabled={loadingIds.includes(notification._id)}
                    className="self-start rounded-2xl bg-blue-600 px-4 py-2"
                  >
                    <Text className="text-white font-semibold">
                      {loadingIds.includes(notification._id)
                        ? "Marking..."
                        : "Mark as Read"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
