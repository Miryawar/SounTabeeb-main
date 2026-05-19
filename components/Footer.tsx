import { Text, View, Image, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {assets} from "@/assets/assets";

export default function Footer() {
  const router=useRouter();
  const phoneNumber = "917889463982";
  const message = "Hello, I want to book an appointment";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  return (
    <View className=" flex-1 px-4">
      <View className="border  border-[#eee] rounded-lg bg-[#fff] px-4">
      <TouchableOpacity onPress={()=>router.push("/home")}>
    <Image source={assets.doclogo} resizeMode="contain" className="w-40 h-40"/>
    </TouchableOpacity>
      <Text className="text-gray-600 leading-6 text-base ">
    “Soun Tabeb is dedicated to making healthcare simple, accessible, and reliable by connecting patients with trusted doctors anytime, anywhere.”
      </Text>
      <Text className="text-gray-900 font-semibold text-xl">Company</Text>

      <Text className="text-gray-600 text-lg">Home</Text>
      <Text className="text-gray-600 text-lg">About</Text>
      <Text className="text-gray-600 text-lg">Privacy</Text>
      <Text className="text-gray-600 text-lg">Policy</Text>

      <View className="gap-2 my-5">

        <Text className="text-gray-900 font-semibold text-xl">Get In Touch</Text>
        
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${phoneNumber}`)}>
            <View className=" flex-row gap-3">
          <Text className="text-gray-600 text-lg">Call : 7889463982</Text>
          {/* <Ionicons name="call" size={20} color="blue" /> */}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => Linking.openURL(url)}>
          <Text className="text-gray-600 text-lg">Chat on Whatsapp </Text>
        </TouchableOpacity>

      </View>
</View>
    </View>
  );
}
