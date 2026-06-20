import { apiGet, apiPost } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useMemo } from "react";
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
  name?: string;
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
  
  // Define Lunch Break: 1:00 PM (13:00) to 2:00 PM (14:00)
  const lunchStartMinutes = parseTime("13:00");
  const lunchEndMinutes = parseTime("14:00");

  return currentTimes.filter((time) => {
    const slotMinutes = parseTime(time);
    
    // 1. Check if the slot is within the doctor's general working hours
    const isWithinWorkingHours = slotMinutes >= startMinutes && slotMinutes < endMinutes;
    
    // 2. Check if the slot falls inside the lunch break window
    const isLunchBreak = slotMinutes >= lunchStartMinutes && slotMinutes < lunchEndMinutes;
    
    // 3. Return true ONLY if it's a working hour AND not during lunch
    return isWithinWorkingHours && !isLunchBreak;
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
  const router = useRouter();

  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  // NEW: Button loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Calculate exactly 90 days from today
  const maxAllowedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    d.setHours(23, 59, 59, 999); // End of the 90th day
    return d;
  }, []);

  const isDateSelectable = (date: Date) => {
    if (!doctor) return false;
    // NEW: Block selection if the date is beyond 90 days
    if (date > maxAllowedDate) return false; 
    
    if (isDateOnLeave(date, doctor.leaves || [])) return false;
    const schedule = getWorkingHoursForDate(date, doctor.workingHours || []);
    return Boolean(schedule && schedule.active);
  };

  const calendarDays = useMemo(() => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [displayedMonth]);

  useEffect(() => {
    if (!selectedDate && calendarDays.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstAvailable = calendarDays.find(
        (d) => d !== null && d >= today && isDateSelectable(d)
      );
      if (firstAvailable) setSelectedDate(firstAvailable);
    }
  }, [calendarDays, selectedDate, doctor]);

  const selectedDateStr = useMemo(() => {
    if (!selectedDate) return null;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!finalDoctorId || !selectedDateStr) {
        setBookedSlots([]);
        setHasExistingBooking(false);
        return;
      }

      try {
        const res = await apiGet(
          `/api/doctors/${finalDoctorId}/availability?date=${encodeURIComponent(
            selectedDateStr,
          )}`,
        );
        if (!res.ok) {
          setBookedSlots([]);
          setHasExistingBooking(false);
          return;
        }

        const data = await res.json();
        setBookedSlots(Array.isArray(data.bookedSlots) ? data.bookedSlots : []);
        setHasExistingBooking(Boolean(data.hasExistingBooking));
      } catch (err) {
        setBookedSlots([]);
        setHasExistingBooking(false);
      }
    };

    fetchAvailability();
  }, [finalDoctorId, selectedDateStr]);

  useEffect(() => {
    setSelectedTime("");
  }, [selectedDateStr]);

  const currentTimes: string[] = useMemo(() => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return times;
  }, []);

  const times = useMemo(() => {
    if (!selectedDate) return [];
    
    const now = new Date();
    const currentMinutesNow = now.getHours() * 60 + now.getMinutes();
    const isTodaySelected = selectedDate.toDateString() === now.toDateString();

    return getAvailableTimeSlots(
      selectedDate,
      doctor?.workingHours,
      currentTimes,
    ).filter((time) => {
      // NEW: We no longer filter out booked slots here so we can render them disabled
      if (isTodaySelected) {
        const [sh, sm] = time.split(":").map(Number);
        return sh * 60 + sm > currentMinutesNow; 
      }
      return true;
    });
  }, [selectedDate, doctor, currentTimes]);

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  const canGoBack = 
    displayedMonth.getFullYear() > todayDate.getFullYear() || 
    (displayedMonth.getFullYear() === todayDate.getFullYear() && displayedMonth.getMonth() > todayDate.getMonth());

  // NEW: Calculate if the displayed month is before the month of the max allowed date
  const canGoForward = 
    displayedMonth.getFullYear() < maxAllowedDate.getFullYear() || 
    (displayedMonth.getFullYear() === maxAllowedDate.getFullYear() && displayedMonth.getMonth() < maxAllowedDate.getMonth());

  const handlePrevMonth = () => {
    if (!canGoBack) return;
    setDisplayedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (!canGoForward) return; // NEW: Stop navigation if limit reached
    setDisplayedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-xl font-bold text-gray-800">Choose Date</Text>
      
      <View className="flex flex-row items-center justify-between my-4 px-2">
        <TouchableOpacity onPress={handlePrevMonth} disabled={!canGoBack}>
          <Ionicons name="chevron-back" size={28} color={canGoBack ? "#4B5563" : "#D1D5DB"} />
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-gray-700">
          {displayedMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
        
        <TouchableOpacity onPress={handleNextMonth} disabled={!canGoForward}>
          <Ionicons 
            name="chevron-forward" 
            size={28} 
            color={canGoForward ? "#4B5563" : "#D1D5DB"} 
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-2">
        {weekDays.map(day => (
          <Text key={day} className="flex-1 text-center text-xs font-semibold text-gray-500 uppercase">
            {day}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap mb-6">
        {calendarDays.map((dateObj, index) => {
          if (!dateObj) return <View key={`empty-${index}`} style={{ width: '14.28%' }} />;

          const isPast = dateObj < todayDate;
          const isSelectable = !isPast && isDateSelectable(dateObj);
          const isSelected = selectedDate?.toDateString() === dateObj.toDateString();

          return (
            <TouchableOpacity
              key={index}
              onPress={() => isSelectable && setSelectedDate(dateObj)}
              disabled={!isSelectable}
              style={{ width: '14.28%', padding: 4 }}
            >
              <View 
                className={`items-center justify-center py-2 rounded-xl border-2 ${
                  isSelected 
                    ? "bg-blue-600 border-blue-600" 
                    : isSelectable 
                      ? "bg-white border-transparent" 
                      : "opacity-30 border-transparent"
                }`}
              >
                <Text 
                  className={`text-lg font-bold ${
                    isSelected ? "text-white" : "text-gray-800"
                  }`}
                >
                  {dateObj.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text className="text-gray-800 font-bold text-xl my-4">Choose Time</Text>

      <View className="flex flex-row flex-wrap gap-2">
        {hasExistingBooking ? (
          <Text className="text-red-500 font-semibold bg-red-50 p-4 rounded-xl w-full">
            ⚠️ You already have an appointment booked with this doctor on this day. 
            Please choose a different date.
          </Text>
        ) : times.length === 0 ? (
          <Text className="text-gray-500 py-3">
            No available time slots for this date.
          </Text>
        ) : (
          times.map((time, index) => {
            // NEW: Check if this specific slot is booked
            const isBooked = bookedSlots.includes(time);
            const isSelected = selectedTime === time;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedTime(time)}
                disabled={isBooked || isSubmitting}
                className={`px-4 py-3 rounded-xl border ${
                  isBooked 
                    ? "bg-gray-100 border-gray-200 opacity-50" 
                    : isSelected 
                      ? "bg-blue-600 border-blue-600" 
                      : "bg-white border-gray-200"
                }`}
              >
                <Text className={`font-medium ${
                  isBooked 
                    ? "text-gray-400 line-through" 
                    : isSelected 
                      ? "text-white" 
                      : "text-gray-800"
                }`}>
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View className="flex flex-row items-center gap-6 bg-green-50 px-4 py-3 rounded-xl mt-6">
        <Ionicons name="calendar-outline" size={28} color={"green"} />
        <View>
          <Text className="text-sm font-semibold text-gray-500">You Selected</Text>
          <View className="flex flex-row items-center gap-2">
            <Text className="text-base font-bold text-green-700">
              {selectedDate ? selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" }) : "Select Date"}
            </Text>
            {selectedTime ? (
              <Text className="text-base text-green-700 font-bold">• {selectedTime}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* NEW: Button disabled state, dynamic text, and loading protection */}
      <TouchableOpacity
        disabled={isSubmitting || hasExistingBooking || !selectedTime}
        onPress={async () => {
          if (!finalDoctorId) return Alert.alert("Missing doctor id");
          if (!selectedTime || !selectedDateStr) return Alert.alert("Please select a date and time");
          
          setIsSubmitting(true);
          
          try {
            if (!paymentInfo) {
              setIsSubmitting(false);
              return Alert.alert(
                "Payment Required",
                "Payment information is missing. Please complete the payment first.",
              );
            }

            const body: any = {
              doctorId: finalDoctorId,
              date: selectedDateStr,
              appointmentDate: selectedDateStr,
              slot: selectedTime,
              paymentInfo,
            };

            const res = await apiPost("/api/appointments", body);
            const data = await res.json();
            
            if (!res.ok) {
              const reason = data?.message || "Booking failed";
              router.replace(`/payment-status?status=failed&failureReason=${encodeURIComponent(reason)}`);
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
            router.replace(`/payment-status?status=failed&failureReason=${encodeURIComponent(err?.message || "Server error")}`);
          } finally {
            setIsSubmitting(false);
          }
        }}
        className={`p-4 rounded-full items-center mt-6 ${
          isSubmitting || hasExistingBooking || !selectedTime ? "bg-blue-400" : "bg-blue-600"
        }`}
      >
        <Text className="text-white font-bold text-lg">
          {isSubmitting ? "Processing..." : "Continue To Confirm"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}