import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import DropdownMenu from "./DropdownMenu";
import SearchBar from "./SearchBar";

export default function Header() {
  const router = useRouter();
  const { user } = useUser();
  const unreadCount =
    user?.notifications?.filter((n: any) => !n.read).length || 0;

  return (
    <View>
      <View className="flex flex-row items-center justify-between">
        <DropdownMenu />
        <TouchableOpacity
          onPress={() => router.push("/notification-center")}
          className="relative"
        >
          <Ionicons name="notifications-outline" size={25} color="black" />
          {unreadCount > 0 && (
            <View className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-1">
              <Text className="text-white text-xs font-bold">
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <SearchBar />
    </View>
  );
}
