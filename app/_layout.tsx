import { DoctorProvider } from "@/context/DoctorContext";
import { UserProvider } from "@/context/UserContext";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <UserProvider>
      <DoctorProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </DoctorProvider>
    </UserProvider>
  );
}
