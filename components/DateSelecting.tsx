import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";

export default function DateSelecting() {
  const scrollRef = useRef<ScrollView | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  // Generate next 30  days
  const dates = Array.from({ length: 30 }, (_, index) => {
    // generates cyrrent date
    const date = new Date();

    date.setDate(date.getDate() + index);

    return {
      day: date
        .toLocaleDateString("en-IN", {
          weekday: "short",
        })
        .toUpperCase(),

      date: date.getDate(),

      fullDate: date.toISOString(),
    };
  });

  // ⏰ Generate 30-minute time slots (9 AM - 5 PM)
  const generateTimeSlots = () => {
    const slots = [];

    let start = new Date();
    start.setHours(9, 0, 0, 0); // 9:00 AM

    let end = new Date();
    end.setHours(17, 0, 0, 0); // 5:00 PM

    while (start <= end) {
      slots.push(new Date(start));
      start.setMinutes(start.getMinutes() + 10);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const [scrollX, setScrollX] = useState(0);

  /// Scroll left
  const scrollLeft = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;

      setSelectedIndex(newIndex);

      scrollRef.current?.scrollTo({
        x: Math.max(newIndex * 90 - 150, 0),
        animated: true,
      });
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (selectedIndex < dates.length - 1) {
      const newIndex = selectedIndex + 1;

      setSelectedIndex(newIndex);

      scrollRef.current?.scrollTo({
        x: Math.max(newIndex * 90 - 150, 0),
        animated: true,
      });
    }
  };

  return (
    <View className="mt-6">
      <Text className="mb-4 text-gray-800 font-bold text-2xl">Choose Date</Text>
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={scrollLeft}
          className="bg-gray-100 p-3 rounded-full"
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-800">
          {new Date(dates[selectedIndex].fullDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity
          onPress={scrollRight}
          className="bg-gray-100 p-3 rounded-full"
        >
          {/* <Ionicons
            name="chevron-forward"
            size={24}
            color="black"
          /> */}
        </TouchableOpacity>
      </View>
      <View className="flex  flex-row flex-wrap gap-3 ">
        {dates.map((item, index) => {
          const isSelected = selectedIndex === index;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedIndex(index)}
              className={` w-16 h-16 rounded-lg  items-center justify-center border
                 ${isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"}`}
            >
              <Text
                className={`text-sm font-semibold ${isSelected ? "text-white" : "text-gray-500"} `}
              >
                {item.day}
              </Text>

              <Text
                className={`  text-xl font-bold mt-2 ${isSelected ? "text-white" : "text-gray-800"}`}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="mt-6 mb-3 text-gray-800 font-bold text-xl">
        Available Time
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {timeSlots.map((time, index) => {
          const isSelected = selectedTime?.getTime() === time.getTime();

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedTime(time)}
              className={`
                   px-4 py-3 rounded-xl border
                   ${
                     isSelected
                       ? "bg-blue-600 border-blue-600"
                       : "bg-white border-gray-200"
                   }
                 `}
            >
              <Text
                className={`font-medium ${
                  isSelected ? "text-white" : "text-gray-700"
                }`}
              >
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
