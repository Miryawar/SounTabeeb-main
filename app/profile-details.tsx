import { assets } from "@/assets/assets";
import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileDetails() {
  const router = useRouter();
  const user = {
    name: "yawar mir",
    email: "miryawer990@gmail.com",
    contact: "6005647721",
    dob: "09-11-2001",
    address: "Watalpora, Magam ,Budgam-193411",
    City: "Srinagar",
    District: "Budgam",
    pincode: "193411",
    image: assets.profilepic,
    gender: "Male",
    state: "J&K",
  };
  const [userProfile, setUserProfile] = useState(user);
  const [profileEditing, setProfileEditing] = useState(false);
  // const [image, setImage] = useState<string | null>(null);
  const { profileImage, updateProfileImage, userName, updateUserName } =
    useUser();
  const pickImage = async () => {
    // Ask permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission required to access gallery!");
      return;
    }

    // Open gallery
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      // setImage(imageUri);
      // // Save image URI
      // await AsyncStorage.setItem("profileImage", imageUri);
      await updateProfileImage(imageUri);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={"gray"}></Ionicons>
          </TouchableOpacity>
          <Text className="text-gray-800 text-2xl font-bold">
            Profile Details
          </Text>

          <TouchableOpacity
            onPress={() => setProfileEditing(!profileEditing)}
            className="flex flex-row items-center gap-2 bg-blue-100 rounded-full px-4 py-2"
          >
            <Ionicons name="pencil-outline" size={16} color={"blue"}></Ionicons>
            <Text className="text-blue-600 font-semibold text-center ">
              {profileEditing ? "Save Changes" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center my-4">
          <TouchableOpacity onPress={pickImage} className="relative w-52 h-52 ">
            <Image
              source={profileImage ? { uri: profileImage } : userProfile.image}
              className="w-full h-full rounded-full"
            ></Image>

            <View className="absolute  bottom-2 right-2 bg-blue-500 p-2  rounded-full ">
              <Ionicons name="camera-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          {/* <Text>{userProfileDetails.name}</Text> */}
          {profileEditing ? (
            <TextInput
              // value={userProfile.name}
              value={userName ? userName : userProfile.name}
              onChangeText={(text) =>
                setUserProfile({
                  ...userProfile,
                  name: text,
                })
              }
              className="border border-gray-300 rounded-xl p-4 mb-4 mt-4"
            ></TextInput>
          ) : (
            <Text className="text-gray-700 text-xl font-bold mt-4">
              {" "}
              {/* {userProfile.name} */}
              {userName ? userName : userProfile.name}
            </Text>
          )}
        </View>
        {/* personal informatiom */}
        <View className=" bg-white rounded-lg px-4 py-2 mb-4">
          <View className="flex flex-row items-center gap-4 mb-4">
            <View className="bg-gray-200 rounded-full p-2">
              <Ionicons
                name="person-outline"
                color={"purple"}
                size={20}
              ></Ionicons>
            </View>
            <Text className="text-xl font-bold text-gray-800">
              Personal Information
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="person-outline"
                color={"purple"}
                size={24}
              ></Ionicons>

              <Text className="text-lg font-medium text-gray-600">
                Full Name
              </Text>
            </View>
            {profileEditing ? (
              <TextInput
                value={userProfile.name}
                onChangeText={(text) =>
                  setUserProfile({
                    ...userProfile,
                    name: text,
                  })
                }
                className="border border-gray-300 rounded-xl p-4 mb-4"
              ></TextInput>
            ) : (
              <Text className="text-gray-600 text-xl  mt-4">
                {" "}
                {userProfile.name}
              </Text>
            )}
          </View>
          <View className="h-[1px] bg-gray-400 w-full my-3" />

          {/* date of birth */}

          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="calendar-outline"
                color={"purple"}
                size={24}
              ></Ionicons>

              <Text className="text-lg font-medium text-gray-600">
                Date of Birth
              </Text>
            </View>
            {profileEditing ? (
              <TextInput
                value={userProfile.dob}
                onChangeText={(text) =>
                  setUserProfile({
                    ...userProfile,
                    dob: text,
                  })
                }
                className="border border-gray-300 rounded-xl p-4 mb-4"
              ></TextInput>
            ) : (
              <Text className="text-gray-600 text-xl  mt-4">
                {" "}
                {userProfile.dob}
              </Text>
            )}
          </View>
          <View className="h-[1px] bg-gray-400 w-full my-3" />
          {/* gender */}
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="person-outline"
                color={"purple"}
                size={24}
              ></Ionicons>

              <Text className="text-lg font-medium text-gray-600">Gender</Text>
            </View>
            {profileEditing ? (
              <TextInput
                value={userProfile.gender}
                onChangeText={(text) =>
                  setUserProfile({
                    ...userProfile,
                    gender: text,
                  })
                }
                className="border border-gray-300 rounded-xl p-4 mb-4"
              ></TextInput>
            ) : (
              <Text className="text-gray-600 text-xl mt-4">
                {" "}
                {userProfile.gender}
              </Text>
            )}
          </View>
          <View className="h-[1px] bg-gray-400 w-full my-3" />
          {/* gender */}
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="flag-outline"
                color={"purple"}
                size={24}
              ></Ionicons>

              <Text className="text-lg font-medium text-gray-600">State</Text>
            </View>
            {profileEditing ? (
              <TextInput
                value={userProfile.state}
                onChangeText={(text) =>
                  setUserProfile({
                    ...userProfile,
                    state: text,
                  })
                }
                className="border border-gray-300 rounded-xl p-4 mb-4"
              ></TextInput>
            ) : (
              <Text className="text-gray-600 text-xl  mt-4">
                {" "}
                {userProfile.state}
              </Text>
            )}
          </View>
        </View>

        {/* contact Information */}
        <View className="bg-[#fff] rounded-lg px-4 py-2 mb-4">
          <View className="flex flex-row items-center gap-8 mb-4">
            <View className="bg-gray-200 rounded-full p-2">
              <Ionicons
                name="call-outline"
                color={"purple"}
                size={20}
              ></Ionicons>
            </View>
            <Text className="text-xl font-bold text-gray-800">
              Contact Information
            </Text>
          </View>
          {/*email address  */}
          <View className="flex flex-row items-center py-3">
            {/* Left side */}
            <View className="flex flex-row items-center gap-5 w-1/2">
              <Ionicons name="mail-outline" color={"purple"} size={24} />
              <Text className="text-lg font-medium text-gray-600">
                Email Address
              </Text>
            </View>

            {/* Right side */}
            <View className="w-1/2 items-end">
              {profileEditing ? (
                <TextInput
                  value={userProfile.email}
                  onChangeText={(text) =>
                    setUserProfile({
                      ...userProfile,
                      email: text,
                    })
                  }
                  className="border border-gray-300 rounded-xl px-3 py-2 w-full text-right"
                />
              ) : (
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-gray-600 text-lg  text-right"
                >
                  {userProfile.email}
                </Text>
              )}
            </View>
          </View>
          <View className="h-[1px] bg-gray-400 w-full my-3" />
          {/* Phone Number */}
          <View className="flex flex-row items-center justify-between py-3">
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="flag-outline"
                color={"purple"}
                size={24}
              ></Ionicons>

              <Text className="text-lg font-medium text-gray-600">
                Phone Number
              </Text>
            </View>
            {profileEditing ? (
              <TextInput
                value={userProfile.contact}
                onChangeText={(text) =>
                  setUserProfile({
                    ...userProfile,
                    contact: text,
                  })
                }
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-xl p-4 mb-4"
              ></TextInput>
            ) : (
              <Text className="text-gray-600 text-xl mt-4">
                {" "}
                {userProfile.contact}
              </Text>
            )}
          </View>
          <View className="h-[1px] bg-gray-400 w-full my-3" />
          {/* full address */}
          <View className="flex flex-row items-center justify-between py-3">
            <View className="flex flex-row items-center gap-3 flex-1">
              <Ionicons
                name="flag-outline"
                color={"purple"}
                size={24}
              ></Ionicons>

              <Text className="text-lg font-medium text-gray-600">Address</Text>
            </View>
            <View className="flex-1 items-end">
              {profileEditing ? (
                <TextInput
                  value={userProfile.address}
                  onChangeText={(text) =>
                    setUserProfile({
                      ...userProfile,
                      address: text,
                    })
                  }
                  className="border border-gray-300 rounded-xl p-4 mb-4"
                ></TextInput>
              ) : (
                <Text className="text-gray-600 text-xl  mt-4">
                  {" "}
                  {userProfile.address}
                </Text>
              )}
            </View>
          </View>
        </View>
        {/*button  */}
        <TouchableOpacity
          onPress={() => setProfileEditing(!profileEditing)}
          className="flex flex-row items-center justify-center gap-2 bg-blue-400 rounded-xl px-8 py-4 "
        >
          <Ionicons name="pencil-sharp" size={16} color={"white"} />
          <Text className="text-white text-center ">
            {profileEditing ? "Save Changes" : "Edit Profile"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
