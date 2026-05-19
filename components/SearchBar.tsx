import { Ionicons } from "@expo/vector-icons";
import { ScrollView ,View,Text,Image, TextInput,TouchableOpacity} from "react-native";
import { useState } from "react";
import { doctors } from "@/assets/assets";
import { useRouter } from "expo-router";

export default function SearchBar()
{
    const router=useRouter();
      // Search text state
      const [search, setSearch] = useState("");
    
     
     const [showOptions, setShowOptions] = useState(false);

    const [searchType, setSearchType] = useState("name");
    const filteredDoctors = doctors.filter((item) => {

  if (searchType === "name") {
    return item.name
      .toLowerCase()
      .includes(search.toLowerCase());
  }

  if (searchType === "specialty") {
    return item.speciality
      .toLowerCase()
      .includes(search.toLowerCase());
  }

  return false;
});
     
    return(

    
    <ScrollView>
        {/* search icon */}
        <View className="flex flex-row justify-between items-center px-4 py-3 bg-[#fff] rounded-full  shadow mt-6  mx-4">
            <Ionicons name="search" size={24} color={"blue"}></Ionicons>
            <TextInput 
            // placeholder="Search ur favourite doctor" 
              placeholder={`Search by ${searchType}`}
            value={search}
            onChangeText={setSearch}
              className="flex-1 ml-3"
            />
            <TouchableOpacity onPress={()=>setShowOptions(!showOptions)}>
              <Ionicons name="options" size={22} color="#2563EB" />
              </TouchableOpacity>
        </View>

        {/* search reslult */}
       {search.trim()!==""&&(
        <View>
             {filteredDoctors.map((doctor) => (
      <View
        key={doctor._id}
        className="bg-gray-200 p-4 m-4 mb-3 rounded-2xl shadow"
      >
        <TouchableOpacity onPress={()=>router.push(`/appointment/${doctor._id}`)}>
        <Image source={doctor.image}  className=" w-24 h-24 rounded-full bg-blue-50 " resizeMode="contain">

        </Image>
        <Text className="text-lg font-bold">
          {doctor.name}
        </Text>
        <Text className="text-gray-500 mt-1">
  {doctor.speciality}
</Text>
</TouchableOpacity>
      
      </View>
    ))}

        </View>
       )}

       {showOptions && (
  <View className="bg-white mx-4 mt-2 rounded-2xl p-4 shadow">

    <TouchableOpacity
      onPress={() => {
        setSearchType("name");
        setShowOptions(false);
      }}
      className="py-2"
    >
      <Text className="text-lg">
        Search by Name
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => {
        setSearchType("specialty");
        setShowOptions(false);
      }}
      className="py-2"
    >
      <Text className="text-lg">
        Search by Specialty
      </Text>
    </TouchableOpacity>

  </View>
)}
     </ScrollView>
    );
}