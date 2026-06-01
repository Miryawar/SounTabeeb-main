
import { View,Text,Image } from "react-native";
import { assets } from "@/assets/assets";
import DropdownMenu from "./DropdownMenu";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "./SearchBar";
import {useUser} from "@/context/UserContext";
export default function Header()
{
  const { profileImage } = useUser();
  return(
    <View>
      <View className="flex flex-row items-center ">
        <DropdownMenu></DropdownMenu>
        <Ionicons name="notifications-outline" size={25} color="black"></Ionicons>
      </View>
      <SearchBar></SearchBar>

   
    </View>
  )
}