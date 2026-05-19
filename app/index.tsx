import { assets } from "@/assets/assets";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 150,
          flexGrow: 1,
          height: "100%",
        }}
      >
        <View className="flex justify-center items-center ">
          <View>
            <LinearGradient
              colors={["#2E86DE", "#A9CCE3"]}
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 20, // optional
              }}
            >
              <Image
                source={assets.frontimage}
                resizeMode="contain"
                style={{ width: 320, height: 300 }}
              ></Image>
            </LinearGradient>
          </View>

          <View className="flex flex-row m-2">
            <Text className=" text-3xl font-bold">Soun</Text>
            <Text className="text-blue-600 text-3xl font-bold">Tabeeb</Text>
          </View>
          <Text className="text-gray-600 text-lg font-semibold mb-4">
            Doctor Appointment System
          </Text>

          <View className="flex-row items-start justify-center gap-2">
            <View className=" border-b-2 border-[#2563EB] mb-1 p-2 w-32"></View>
            <Ionicons name="heart-sharp" color={"#2563EB"} size={24}></Ionicons>
            <View className=" border-b-2 border-[#2563EB] mb-1 p-2 w-32"></View>
          </View>

          <Text className="text-gray-800 text-xl font-bold mt-4">
            Book Appointments Easily
          </Text>
          <Text className="text-gray-600 text-lg font-semibold">
            Your health, our priority
          </Text>
          <View className="w-3/4">
            {/* login in button */}
            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
              className="border bg-blue-600 rounded-lg p-2 my-3 flex flex-row items-center justify-between"
            >
              <Ionicons name="person" color={"#fff"} size={30}></Ionicons>
              <Text className="flex-1 text-center text-[#fff] text-lg font-bold">
                Login
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={"#fff"}
              ></Ionicons>
            </TouchableOpacity>
            {/* sign up button */}
            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              className="border bg-[#fff] rounded-lg p-2 my-3 flex flex-row items-center justify-between"
            >
              <Ionicons name="person" color={"#2563EB"} size={30}></Ionicons>
              <Text className="flex 1 text-center  text-blue-600 text-lg font-bold">
                Sign Up
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={"#2563EB"}
              ></Ionicons>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-2 px-2 mt-2">
              <View className="flex-1 h-[1px] bg-gray-400" />

              <Text className="text-gray-500">OR</Text>

              <View className="flex-1 h-[1px] bg-gray-400" />
            </View>
            <TouchableOpacity
              onPress={() => router.push("/home")}
              className="border bg-[#fff] rounded-lg p-2 my-3 flex flex-row items-center justify-between"
            >
              <Ionicons name="person" color={"#2563EB"} size={30}></Ionicons>
              <Text className="flex-1 text-center  text-gray-600 text-lg font-bold">
                Continue as a Guest
              </Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={"#2563EB"}
              ></Ionicons>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
