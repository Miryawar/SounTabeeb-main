import { useDoctor } from "@/context/DoctorContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function DoctorLayout() {
  const router = useRouter();
  const { doctor } = useDoctor();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: doctor ? true : false,
        headerLeft: doctor
          ? ({ tintColor }) => (
              <TouchableOpacity
                onPress={() => {
                  // Navigate back within doctor section
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.push("/doctor/dashboard");
                  }
                }}
              >
                <Ionicons name="chevron-back" size={24} color={tintColor} />
              </TouchableOpacity>
            )
          : undefined,
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: "#1F2937",
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Doctor Dashboard",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="appointments"
        options={{ title: "My Appointments" }}
      />
      <Stack.Screen name="patients" options={{ title: "Patient List" }} />
      <Stack.Screen name="profile" options={{ title: "Profile Settings" }} />
    </Stack>
  );
}
