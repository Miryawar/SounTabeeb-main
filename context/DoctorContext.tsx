import { apiGet, apiPost, apiPut } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const DoctorContext = createContext<any>(null);

export const DoctorProvider = ({ children }: any) => {
  const [doctor, setDoctor] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctor();
  }, []);

  const parseResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return await res.json();
      } catch {
        return { message: "Invalid JSON response" };
      }
    }
    const text = await res.text();
    return { message: text || "Empty response" };
  };

  const loadDoctor = async () => {
    const storedToken = await AsyncStorage.getItem("doctorToken");
    const storedProfile = await AsyncStorage.getItem("doctorProfile");

    if (storedToken) {
      setToken(storedToken);
      try {
        const res = await apiGet("/api/users/me", "doctorToken");
        const data = await parseResponse(res);
        if (res.ok && data.role === "doctor") {
          setDoctor(data);
          await AsyncStorage.setItem("doctorProfile", JSON.stringify(data));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Doctor profile load failed", err);
      }
    }

    if (storedProfile) {
      try {
        setDoctor(JSON.parse(storedProfile));
      } catch {
        setDoctor(null);
      }
    }

    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      return { ok: false, message: "Email and password are required" };
    }

    try {
      const res = await apiPost("/api/auth/login", { email, password });
      const data = await parseResponse(res);
      if (!res.ok) {
        return { ok: false, message: data.message || "Login failed" };
      }

      if (data.user?.role !== "doctor") {
        return {
          ok: false,
          message: "This account is not registered as a doctor.",
        };
      }

      const doctorData = { ...data.user, role: data.user.role };
      await AsyncStorage.setItem("doctorToken", data.token);
      await AsyncStorage.setItem("doctorProfile", JSON.stringify(doctorData));
      setToken(data.token);
      setDoctor(doctorData);

      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err.message || "Login failed" };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("doctorToken");
    await AsyncStorage.removeItem("doctorProfile");
    setToken(null);
    setDoctor(null);
  };

  const updateDoctorProfile = async (updates: any) => {
    try {
      console.log("UPDATE DOCTOR REQ:", updates);
      const res = await apiPut("/api/doctors/me", updates, "doctorToken");
      const data = await parseResponse(res);
      console.log("UPDATE DOCTOR RES status:", res.status, "body:", data);
      if (!res.ok) {
        return { ok: false, message: data.message || "Update failed" };
      }
      await AsyncStorage.setItem("doctorProfile", JSON.stringify(data));
      setDoctor(data);
      return { ok: true, data };
    } catch (err: any) {
      console.error("UPDATE DOCTOR ERROR:", err);
      return { ok: false, message: err.message || "Update failed" };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    doctorDetails: any = {},
  ) => {
    try {
      const body = {
        name,
        email,
        password,
        phone: doctorDetails.phone || "",
        profilePicture: doctorDetails.profilePicture || "",
        bio: doctorDetails.bio || "",
        speciality: doctorDetails.speciality || "",
        qualification: doctorDetails.qualification || "",
        experience: doctorDetails.experience || "",
        licenseNumber: doctorDetails.licenseNumber || "",
        role: "doctor",
      };

      const res = await apiPost("/api/auth/register", body);
      const data = await parseResponse(res);

      if (!res.ok) {
        return { ok: false, message: data.message || "Registration failed" };
      }

      const doctorData = {
        ...data.user,
        role: "doctor",
      };

      await AsyncStorage.setItem("doctorToken", data.token);
      await AsyncStorage.setItem("doctorProfile", JSON.stringify(doctorData));
      setToken(data.token);
      setDoctor(doctorData);

      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err.message || "Registration failed" };
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        token,
        loading,
        login,
        logout,
        register,
        updateDoctorProfile,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => useContext(DoctorContext);
