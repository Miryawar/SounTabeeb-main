import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import {
    apiGet,
    apiPost,
    apiPut,
    removeProfilePicture,
    uploadProfilePicture,
} from "../utils/api";
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

  const parseResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return await res.json();
      } catch (err) {
        return { message: "Invalid JSON response" };
      }
    }
    const text = await res.text();
    return { message: text || "Empty response" };
  };

  const loadAuth = async () => {
    const t = await AsyncStorage.getItem("token");
    const savedName = await AsyncStorage.getItem("userName");
    if (t) {
      setToken(t);
      try {
        const res = await apiGet("/api/users/me");
        const data = await parseResponse(res);
        if (res.ok) {
          setUser(data);
          if (!savedName && data.name) {
            setUserName(data.name);
            await AsyncStorage.setItem("userName", data.name);
          }
        } else {
          console.warn(
            "Failed to fetch profile",
            data.message || "Unknown error",
          );
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

  const updateUserProfile = async (profileData: any) => {
    try {
      console.log("UPDATE USER PROFILE - Sending data:", profileData);

      const res = await apiPut("/api/users/me", profileData);

      console.log(
        "UPDATE USER PROFILE - Response status:",
        res.status,
        "Content-Type:",
        res.headers.get("content-type"),
      );

      const data = await parseResponse(res);

      console.log("UPDATE USER PROFILE - Parsed response:", data);

      if (!res.ok) throw new Error(data.message || "Profile update failed");

      setUser(data);
      if (data.name) {
        setUserName(data.name);
        await AsyncStorage.setItem("userName", data.name);
      }

      console.log("UPDATE USER PROFILE - Success, user state updated");

      return { ok: true, user: data };
    } catch (err: any) {
      console.log("UPDATE USER PROFILE - Error:", err.message);
      return { ok: false, message: err.message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await apiPost("/api/auth/login", { email, password });
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.message || "Login failed");
      await AsyncStorage.setItem("token", data.token);
      setToken(data.token);
      if (data.user && data.user.name) {
        setUserName(data.user.name);
        await AsyncStorage.setItem("userName", data.user.name);
      }
      // fetch full profile
      const profileRes = await apiGet("/api/users/me");
      const profile = await parseResponse(profileRes);
      if (profileRes.ok) {
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
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.message || "Register failed");
      // optionally auto-login
      await AsyncStorage.setItem("token", data.token);
      setToken(data.token);
      if (data.user && data.user.name) {
        setUserName(data.user.name);
        await AsyncStorage.setItem("userName", data.user.name);
      }
      const profileRes = await apiGet("/api/users/me");
      const profile = await parseResponse(profileRes);
      if (profileRes.ok) setUser(profile);
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

  const uploadProfilePic = async (base64Image: string) => {
    try {
      const res = await uploadProfilePicture(base64Image);
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.message || "Upload failed");

      // Update local state with new profile picture
      setProfileImage(base64Image);
      await AsyncStorage.setItem("profileImage", base64Image);

      // Update user object with new profile picture
      setUser({ ...user, profilePicture: base64Image });

      return { ok: true, message: "Profile picture updated" };
    } catch (err: any) {
      console.log("UPLOAD PROFILE PICTURE ERROR:", err);
      return { ok: false, message: err.message };
    }
  };

  const removeProfilePic = async () => {
    try {
      const res = await removeProfilePicture();
      const data = await parseResponse(res);
      if (!res.ok) throw new Error(data.message || "Remove failed");

      // Clear local state
      setProfileImage(null);
      await AsyncStorage.removeItem("profileImage");

      // Update user object
      setUser({ ...user, profilePicture: null });

      return { ok: true, message: "Profile picture removed" };
    } catch (err: any) {
      console.log("REMOVE PROFILE PICTURE ERROR:", err);
      return { ok: false, message: err.message };
    }
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
        updateUserProfile,
        logout,
        uploadProfilePic,
        removeProfilePic,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
