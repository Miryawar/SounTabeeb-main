import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string |null>(null);

  // Load image when app starts
  useEffect(() => {
    loadImage();
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

  // Update image globally + save
  const updateProfileImage = async (uri: string) => {
    setProfileImage(uri);

    await AsyncStorage.setItem("profileImage", uri);

  };

  const updateUserName = async (name: string) => {
  setUserName(name);

     await AsyncStorage.setItem("userName", name );
};
  return (
    <UserContext.Provider
      value={{
        profileImage,
        updateProfileImage,
          userName,
          updateUserName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
