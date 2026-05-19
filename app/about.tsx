import Footer from "@/components/Footer";
import { View, Text, Image, ScrollView } from "react-native";
import { assets } from "@/assets/assets";
const chooseData = [
  {
    id: 1,
    title: "EFFICIENCY:",
    description:
      "Streamlined appointment scheduling that fits into your busy lifestyle.",
  },
  {
    id: 2,
    title: "CONVENIENCE:",
    description:
      "Access to a network of trusted healthcare professionals in your area.",
  },
  {
    id: 3,
    title: "PERSONALIZATION:",
    description:
      "Tailored recommendations and reminders to help you stay on top of your health.",
  },
];
export default function About() {
  return (
    <ScrollView  contentContainerStyle={{ paddingBottom: 120 }}>
      <View className="mt-10">
        <Text className=" text-gray-600 text-2xl  text-center font-bold mb-2">About Us</Text>
        <View className="px-6 mb-8 mt-8">
          <Image
            source={assets.about_image}
            className="w-full h-96 rounded-xl "
            resizeMode="cover"
          ></Image>
        </View>

        <View className="flex gap-4 px-6">
          <Text className="text-gray-500 ">
            Welcome to Prescripto, your trusted partner in managing your
            healthcare needs conveniently and efficiently. At Prescripto, we
            understand the challenges individuals face when it comes to
            scheduling doctor appointments and managing their health records.
          </Text>
          <Text className="text-gray-500 leading-5">
            Prescripto is committed to excellence in healthcare technology. We
            continuously strive to enhance our platform, integrating the latest
            advancements to improve user experience and deliver superior
            service. Whether you're booking your first appointment or managing
            ongoing care, Prescripto is here to support you every step of the
            way.
          </Text>
          <Text className="text-xl font-bold text-gray-700">OUR VISION</Text>
          <Text className="text-gray-500">
            Our vision at Prescripto is to create a seamless healthcare
            experience for every user. We aim to bridge the gap between patients
            and healthcare providers, making it easier for you to access the
            care you need, when you need it.
          </Text>
        </View>

        <View className="px-6 mt-5">
  <Text className="text-gray-500 text-lg">
    WHY <Text className="font-bold text-gray-500">
          CHOOSE US
    </Text>
  </Text>
</View>
        <View className=" flex-1 gap-3 p-5">
          {chooseData.map((data, index) => (
            <View
              key={index}
              className="bg-white p-5 rounded-4xl shadow-md border border-gray-100 gap-6 "
            >
              <Text  className="text-gray-500  font-bold  text-xl mb-2">
                {data.title}
              </Text>
              <Text className="text-gray-500 text-lg leading-8">
                {data.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer section */}

        <Footer></Footer>
      </View>
    </ScrollView>
  );
}
