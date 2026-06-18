import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function DateSelecting() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all dates for current month
  const getMonthDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dates = [];

    // Get today for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determine if we're in current month
    const isCurrentMonth =
      year === today.getFullYear() && month === today.getMonth();

    // Build dates array
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      // If current month, skip past dates
      if (isCurrentMonth && date < today) {
        continue;
      }

      dates.push({
        date,
        day: date
          .toLocaleDateString("en-IN", { weekday: "short" })
          .toUpperCase(),
        dateNum: day,
      });
    }

    return dates;
  };

  const monthDates = getMonthDates();

  // Check if month is within allowed range (current month to +2 months)
  const isMonthInRange = (checkMonth: Date) => {
    const today = new Date();
    const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // Max month is current month + 2
    const maxMonthDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);

    return checkMonth >= currentMonthDate && checkMonth < maxMonthDate;
  };

  // Navigate months
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    newMonth.setDate(1);

    if (isMonthInRange(newMonth)) {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    newMonth.setDate(1);

    if (isMonthInRange(newMonth)) {
      setCurrentMonth(newMonth);
    }
  };

  // Generate time slots
  const getTimeSlots = () => {
    const slots = [];
    let start = new Date();
    start.setHours(9, 0, 0, 0);

    const end = new Date();
    end.setHours(17, 0, 0, 0);

    while (start <= end) {
      slots.push(new Date(start));
      start.setMinutes(start.getMinutes() + 10);
    }
    return slots;
  };

  const timeSlots = getTimeSlots();

  // Calculate if buttons can navigate
  const prevMonthDate = new Date(currentMonth);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  prevMonthDate.setDate(1);
  const canGoPrevious = isMonthInRange(prevMonthDate);

  const nextMonthDate = new Date(currentMonth);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  nextMonthDate.setDate(1);
  const canGoNext = isMonthInRange(nextMonthDate);

  return (
    <View className="mt-6">
      <Text className="mb-4 text-gray-800 font-bold text-2xl">Choose Date</Text>

      {/* Month Navigation Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity
          onPress={handlePreviousMonth}
          disabled={!canGoPrevious}
          className={`p-3 rounded-full ${
            canGoPrevious ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={canGoPrevious ? "white" : "gray"}
          />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-gray-800 min-w-40 text-center">
          {currentMonth.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity
          onPress={handleNextMonth}
          disabled={!canGoNext}
          className={`p-3 rounded-full ${
            canGoNext ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={canGoNext ? "white" : "gray"}
          />
        </TouchableOpacity>
      </View>

      {/* Dates Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {monthDates.length > 0 ? (
          monthDates.map((item, index) => {
            const isSelected =
              selectedDate &&
              selectedDate.toDateString() === item.date.toDateString();

            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(item.date)}
                className={`w-16 h-16 rounded-lg items-center justify-center border-2 ${
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? "text-white" : "text-gray-500"
                  }`}
                >
                  {item.day}
                </Text>
                <Text
                  className={`text-xl font-bold mt-1 ${
                    isSelected ? "text-white" : "text-gray-800"
                  }`}
                >
                  {item.dateNum}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text className="text-center text-gray-600 w-full">
            No available dates in this month
          </Text>
        )}
      </View>

      {/* Time Slots */}
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
              className={`px-4 py-3 rounded-xl border ${
                isSelected
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-200"
              }`}
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
