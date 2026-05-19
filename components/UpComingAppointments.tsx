import {View,Text,Image, TouchableOpacity} from "react-native";
import { doctors } from "@/assets/assets";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
export default function UpComingAppointments()
{
    
     const appointments = [
    {
      id: 1,
      name: "Dr. Ali",
      speciality: "Orthopedic",
      date: "12 May",
      time: "4:30 PM",
      image: doctors[0]?.image,
      location:"Mazhama",
    },
    {
      id: 2,
      name: "Dr. Ahmad",
      speciality: "Cardiologist",
      date: "13 May",
      time: "10:00 AM",
      image: doctors[1]?.image,
         location:"Magam",
    },
    {
      id: 3,
      name: "Dr. Khan",
      speciality: "Dermatologist",
      date: "14 May",
      time: "2:00 PM",
      image: doctors[2]?.image,
         location:"Srinagar",
    },
  ];
//   const [selectedActions,setSelectedActions]=useState("reschedule");
  const [selectedActions,setSelectedActions]=useState({});
    return(
      
        <View className="flex-1">
          
            <Text className="text-xl font-bold text-gray-700 mb-4"> Upcoming Appointments </Text>
            <View >
                {appointments.map((item,index)=>(
                    <View key={item.id}  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                        <View className="flex flex-row items-center ">
                        <Image source={item.image} className="w-32 h-32 rounded-full bg-blue-50" resizeMode="contain"></Image>
                        <View className="px-8 py-8">
                            <Text className="text-xl font-bold text-gray-700">{item.name}</Text>
                            <Text className="text-lg font-medium text-gray-500">{item.speciality}</Text>
                            <View className="flex flex-row items-center jsutify-center ">
                            <Ionicons name="location-outline" size={16} color={"gray"}></Ionicons>
                            <Text className="text-lg font-medium text-gray-500">{item.location}</Text>
                            </View>
                            </View>
                        </View>
                             
                          <View className="flex-grow flex-row items-center justify-center gap-3 mt-4">   
                         <TouchableOpacity onPress={()=>setSelectedActions({
                                                              ...selectedActions,
                                                             [item.id]: "reschedule",
                                                          })}
                         
                         className={` px-2 py-4  rounded-xl w-1/2 ${selectedActions[item.id]==="reschedule"?"bg-blue-600":"bg-gray-200"} `}>

                     <Text className={`text-center text-lg  font-bold ${selectedActions[item.id]==="reschedule"?"text-white":"text-blue-600"}`}>Reschedule</Text>
                               
                          </TouchableOpacity>
                         <TouchableOpacity   onPress={()=>setSelectedActions({
                            ...selectedActions,
                            [item.id]:"cancel"
                         })}
                         
                         className={` px-2 py-4  w-1/2 rounded-xl ${selectedActions[item.id]==="cancel"?"bg-red-600":"bg-gray-200"} `} >
                                     <Text className={`text-center  font-bold text-lg ${selectedActions[item.id]==="cancel"?"text-white":"text-red-600"}`}>Cancel</Text>
                                    
                          </TouchableOpacity>
                          </View>


                        </View>
                        
                ))}

               
            </View>
            
    
         
        </View>

    )
}