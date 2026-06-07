import { assets } from "@/assets/assets";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Contact() {
  const router = useRouter();
  const phoneNumber = "916005647721";
  const mess = "Hello, how can i help you?";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mess)}`;
  // const [isFocused, setIsFocused] = useState(false);

  const openCurrentLocation = async () => {
    const mapUrl =
      Platform.OS === "ios"
        ? "maps://maps.apple.com/?q=Current%20Location"
        : "geo:0,0?q=Current+Location";

    const fallbackUrl =
      "https://www.google.com/maps/search/?api=1&query=Current+Location";

    try {
      const supported = await Linking.canOpenURL(mapUrl);
      if (supported) {
        await Linking.openURL(mapUrl);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      console.warn("Unable to open map:", error);
      await Linking.openURL(fallbackUrl);
    }
  };
  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [subject, setSubject] = useState("");
  // const [message, setMessage] = useState("");
  // // SEND FUNCTION
  // const sendMessage = async () => {
  //   try {
  //     await emailjs.send(
  //       "service_xz8o6zj",
  //       "template_vnux19k",

  //       {
  //         user_name: name,
  //         user_email: email,
  //         subject: subject,
  //         message: message,
  //       },
  //       "rxQf7E1rI8Fa33AbP",
  //     );

  //     alert("Message Sent Successfully!");
  //   } catch (error) {
  //     console.log(error);
  //     alert("Failed to send message");
  //   }
  // };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex flex-row items-center gap-24 ">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={"black"}
            ></Ionicons>
          </TouchableOpacity>
          <Text className="text-2xl text-gray-800 font-semibold">
            Contact Us
          </Text>
        </View>

        <View className="bg-blue-50 justify-between items-center px-4 rounded-lg mt-6 py-6 ">
          <Text className="text-2xl text-gray-700 font-bold">
            We are Here to Help
          </Text>
          <Text className="text-lg  font-medium text-gray-600">
            Have a question or need a support?
          </Text>
          <Text className="text-lg text-gray-600 font-medium">
            Get in touch with us anytime.
          </Text>
          <Image
            source={assets.contact_image}
            className="w-full h-96 mt-4 rounded-xl"
            resizeMode="contain"
          ></Image>
        </View>
        <Text className="text-xl font-bold text-gray-800 m-4">
          Contact Options
        </Text>

        <TouchableOpacity
          onPress={() => Linking.openURL("tel:+916005647721")}
          className="flex flex-row items-center justify-between bg-[#fff] px-4 py-3 rounded-lg mb-2 "
        >
          <View className="flex flex-row gap-8 items-center">
            <View className="bg-blue-50 p-2 rounded-full">
              <Ionicons name="call-outline" size={24} color={"blue"}></Ionicons>
            </View>
            <View>
              <Text className="font-bold text-gray-700 text-xl">Call Us</Text>
              <Text className="text-gray-600">6005647721</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={24} color={"gray"}>
            {" "}
          </Ionicons>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL("mailto:miryawer990@gmail.com")}
          className="flex flex-row items-center justify-between bg-[#fff] px-4 py-3 rounded-lg mb-2 "
        >
          <View className="flex flex-row gap-8 items-center">
            <View className="bg-blue-50 p-2 rounded-full">
              <Ionicons name="mail" size={24} color={"green"}></Ionicons>
            </View>
            <View>
              <Text className="font-bold text-gray-700 text-xl">Email Us</Text>
              <Text className="text-gray-600">miryawer990@gmail.com</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={24} color={"gray"}>
            {" "}
          </Ionicons>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(url)}
          className="flex flex-row items-center justify-between bg-[#fff] px-4 py-3 rounded-lg mb-2 "
        >
          <View className="flex flex-row gap-8 items-center">
            <View className="bg-blue-50 p-2 rounded-full">
              <Ionicons
                name="logo-whatsapp"
                size={24}
                color={"green"}
              ></Ionicons>
            </View>
            <View>
              <Text className="font-bold text-gray-700 text-xl">
                Chat With Us
              </Text>
              <Text className="text-gray-600">Chat with our support team</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={24} color={"gray"}>
            {" "}
          </Ionicons>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openCurrentLocation}
          className="flex flex-row items-center justify-between bg-[#fff] px-4 rounded-lg mb-2 py-3"
        >
          <View className="flex flex-row gap-8 items-center flex-1">
            <View className="bg-blue-50 p-2 rounded-full">
              <Ionicons
                name="location-outline"
                size={24}
                color={"#B8860B"}
              ></Ionicons>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-700 text-xl">Visit Us</Text>
              <Text className="text-gray-600 " numberOfLines={2}>
                Budgam (193411)
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Open in Map 
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={24} color={"gray"} />
        </TouchableOpacity>

        {/* <Text className="text-blue-600 font-bold text-xl m-4">
          Send us a Message
        </Text>
        <View className="flex flex-row items-center gap-4">
          <View className=" flex-1 flex flex-row items-center bg-[#fff] rounded-lg px-4 py-2 gap-2 ">
            <Ionicons name="person-outline" size={24} color={"gray"} />
            <TextInput
              placeholder="Your Name"
              value={name}
              onChangeText={setName}
              className="border-gray-600 flex-1 min-w-0 "
            ></TextInput>
          </View>

          <View className="flex-1 flex-row items-center bg-[#fff] rounded-lg px-4 py-2 gap-2">
            <Ionicons name="mail-outline" size={24} color={"gray"} />
            <TextInput
              placeholder="Your Email"
              value={email}
              onChangeText={setEmail}
              //  placeholderTextColor={"red"}
              className=" border-gray-600 min-w-0 flex-1 "
            ></TextInput>
          </View>
        </View>
        <View className="flex-1 flex-row items-center bg-[#fff] rounded-lg px-4 py-2 gap-2 mt-4">
          <Ionicons name="moon" size={24} color={"gray"} />
          <TextInput
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
            className=" border-gray-600 min-w-0 flex-1 "
          ></TextInput>
        </View>
        <View className="flex-1 flex-row items-center bg-[#fff] rounded-lg px-4 py-2 gap-2 mt-4">
          {!isFocused && <Ionicons name="person" size={24} color={"gray"} />}

          <TextInput
            placeholder="Your Message"
            value={message}
            onChangeText={setMessage}
            multiline
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className=" border-gray-600 min-w-0 flex-1 h-32 "
          ></TextInput>
        </View>
        <TouchableOpacity
          onPress={sendMessage}
          className=" flex flex-row items-center justify-center gap-4 bg-blue-600 rounded-xl py-3 my-6"
        >
          <Ionicons name="send" size={16} color={"#fff"}></Ionicons>
          <Text className="text-white font-bold text-lg">Send Message</Text>
        </TouchableOpacity> */}

        {/* <Footer></Footer> */}
      </ScrollView>
    </SafeAreaView>
  );
}
