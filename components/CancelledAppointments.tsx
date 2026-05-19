import { View ,Text,Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doctors } from "@/assets/assets";

export default function CancelledAppointments(){
    return(
        <View>
            <View className="flex flex-row items-center justify-center gap-4 bg-red-100 p-4  mb-8">
                <Ionicons name="close" color={"red"} size={32} />
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-700">
                    Your Cancelled Appointments
                  </Text>
                  <Text className=" text-medium font-medium text-gray-600">
                    These appointments were cancelled by you or the doctor.
                  </Text>
                </View>
            </View>
           <View> 
            {doctors.slice(7,10).map((item,index)=>(
              <View key={index} className=" bg-white rounded-lg mb-8 px-2 py-12 border-gray-200 gap-8">
                {/* image section */}
                  <View className="flex flex-row items-center gap-8">
                   <View>
                    <Image source={item.image} resizeMode="contain"  className="rounded-full w-32 h-32 bg-blue-50"/>
                    </View>

                    {/* detail section */}

                   <View className="flex-1">
                     <Text className="text-gray-800 text-xl font-bold mb-1">
                             {item.name}
                      </Text>

                      <Text className="text-gray-600  font-medium mb-1">
                                {item.speciality}
                       </Text>

                          <View className="flex flex-row items-center gap-2">

                             <Ionicons name="location-outline" size={24} color={"gray"} />
                                <Text>{item.address.line1}</Text>
                          </View>

                  </View>

              </View>
                    {/* delete section */}
                  <View className="flex flex-row items-center gap-2 bg-gray-100 rounded-full self-end px-8 py-2 ">
                        <Ionicons name="close-outline" size={32} color={"red"} />
                         <Text className="text-red-600 text-xl font-bold  text-center">
                                  Cancelled
                          </Text>
                          
                  </View>

               
             
            </View>
                
                
            ))}
             
           </View>
              
         
              

        </View>
    );
}