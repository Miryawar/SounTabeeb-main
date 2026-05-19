import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View,Text, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";

export default function DateFormat()
{
    const date=new Date();
    const options: Intl.DateTimeFormatOptions  = {
   weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const formattedDate = date.toLocaleDateString(
  "en-US",options).toUpperCase();

// dates for next 30 days
const dates=[];
for(let i=0;i<30;i++)
{
    const date=new Date();
    date.setDate(date.getDate()+i);
    dates.push(date);
}
const[isSelectedIndex,setIsSelectedIndex]=useState(0);


 const [selectedTime, setSelectedTime] =
    useState("");



  const times = [];

  const startTime = new Date();

  startTime.setHours(9);
  startTime.setMinutes(0);
  
  // time intervals for each user
  for (let i = 0; i <20; i++) {

    const time = new Date(startTime);

    time.setMinutes(
      startTime.getMinutes() + i * 10
    );

    times.push(
      time.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    );
  }


    return(
        <ScrollView className="flex-1" contentContainerStyle={{paddingBottom:100}} showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-gray-800">
              Choose Date
            </Text>
            <View className="flex flex-row items-center justify-between my-4">
                <Ionicons name="chevron-back" size={24} color={"gray"}></Ionicons>
                    <Text className="text-lg font-bold text-gray-600">
         
                         {dates[
                             isSelectedIndex
                             ].toLocaleDateString(
                             "en-US",
                                 {
                                 day: "numeric",
                                month: "long",
                                 year: "numeric",
                                 })}
              
                    </Text>
                <Ionicons name="chevron-forward" size={24} color={"gray"}></Ionicons>
            </View>
               
               <View className="flex-row flex-wrap gap-3">
                {dates.map((items,index)=>(
                    
                    <TouchableOpacity  key={index} onPress={()=>setIsSelectedIndex(index)} className={`px-3   py-3 rounded-full border ${isSelectedIndex===index?"bg-blue-600 border-gray-600" : "bg-white border-gray-200"}`}>

                        <View>
                              <Text className={`text-sm font-semibold ${isSelectedIndex===index?"text-white" : "text-gray-500"}`}>
                            {items.toLocaleDateString("en-US",{
                            weekday:"short"
                            })}
                        </Text>
                        </View>

                        <View>
                           
                            <Text className={`  text-xl font-bold mt-2 ${  isSelectedIndex===index? "text-white": "text-gray-800"}`}>
                                            {items.toLocaleDateString("en-US",{
                                             day:"numeric"
                                               })}
                                </Text>

                         </View>

                        </TouchableOpacity>

                ))}
               </View>

               <Text className="text-gray-800 font-bold text-xl my-4">Choose Time</Text>

              <View className="flex flex-row  flex-wrap"> 
                {times.map((time,index)=>(
                    <TouchableOpacity key={index} onPress={()=>setSelectedTime(time)}  className={`px-2 py-4 mb-2 ml-2 rounded-lg border ${selectedTime===time?"bg-blue-600 border-gray-600" : "bg-white border-gray-200"}`}>
                        
                        <Text>{time}</Text>

                    </TouchableOpacity>
                ))}
              </View>


        <View className="flex flex-row items-center gap-6 bg-green-50 px-4 py-3 rounded-xl">
              <Ionicons name="calendar-outline" size={28} color={"green"}></Ionicons>
          <View>
              <Text className="text-lg font-semibold text-gray-600">You Selected</Text>
            <View className="flex flex-row items-center gap-4">
             
                  <Text className="text-lg font-bold text-green-600 mt-1">
                          {dates[
                             isSelectedIndex
                             ].toLocaleDateString(
                             "en-US",
                                 {
                                 day: "numeric",
                                month: "long",
                                 year: "numeric",
                          })}
                  </Text>
                 <Text className="text-lg text-green-600 font-bold mt-1">
                   {selectedTime || "Select Time"}
                 </Text>
            </View>
          </View>
        </View>
              <TouchableOpacity className=" bg-blue-600 p-4  rounded-full items-center mt-4">
                <Text className="text-[#fff] font-bold text-lg">Continue To Confirm</Text>
              </TouchableOpacity>
              

        </ScrollView>
    )

}