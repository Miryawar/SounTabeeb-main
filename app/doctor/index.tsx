import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function DoctorIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/doctor/login");
  }, [router]);

  return null;
}
