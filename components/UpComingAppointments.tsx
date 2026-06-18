import { assets } from "@/assets/assets";
import { apiPost } from "@/utils/api";
import useAppointments from "@/utils/useAppointments";
import { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const getDayName = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "long" });

const isDateOnLeave = (date: Date, leaves: any[] = []) => {
  return leaves.some((leave) => {
    if (!leave?.from || !leave?.to) return false;
    const from = new Date(leave.from);
    const to = new Date(leave.to);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return date >= from && date <= to;
  });
};

const getWorkingHoursForDate = (date: Date, workingHours: any[] = []) => {
  const dayName = getDayName(date);
  return workingHours.find((slot) => slot.day === dayName) || null;
};

const generateAvailableSlots = (
  date: Date,
  workingHours: any[] = [],
  currentTimes: string[] = [],
) => {
  const schedule = getWorkingHoursForDate(date, workingHours);
  if (!schedule || !schedule.active) return [];

  const [startHours, startMinutes] = schedule.start.split(":").map(Number);
  const [endHours, endMinutes] = schedule.end.split(":").map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;

  return currentTimes.filter((slot) => {
    const [hours, minutes] = slot.split(":").map(Number);
    const total = hours * 60 + minutes;
    return total >= startTotal && total < endTotal;
  });
};

export default function UpComingAppointments() {
  const { appointments, loading, error, refresh } = useAppointments();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<any>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  const dates = useMemo(() => {
    const nextDates: Date[] = [];
    for (let i = 1; i <= 14; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      nextDates.push(date);
    }
    return nextDates;
  }, []);

  const currentTimes = useMemo(() => {
    const timeSlots: string[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 24 * 6; i += 1) {
      const time = new Date(base);
      time.setMinutes(10 * i);
      timeSlots.push(
        time.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    }
    return timeSlots;
  }, []);

  const pendingAppointments = appointments
    .filter((item) => item.status === "pending" || item.status === "confirmed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const findFirstSelectableDate = (appointment: any) => {
    const leaves = appointment?.doctor?.leaves || [];
    return dates.findIndex((date) => !isDateOnLeave(date, leaves));
  };

  const openRescheduleModal = (appointment: any) => {
    const firstIndex = findFirstSelectableDate(appointment);
    setRescheduleAppointment(appointment);
    setSelectedDateIndex(firstIndex >= 0 ? firstIndex : 0);
    setSelectedSlot("");
    setReason("");
  };

  const closeRescheduleModal = () => {
    setRescheduleAppointment(null);
    setSelectedSlot("");
    setReason("");
    setSelectedDateIndex(0);
  };

  const handleRequestReschedule = async () => {
    if (!rescheduleAppointment) return;
    if (!selectedSlot) {
      Alert.alert("Select time", "Please choose a new time slot.");
      return;
    }

    setSubmittingReschedule(true);
    try {
      const selectedDate = dates[selectedDateIndex];
      const dateString = selectedDate.toISOString().split("T")[0];
      const res = await apiPost(
        `/api/appointments/${rescheduleAppointment._id}/reschedule`,
        {
          newDate: dateString,
          newSlot: selectedSlot,
          reason: reason.trim(),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to submit reschedule request");
      }
      Alert.alert(
        "Reschedule requested",
        "Your request has been submitted to the doctor.",
      );
      refresh();
      closeRescheduleModal();
    } catch (err: any) {
      Alert.alert("Reschedule failed", err.message || "Please try again.");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    setCancelingId(appointmentId);
    try {
      const res = await apiPost(
        `/api/appointments/${appointmentId}/cancel`,
        {},
      );
      const data = await res.json();
      if (!res.ok) {
        Alert.alert(data.message || "Unable to cancel appointment");
        return;
      }
      Alert.alert("Appointment cancelled");
      refresh();
    } catch (err) {
      Alert.alert("Unable to cancel appointment");
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-600">Loading appointments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-gray-600 text-center">{error}</Text>
      </View>
    );
  }

  if (!pendingAppointments.length) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <Text className="text-xl font-bold text-gray-700 mb-2">
          No upcoming appointments
        </Text>
        <Text className="text-center text-gray-500">
          You do not have any upcoming booked appointments right now.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-xl font-bold text-gray-700 mb-4">
        Upcoming Appointments
      </Text>
      {pendingAppointments.map((item) => {
        const doctor = item.doctor || {};
        const imageSource = doctor.profilePicture
          ? { uri: doctor.profilePicture }
          : assets.doclogo;
        const appointmentDate = item.date ? new Date(item.date) : null;
        const formattedDate = appointmentDate
          ? appointmentDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "--";
        const formattedTime = item.slot
          ? item.slot
          : appointmentDate
            ? appointmentDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--";

        const hasPendingReschedule =
          item.rescheduleRequest?.status === "pending";

        return (
          <View
            key={item._id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
          >
            <View className="flex flex-row items-center gap-4">
              <Image
                source={imageSource}
                className="w-24 h-24 rounded-full bg-blue-50"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-700">
                  {doctor.name || "Doctor"}
                </Text>
                <Text className="text-lg font-medium text-gray-500">
                  {doctor.speciality || "Speciality"}
                </Text>
                <Text className="text-gray-500 mt-1">
                  {formattedDate} • {formattedTime}
                </Text>
              </View>
            </View>

            {hasPendingReschedule && (
              <View className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-3">
                <Text className="font-semibold text-yellow-900">
                  Reschedule request pending
                </Text>
                <Text className="text-sm text-yellow-800 mt-1">
                  The doctor is reviewing your request. You will be notified
                  once the decision is made.
                </Text>
              </View>
            )}

            <View className="mt-6 flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleCancel(item._id)}
                disabled={cancelingId === item._id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3"
              >
                <Text className="text-center text-white font-bold">
                  {cancelingId === item._id ? "Cancelling..." : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openRescheduleModal(item)}
                disabled={hasPendingReschedule}
                className={`flex-1 rounded-xl px-4 py-3 ${hasPendingReschedule ? "bg-gray-300" : "bg-blue-600"}`}
              >
                <Text className="text-center text-white font-bold">
                  {hasPendingReschedule
                    ? "Reschedule Pending"
                    : "Request Reschedule"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <Modal
        visible={Boolean(rescheduleAppointment)}
        transparent
        animationType="slide"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-xl font-bold text-gray-800 mb-2">
              Request Reschedule
            </Text>
            <Text className="text-gray-600 mb-4">
              Pick a new date and time for your appointment.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  New date
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  {dates.map((date, index) => {
                    const selectable = !isDateOnLeave(
                      date,
                      rescheduleAppointment?.doctor?.leaves || [],
                    );
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          selectable && setSelectedDateIndex(index)
                        }
                        disabled={!selectable}
                        className={`mr-2 rounded-2xl px-3 py-3 border ${selectedDateIndex === index ? "bg-blue-600 border-blue-600" : selectable ? "bg-white border-gray-200" : "bg-gray-100 border-gray-200"}`}
                      >
                        <Text
                          className={`${selectedDateIndex === index ? "text-white" : "text-gray-700"}`}
                        >
                          {date.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                        <Text
                          className={`${selectedDateIndex === index ? "text-white" : "text-gray-500"} text-xs`}
                        >
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  New time
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {generateAvailableSlots(
                    dates[selectedDateIndex],
                    rescheduleAppointment?.doctor?.workingHours || [],
                    currentTimes,
                  ).map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setSelectedSlot(slot)}
                      className={`rounded-2xl px-3 py-2 border ${selectedSlot === slot ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"}`}
                    >
                      <Text
                        className={`${selectedSlot === slot ? "text-white" : "text-gray-700"}`}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {generateAvailableSlots(
                    dates[selectedDateIndex],
                    rescheduleAppointment?.doctor?.workingHours || [],
                    currentTimes,
                  ).length === 0 && (
                    <Text className="text-gray-500">
                      No available slots for this date.
                    </Text>
                  )}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">
                  Reason (optional)
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Why do you want to reschedule?"
                  className="border border-gray-200 rounded-2xl px-4 py-3 text-gray-700"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={closeRescheduleModal}
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRequestReschedule}
                disabled={submittingReschedule}
                className={`flex-1 rounded-2xl px-4 py-3 ${submittingReschedule ? "bg-gray-300" : "bg-blue-600"}`}
              >
                <Text className="text-center text-white font-semibold">
                  {submittingReschedule ? "Submitting..." : "Submit Request"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
