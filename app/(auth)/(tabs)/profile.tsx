// import {View,Text,Image,ScrollView,TouchableOpacity, TextInput} from "react-native";
// import { assets } from "@/assets/assets";
// import { useState } from "react";
// import * as ImagePicker from "expo-image-picker";
// import { Ionicons } from "@expo/vector-icons";

// import { ScrollView } from "react-native";


// export default function Profile()
// {
//     const [userDetail, setUserDetail] = useState(
//         {
//             name:"Rather Suhail",
//             image:assets.profile_pic,
//             email:"saleemrather3700@gmail.com",
//             phone:'7051141199',
//             address:'srinagar jammu and kashmir',
//             gender:'Male',
//             dob:"24-03-2001"
//         })
//     const [isEditing,setIsEditing]=useState(false);

//       // 📸 Pick Image
//   const pickImage = async () => {
//     const permission =
//       await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       alert("Permission required to access gallery!");
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setUserDetail({
//         ...userDetail,
//         image: { uri: result.assets[0].uri },
//       });
//     }
//   };

//     return(
//         <View className="px-6 py-24">
//             {/* Profile Image */}
//            <TouchableOpacity onPress={isEditing ? pickImage : null}>
//             <View className="relative">
            
//             <Image source={userDetail.image} className="w-40 h-40 rounded-full" resizeMode="cover"></Image>
//              {/* Text overlay */}
//       {isEditing && (
//         <View className="absolute bottom-1 self-center left-1 text-center text-white bg-blue-500 
//           px-3 py-1 rounded-full">
//            <Ionicons name="camera" size={14} color="white"  />
//         </View>
//       )}
//     </View>
//             </TouchableOpacity>

//              {
//                 isEditing?
//                 (
//                     <TextInput
//                     className="border border-gray-300 rounded-lg px-2 py-1 mt-5"
//                     value={userDetail.name}
//                     onChangeText={(text)=>setUserDetail({...userDetail,name:text})}
                    
//                     />

//                 ):
//                 (
//                       <Text className="text-gray-600 font-bold text-xl my-4">{userDetail.name}</Text>  
                    
//                 )
//              }
//               <View className="h-px bg-gray-900 my-3"></View>

//               <Text className="text-gray-600 font-bold text-lg my-3">Contact information</Text>
//               <View className="gap-3">
//               <View className="flex-row gap-12 items-center">
//                  <Text className="text-gray-600 text-lg w-20" >Email id:</Text>
//                  {isEditing?
//                 (
//                     <TextInput  
//                     className="border border-gray-300 rounded-lg px-2 py-1"
//                     value={userDetail.email}
//                     onChangeText={(text) =>
//                           setUserDetail({ ...userDetail, email: text })
//       }/ >

//                 ) :
//                 (
//                     <Text className="text-gray-600 text-lg flex-1">{userDetail.email}</Text>
//                 )
//                 }
                 
//               </View>
             
//              <View className="flex-row gap-12 items-center">
//               <Text className="text-gray-600 text-lg w-20">Phone:</Text>

//               { isEditing?
//               (
//                 <TextInput
//                   className="border border-gray-300 rounded-lg px-2 py-1"
//                   value={userDetail.phone}
//                   onChangeText={(text)=>setUserDetail({...userDetail,phone:text})}/>

//               )
//               :
//               (
//               <Text className="text-gray-600 text-lg flex-1">{userDetail.phone}</Text>
//               )
// }
//               </View>

//               <View className="flex-row gap-12  items-center">
//                   <Text className="text-gray-600 text-lg w-20">Address:</Text>
//                   {
//                     isEditing?
//                     (
//                         <TextInput
//                         className="border border-gray-300 rounded-lg px-2 py-1"
//                         value={userDetail.address}
//                         onChangeText={(text)=>setUserDetail({...userDetail,address:text})}

//                         />
//                     ):
//                     (
//                          <Text className="text-gray-600 text-lg flex-1">{userDetail.address}</Text>
//                     )

//                   }
                 


//               </View>
//               </View>
            
//               <Text className="text-gray-600 font-bold text-lg my-3">Basic inforamtion</Text>
//               <View className="gap-3">
//               <View className="flex-row gap-12 items-center">
//                  <Text className="text-gray-600 text-lg w-20">Gender:</Text>
//                   <Text className="text-gray-600 text-lg flex-1">{userDetail.gender}</Text>
                
//               </View>
//              <View className="flex-row gap-12 items-center">
//               <Text className="text-gray-600 text-lg w-20">D.O.B:</Text>
//               <Text className="text-gray-600 text-lg flex-1"> {userDetail.dob}</Text>
//               </View>
//               </View>
//               <View className="items-center">
//                 {
//                     isEditing?
//                     (
//               <TouchableOpacity onPress={()=>setIsEditing(false)} className="border rounded-full border-blue-600  px-8 py-2 my-6 w-32" >
//                 <Text  className="text-center font-bold">Save changes</Text>
//               </TouchableOpacity>
//                     ):
//               (
//               <TouchableOpacity onPress={()=>setIsEditing(true)} className="border rounded-full border-blue-600  px-8 py-2 my-6 w-32" >
//                 <Text  className="text-center font-bold">Edit</Text>
//               </TouchableOpacity>
//               )
// }
//               </View>
//     </View>
    
//     )
// }

import {View,Text,Image,ScrollView,TouchableOpacity, TextInput} from "react-native";
import { assets } from "@/assets/assets";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

// import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";

export default function Profile()
{
   const router=useRouter();

 
    const [userDetail, setUserDetail] = useState(
        {
            name:"Yawar mir",
            image:assets.profilepic,
            email:"miryawer990@gmail.com",
            phone:'6005647721',
            address:'srinagar jammu and kashmir',
            gender:'Male',
            dob:"09-11-2001"
        });
        // const { profileImage } = useUser();
        const {
  profileImage,
  userName,
  updateUserName,
} = useUser();
        const [isEditing,setIsEditing]=useState(false);
  return(
    <SafeAreaView style={{padding:16}}>
    <View>
      <Text className=" text-gray-800 text-3xl font-bold mb-4">My Profile</Text>
      
      <View className="flex flex-row items-center gap-4 bg-[#fff] px-4 py-8 rounded-;">
        <Image 
          source={
    profileImage
      ? { uri: profileImage }
      : userDetail.image
  }
        className=" w-32 h-32 rounded-full" resizeMode="contain"/>

        <View>
          {/* <Text className="text-2xl font-bold text-gray-800">{userDetail.name}</Text> */}
           {isEditing ? (
        <TextInput
          // value={userDetail.name}
                value={userName || userDetail.name}
          onChangeText={(text) =>
            setUserDetail({
              ...userDetail,
              name: text,
            })
          }
          className="border border-gray-300 rounded-xl p-4 mb-4"
        />
      ) : (
        <Text className="text-gray-700 text-2xl mb-4">
          {/* {userDetail.name} */}
            {userName ? userName : userDetail.name}
        </Text>
      )}
          {/* <Text className="text-medium font-bold text-gray-600">{userDetail.email}</Text> */}
         
              {isEditing ? (
        <TextInput
          value={userDetail.email}
          onChangeText={(text) =>
            setUserDetail({
              ...userDetail,
              email: text,
            })
          }
          className="border border-gray-300 rounded-xl p-4 mb-4"
        />
      ) : (
        <Text className="text-medium font-bold text-gray-600 mb-2">
          {userDetail.email}
        </Text>
      )}


          {/* <Text className="text-lg font-bold text-gray-600">{userDetail.phone}</Text> */}
          {
            isEditing?
            (
              <TextInput  
              value={userDetail.phone}
              onChangeText={(text)=>setUserDetail({...userDetail,phone:text,})}
              className="border border-gray-300 rounded-xl p-4 mb-4">

              </TextInput>
            )
            :
            (
              <Text className="text-lg font-bold text-gray-600 mb-2">{userDetail.phone}</Text>
            )
          }
          
          <TouchableOpacity onPress={()=>setIsEditing(!isEditing)} className="flex flex-row items-center gap-2 bg-blue-50 rounded-xl px-8 py-2 self-center">
            <Ionicons name="pencil-sharp" size={16} color={"blue"}/>
            <Text className="text-center text-blue-600">{isEditing?"Save Changes":
            "Edit Profile"}</Text>
            </TouchableOpacity>
        </View>

        </View>
    </View>


      
    <ScrollView>


      
     <View className="mb-4 py-8">
      <TouchableOpacity onPress={()=>router.push("/profile-details")}  className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4">
             <Text   className="text-lg font-medium text-gray-600">Personal Details</Text>
              <Ionicons  name="chevron-forward-sharp" size={24} color={"gray"}></Ionicons>
        </TouchableOpacity>

        <Text className="text-dark text-lg font-bold mb-4">Support & More</Text>

        <TouchableOpacity onPress={()=>router.push("/contact")} className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg mb-4">
             <Text className="text-lg font-medium text-gray-600">Contact Us</Text>
             <Ionicons  name="chevron-forward-sharp" size={24} color={"gray"}></Ionicons>
        </TouchableOpacity>
     
        <TouchableOpacity onPress={()=>router.push("/about")}  className="flex flex-row items-center justify-between bg-gray-200 px-2 py-3 rounded-lg">
             <Text  className="text-lg font-medium text-gray-600">About Us</Text>
              <Ionicons  name="chevron-forward-sharp" size={24} color={"gray"}></Ionicons>
        </TouchableOpacity>
     
    </View>
    </ScrollView>
     <TouchableOpacity onPress={()=>router.push("/(auth)/sign-in")} className="flex flex-row items-center gap-3 justify-center bg-red-100 px-4 py-2 rounded-lg">
          <Ionicons name="log-out-outline" size={24} color={"red"}></Ionicons>
          <Text className="text-red-600 text-xl font-bold">Logout</Text>
        </TouchableOpacity>

    </SafeAreaView>

  );
}