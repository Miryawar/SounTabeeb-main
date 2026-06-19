import { apiGet, apiPost } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

type WorkingHour = {
  day: string;
  start: string;
  end: string;
  active: boolean;
};

type Leave = {
  from: string;
  to: string;
  reason?: string;
};

type Doctor = {
  _id: string;
  workingHours?: WorkingHour[];
  leaves?: Leave[];
};

const getDayName = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long" });

const isDateOnLeave = (date: Date, leaves: Leave[] = []) => {
  return leaves.some((leave) => {
    if (!leave?.from || !leave?.to) return false;
    const from = new Date(leave.from);
    const to = new Date(leave.to);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return date >= from && date <= to;
  });
};

const getWorkingHoursForDate = (
  date: Date,
  workingHours: WorkingHour[] = [],
) => {
  const dayName = getDayName(date);
  return workingHours.find((hour) => hour.day === dayName) || null;
};

const getAvailableTimeSlots = (
  date: Date,
  workingHours: WorkingHour[] = [],
  currentTimes: string[] = [],
) => {
  const schedule = getWorkingHoursForDate(date, workingHours);
  if (!schedule || !schedule.active) return [];

  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = parseTime(schedule.start);
  const endMinutes = parseTime(schedule.end);
  return currentTimes.filter((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const slotMinutes = hours * 60 + minutes;
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
};

export default function DateFormat({
  doctor,
  paymentInfo,
}: {
  doctor?: Doctor;
  paymentInfo?: any;
}) {
  const params = useGlobalSearchParams();
  const routeDoctorId = Array.isArray(params.doctorId)
    ? params.doctorId[0]
    : params.doctorId;
  const finalDoctorId = doctor?._id || routeDoctorId || "";
  const date = new Date();

  // dates for next 6 months (approx 180 days)
  const dates: Date[] = [];
  for (let i = 0; i < 180; i++) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + i);
    nextDate.setHours(0, 0, 0, 0);
    dates.push(nextDate);
  }
  const isDateSelectable = (date: Date) => {
    if (!doctor) return false;
    if (isDateOnLeave(date, doctor.leaves || [])) return false;
    const schedule = getWorkingHoursForDate(date, doctor.workingHours || []);
    return Boolean(schedule && schedule.active);
  };

  const [isSelectedIndex, setIsSelectedIndex] = useState(() => {
    const firstAvailable = dates.findIndex(isDateSelectable);
    return firstAvailable >= 0 ? firstAvailable : 0;
  });

  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const selectedDate = new Date(dates[isSelectedIndex]);
  const selectedDateStr = selectedDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!finalDoctorId || !selectedDateStr) {
        setBookedSlots([]);
        return;
      }

      try {
        const res = await apiGet(
          `/api/doctors/${finalDoctorId}/availability?date=${encodeURIComponent(
            selectedDateStr,
          )}`,
        );
        if (!res.ok) {
          const error = await res.json();
          console.warn("Doctor availability fetch failed:", error?.message);
          setBookedSlots([]);
          return;
        }

        const data = await res.json();
        setBookedSlots(Array.isArray(data.bookedSlots) ? data.bookedSlots : []);
      } catch (err) {
        console.warn("Doctor availability fetch error:", err);
        setBookedSlots([]);
      }
    };

    fetchAvailability();
  }, [finalDoctorId, selectedDateStr]);

  useEffect(() => {
    if (selectedTime && bookedSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [bookedSlots, selectedTime]);

  const router = useRouter();

  const currentTimes: string[] = [];
  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);

  for (let i = 0; i < 24 * 6; i += 1) {
    const time = new Date(startTime);
    time.setMinutes(i * 10);
    currentTimes.push(
      time.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    );
  }

  const times = getAvailableTimeSlots(
    selectedDate,
    doctor?.workingHours,
    currentTimes,
  ).filter((time) => !bookedSlots.includes(time));

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-xl font-bold text-gray-800">Choose Date</Text>
      <View className="flex flex-row items-center justify-between my-4">
        <Ionicons name="chevron-back" size={24} color={"gray"}></Ionicons>
        <Text className="text-lg font-bold text-gray-600">
          {dates[isSelectedIndex].toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Ionicons name="chevron-forward" size={24} color={"gray"}></Ionicons>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {dates.map((items, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => isDateSelectable(items) && setIsSelectedIndex(index)}
            disabled={!isDateSelectable(items)}
            className={`px-3 py-3 rounded-full border ${isSelectedIndex === index ? "bg-blue-600 border-gray-600" : isDateSelectable(items) ? "bg-white border-gray-200" : "bg-gray-100 border-gray-200 opacity-50"}`}
          >
            <View>
              <Text
                className={`text-sm font-semibold ${isSelectedIndex === index ? "text-white" : "text-gray-500"}`}
              >
                {items.toLocaleDateString("en-IN", {
                  weekday: "short",
                })}
              </Text>
            </View>

            <View>
              <Text
                className={`  text-xl font-bold mt-2 ${isSelectedIndex === index ? "text-white" : "text-gray-800"}`}
              >
                {items.toLocaleDateString("en-IN", {
                  day: "numeric",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-gray-800 font-bold text-xl my-4">Choose Time</Text>

      <View className="flex flex-row  flex-wrap">
        {times.length === 0 ? (
          <Text className="text-gray-500 px-4 py-3">
            No available time slots for this date. Please select another date.
          </Text>
        ) : (
          times.map((time, index) => {
            const isSelected = selectedTime === time;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedTime(time)}
                disabled={isSelected}
                className={`px-2 py-4 mb-2 ml-2 rounded-lg border ${isSelected ? "bg-blue-600 border-gray-600" : "bg-white border-gray-200"}`}
              >
                <Text className={isSelected ? "text-white" : "text-gray-800"}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View className="flex flex-row items-center gap-6 bg-green-50 px-4 py-3 rounded-xl">
        <Ionicons name="calendar-outline" size={28} color={"green"}></Ionicons>
        <View>
          <Text className="text-lg font-semibold text-gray-600">
            You Selected
          </Text>
          <View className="flex flex-row items-center gap-4">
            <Text className="text-lg font-bold text-green-600 mt-1">
              {dates[isSelectedIndex].toLocaleDateString("en-IN", {
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
      <TouchableOpacity
        onPress={async () => {
          if (!finalDoctorId) return Alert.alert("Missing doctor id");
          if (!selectedTime) return Alert.alert("Please select a time");
          const dateObj = new Date(dates[isSelectedIndex]);
          const [hourStr, minuteStr] = selectedTime.split(":");
          dateObj.setHours(Number(hourStr), Number(minuteStr), 0, 0);
          try {
            if (!paymentInfo) {
              return Alert.alert(
                "Payment Required",
                "Payment information is missing. Please complete the payment first.",
              );
            }
            // send date as YYYY-MM-DD (day only) and a discrete `slot` identifier
            const dayOnly = dates[isSelectedIndex].toISOString().split("T")[0];
            const slotHour = dateObj.getHours();
            const slotMinute = dateObj.getMinutes();
            const slotStr = `${String(slotHour).padStart(2, "0")}:${String(slotMinute).padStart(2, "0")}`;
            const body: any = {
              doctorId: finalDoctorId,
              date: dayOnly,
              slot: slotStr,
            };
            if (paymentInfo) {
              body.paymentInfo = paymentInfo;
            }
            const res = await apiPost("/api/appointments", body);
            const data = await res.json();
            if (!res.ok) {
              const reason = data?.message || "Booking failed";
              router.replace(
                `/payment-status?status=failed&failureReason=${encodeURIComponent(
                  reason,
                )}`,
              );
              return;
            }
            router.replace(
              `/payment-status?status=success&amount=${encodeURIComponent(
                paymentInfo?.amount || "0",
              )}&doctorName=${encodeURIComponent(
                doctor?.name || "Doctor",
              )}&transactionRef=${encodeURIComponent(
                paymentInfo?.txnRef || paymentInfo?.transactionRef || "",
              )}`,
            );
          } catch (err: any) {
            console.warn(err);
            router.replace(
              `/payment-status?status=failed&failureReason=${encodeURIComponent(
                err?.message || "Server error",
              )}`,
            );
          }
        }}
        className=" bg-blue-600 p-4  rounded-full items-center mt-4"
      >
        <Text className="text-[#fff] font-bold text-lg">
          Continue To Confirm
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
