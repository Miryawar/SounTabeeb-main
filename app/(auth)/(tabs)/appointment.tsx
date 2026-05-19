import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import UpComingAppointments from "@/components/UpComingAppointments";
import CompletedAppointments from "@/components/CompletedAppointments";
import CancelledAppointments from "@/components/CancelledAppointments";
export default function Appointment() {
    const router=useRouter();
  const unreadCount = 1;
   const [activeTab, setActiveTab] = useState("upcoming");
  return (
    <SafeAreaView style={{ padding: 16 }}>
      <View className="flex flex-row items-center justify-between ">
        <Text className="text-gray-700 text-2xl font-bold">
          My Appointments
        </Text>
        <View className="relative">
          <Ionicons
            name="notifications-outline"
            size={30}
            color={"black"}
          ></Ionicons>
          {/* Badge */}
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1">
              <Text className="text-white text-[10px] font-bold">
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text className="text-gray-600 text-sm font-semibold">
        Manage your upcoming and past appointments
      </Text>
      <View className="flex flex-row item-center justify-between py-6">
        <TouchableOpacity onPress={() =>setActiveTab("upcoming")} className={`py-2 rounded-lg ${activeTab==="upcoming"?"bg-blue-600":"bg-[#fff]"}`}>
              <View className="flex flex-row items-center gap-2">
            <Ionicons name="calendar-clear-outline"  size={25} color={activeTab === "upcoming" ? "white" : "gray"}></Ionicons>
            <Text>Upcoming</Text>
            </View>
       
        </TouchableOpacity>
      

        <TouchableOpacity onPress={()=>setActiveTab("completed")} className={`py-2 rounded-lg ${activeTab==="completed"?"bg-green-600":"bg-[#fff]"}`}>
            <View className="flex flex-row items-center gap-2">
            <Ionicons name="checkmark-done-circle-outline"  size={25} color={activeTab === "completed" ? "white" : "gray"}></Ionicons>
            <Text>Completed</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>setActiveTab("cancelled")} className={`py-2 rounded-lg ${activeTab==="cancelled"?"bg-red-600":"bg-[#fff]"}`}>
            <View className="flex flex-row items-center gap-2">
             <Ionicons name="close-circle-outline"  size={25} color={activeTab === "cancelled" ? "white" : "gray"}></Ionicons>
            <Text>Cancelled</Text>
            </View>
        </TouchableOpacity>
           
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:120}} className="bg-gray-50 ">
        {activeTab === "upcoming" && <UpComingAppointments />}
        {activeTab==="completed" &&<CompletedAppointments/>}
        {activeTab==="cancelled" &&<CancelledAppointments/>}
      </ScrollView>
    </SafeAreaView>
  );
}
