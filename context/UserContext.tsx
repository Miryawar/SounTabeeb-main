import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../utils/api";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Load image when app starts
  useEffect(() => {
    loadImage();
  }, []);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadImage = async () => {
    const savedImage = await AsyncStorage.getItem("profileImage");

    if (savedImage) {
      setProfileImage(savedImage);
    }
    const savedName = await AsyncStorage.getItem("userName");

    if (savedName) {
      setUserName(savedName);
    }
  };

  const loadAuth = async () => {
    const t = await AsyncStorage.getItem("token");
    const savedName = await AsyncStorage.getItem("userName");
    if (t) {
      setToken(t);
      try {
        const res = await apiGet("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          if (!savedName && data.name) {
            setUserName(data.name);
            await AsyncStorage.setItem("userName", data.name);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch profile", err);
      }
    }
    setLoading(false);
  };

  // Update image globally + save
  const updateProfileImage = async (uri: string) => {
    setProfileImage(uri);

    await AsyncStorage.setItem("profileImage", uri);
  };

  const updateUserName = async (name: string) => {
    setUserName(name);

    await AsyncStorage.setItem("userName", name);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiPost("/api/auth/login", { email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      await AsyncStorage.setItem("token", data.token);
      setToken(data.token);
      if (data.user && data.user.name) {
        setUserName(data.user.name);
        await AsyncStorage.setItem("userName", data.user.name);
      }
      // fetch full profile
      const profileRes = await apiGet("/api/users/me");
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUser(profile);
      }
      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err.message };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    extras: any = {},
  ) => {
    try {
      const body = { name, email, password, ...extras };
      const res = await apiPost("/api/auth/register", body);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Register failed");
      // optionally auto-login
      await AsyncStorage.setItem("token", data.token);
      setToken(data.token);
      if (data.user && data.user.name) {
        setUserName(data.user.name);
        await AsyncStorage.setItem("userName", data.user.name);
      }
      const profileRes = await apiGet("/api/users/me");
      if (profileRes.ok) setUser(await profileRes.json());
      return { ok: true };
    } catch (err: any) {
      console.log("REGISTER ERROR:", err);
      return { ok: false, message: err.message };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userName");
    setToken(null);
    setUser(null);
    setUserName(null);
  };
  return (
    <UserContext.Provider
      value={{
        profileImage,
        updateProfileImage,
        userName,
        updateUserName,
        token,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
