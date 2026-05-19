import { SafeAreaView } from "react-native-safe-area-context";
import {View,Image,Text} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function _layout()
{
    return(

            <Tabs   screenOptions={{ headerShown:false,
                tabBarActiveTintColor:"green",
                tabBarInactiveTintColor:"gray"

            }}>
           
                <Tabs.Screen
                name="home"
                options={{
                    title:"Home",
                    tabBarIcon:({size,color})=>(
                        <Ionicons name="home" size={24} color={color}></Ionicons>
                    )
                }}
                >

                </Tabs.Screen>
               
                <Tabs.Screen
                name="appointment"
                options={{
                    title:"Appointment",
                    tabBarIcon:({size,color})=>(
                        <Ionicons name="calendar" size={size} color={color}></Ionicons>
                    )
                }}
                >

                </Tabs.Screen>
                
                <Tabs.Screen
                name="chat"
                options={{
                    title:"Chat",
                    tabBarIcon:({size,color})=>(
                        <Ionicons name="chatbox"  size={24} color={color}></Ionicons>
                    )
                }}
                >

                </Tabs.Screen>

                 <Tabs.Screen
                name="profile"
                options={{
                    title:"Profile",
                    tabBarIcon:({size,color})=>(
                        <Ionicons name="person" size={24} color={color}></Ionicons>
                    )
                }}
                >

                </Tabs.Screen>
            </Tabs>


    )
}