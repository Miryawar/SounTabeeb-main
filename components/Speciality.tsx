import {Text,View,Image, Pressable } from "react-native";
import {assets, specialityData } from "@/assets/assets";
import { useRouter } from "expo-router";
// import { Router } from "expo-router";
export const Speciality=()=>
   
{
       const router = useRouter(); // ✅ IMPORTANT

    return(
        <View className="flex px-6 mt-6">
          <View className="flex gap-3"> 
            <Text className="text-gray-600 text-3xl text-center font-bold"  >Find by Speciality</Text>
            <Text className="text-gray-700 leading-6">Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</Text>
            </View>
           <View className=" flex-row flex-wrap justify-between mt-6 ">
        {specialityData.map((item, index) => (
          <View key={index} className=" w-[30%] items-center mb-4">

         <Pressable  
            onPress={() =>
              router.push(`/doctors/${encodeURIComponent(item.speciality)}`)
            }>
        
            
            <Image
              source={item.image}
              className="w-16 h-16 mb-2 rounded-full self-center"
            />
            </Pressable>

            <Text className="text-center text-sm" numberOfLines={1}
                     >{item.speciality}</Text>

          </View>
        ))}
      </View>

        </View>
    )
}