// import {View,Text,Image,ScrollView,TextInput,TouchableOpacity,} from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { SafeAreaProvider } from "react-native-safe-area-context";

// export default function Chat() {
//     return(
//         <SafeAreaProvider className="flex-1 py-40 px-48">
//             <View>
//             <LinearGradient colors={["#2563EB", "#DBEAFE"]} className="flex-1">
//                 <Text>Messafffffffffffges</Text>
                
//                 </LinearGradient>
//                 </View>
//             </SafeAreaProvider>

//     );
// }




import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Chat() {
  const messages = [
    {
      id: 1,
      text: "Hello! ?",
      sender: "user",
      time: "10:20 AM",
    },
    {
      id: 2,
      text: "Hello! how can i help you.",
      sender: "doctor",
      time: "10:21 AM",
    },
    {
      id: 3,
      text: "doctor i have seviour headach.",
      sender: "user",
      time: "10:22 AM",
    },
    {
      id:4,
        text: "First if possible check your blood pressure also do meditation to reduce stress also try to drink water in regular intervals to remain hydrated",
        sender: "doctor",
        time: "10:24 AM",
    },
    {
      id:5,
        text: "yes doctor i will do and i will take rest so if i could get small relief",
        sender: "user",
        time: "10:26 AM",
    },
    {
      id:4,
        text: "yes also take rest to prevent more seviourity",
        sender: "doctor",
        time: "10:28 AM"
    },
  ];
  
  return (
    <SafeAreaProvider>
    <LinearGradient
    
      colors={["#2563EB", "#DBEAFE"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 bg-white/20 backdrop-blur-lg">
          
          <View className="flex-row items-center gap-3">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300",
              }}
              className="w-14 h-14 rounded-full"
            />

            <View>
              <Text className="text-white text-lg font-bold">
                Dr. Sarah Patel
              </Text>

              <Text className="text-blue-100 text-sm">
                Online
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-10">
            <Ionicons name="call" size={20} color="white" />
            <Ionicons name="videocam" size={20} color="white" />
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView
          className="flex-1 px-4 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 flex ${
                message.sender === "user"
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <View
                className={`max-w-[80%] px-4 py-3 rounded-3xl ${
                  message.sender === "user"
                    ? "bg-blue-600 rounded-br-md"
                    : "bg-white rounded-bl-md"
                }`}
              >
                <Text
                  className={`text-base ${
                    message.sender === "user"
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                >
                  {message.text}
                </Text>

                <Text
                  className={`text-[10px] mt-2 text-right ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  {message.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Input */}
        <View className="px-4 py-4 bg-white rounded-t-3xl">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            
            <TouchableOpacity>
              <Ionicons
                name="happy-outline"
                size={24}
                color="gray"
              />
            </TouchableOpacity>

            <TextInput
              placeholder="Type your message..."
              className="flex-1 px-3 text-base"
            />

            <TouchableOpacity>
              <Ionicons
                name="attach"
                size={24}
                color="gray"
              />
            </TouchableOpacity>

            <TouchableOpacity className="bg-blue-600 w-12 h-12 rounded-full items-center justify-center ml-3">
              <Ionicons
                name="send"
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
       </SafeAreaView>
      
    </LinearGradient>
    </SafeAreaProvider>
  );
  
}
