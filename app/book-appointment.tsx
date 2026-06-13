import DateFormat from "@/components/DateFormat";
import useDoctors from "@/utils/useDoctors";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookAppointment() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { doctors, loading } = useDoctors();
  const selectedDoctor = doctors.find(
    (doc) => String(doc._id) === String(routeId),
  );

  const [paid, setPaid] = useState(false);
  const [showPayment, setShowPayment] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any | null>(null);
  const [paymentAttempted, setPaymentAttempted] = useState(false);

  const PAYMENT_PHONE = "6005647721";
  const PAYMENT_UPI_ID = `${PAYMENT_PHONE}@ybl`;
  const PAYMENT_NAME = "SounTabeeb";

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (!selectedDoctor) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center px-6">
        <Text className="text-center text-gray-600 text-lg">
          Selected doctor not found. Please go back and choose a doctor again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const doctorId = String(selectedDoctor._id);

  return (
    <SafeAreaView className="flex-1">
      <View className="p-4">
        <View className="flex flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={"black"} />
          </TouchableOpacity>
          <Text className="text-gray-800 font-bold text-2xl">
            Book Appointment
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="border border-blue-100 bg-white rounded-lg mt-4 px-4 py-8 mb-8">
            <Text className="font-bold text-xl text-gray-800 mb-4">
              Selected Service & Doctor
            </Text>
            <View className="flex flex-row items-center gap-4">
              <Image
                source={selectedDoctor.image}
                className="w-28 h-28 rounded-full bg-blue-50"
                resizeMode="contain"
              />

              <View className="flex-1">
                <Text className="text-gray-800 text-lg font-bold">
                  {selectedDoctor.name}
                </Text>
                <Text className="text-gray-600 font-medium">
                  {selectedDoctor.speciality}
                </Text>
                <Text className="text-gray-600 font-medium">
                  {selectedDoctor.qualification || selectedDoctor.degree}
                </Text>
                <Text className="text-gray-600 font-medium">
                  Experience: {selectedDoctor.experience}
                </Text>
                <Text className="text-gray-800 font-bold mt-3">
                  Fee: Rs {selectedDoctor.fees}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/alldoctors")}
              className="mt-4 self-start"
            >
              <Text className="text-blue-600 text-lg font-bold">Change</Text>
            </TouchableOpacity>
          </View>

          {/* Payment modal */}
          {!paid ? (
            <Modal visible={showPayment} transparent animationType="slide">
              <View className="flex-1 justify-center items-center bg-black/40 px-6">
                <View className="w-full bg-white rounded-2xl p-6">
                  <Text className="text-xl font-bold mb-2">
                    Pay Consultation Fee
                  </Text>
                  <Text className="text-gray-700 mb-4">
                    You need to pay the consultation fee 
                    before choosing date/time.
                  </Text>
                  <Text className="text-lg font-semibold mb-2">
                    Amount: Rs {selectedDoctor.fees}
                  </Text>
                  <Text className="text-gray-700 mb-4">
                    Pay to SounTabeeb via UPI.
                  </Text>

                  {!paymentAttempted ? (
                    <View className="flex-row justify-between">
                      <TouchableOpacity
                        onPress={() => router.back()}
                        className="px-4 py-3 rounded-xl bg-gray-200"
                      >
                        <Text>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          setPaying(true);
                          try {
                            // Use phone-based UPI VPA. Payment goes to the admin receiver.
                            const upiId = PAYMENT_UPI_ID;
                            const payeeName = PAYMENT_NAME;
                            const amount = String(selectedDoctor.fees || "0");
                            const txnRef = `sountabeeb_${Date.now()}`;
                            const tn = encodeURIComponent(
                              `Consultation ${txnRef}`,
                            );
                            const upiUrl = `upi://pay?pa=${encodeURIComponent(
                              upiId,
                            )}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(
                              amount,
                            )}&cu=INR&tn=${tn}`;

                            const can = await Linking.canOpenURL(upiUrl);
                            if (!can) {
                              Alert.alert(
                                "No UPI app",
                                "No UPI app found to handle payment. Install Google Pay, PhonePe, Paytm, or Amazon Pay.",
                              );
                              setPaying(false);
                              return;
                            }

                            await Linking.openURL(upiUrl);

                            // store payment meta
                            setPaymentInfo({
                              method: "UPI",
                              amount,
                              txnRef,
                              upiId,
                            });

                            // Show try again button
                            setPaymentAttempted(true);

                            // Auto-proceed after user returns from UPI app (payment or not - backend will validate)
                            setTimeout(() => {
                              setPaid(true);
                              setShowPayment(false);
                            }, 1500);
                          } catch (e) {
                            console.warn(e);
                            Alert.alert("Payment failed to start");
                          } finally {
                            setPaying(false);
                          }
                        }}
                        className="px-4 py-3 rounded-xl bg-blue-600"
                      >
                        {paying ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text className="text-white font-semibold">
                            Pay Rs {selectedDoctor.fees} to Admin via UPI
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="w-full">
                      <Text className="text-gray-600 mb-4 text-center">
                        Payment failed? Click "Try Again" to retry payment.
                      </Text>
                      <TouchableOpacity
                        onPress={async () => {
                          setPaying(true);
                          try {
                            const upiId = PAYMENT_UPI_ID;
                            const payeeName = PAYMENT_NAME;
                            const amount = String(selectedDoctor.fees || "0");
                            const txnRef = `sountabeeb_${Date.now()}`;
                            const tn = encodeURIComponent(
                              `Consultation ${txnRef}`,
                            );
                            const upiUrl = `upi://pay?pa=${encodeURIComponent(
                              upiId,
                            )}&pn=${encodeURIComponent(payeeName)}&am=${encodeURIComponent(
                              amount,
                            )}&cu=INR&tn=${tn}`;

                            const can = await Linking.canOpenURL(upiUrl);
                            if (!can) {
                              Alert.alert(
                                "No UPI app",
                                "No UPI app found to handle payment. Install Google Pay, PhonePe, Paytm, or Amazon Pay.",
                              );
                              setPaying(false);
                              return;
                            }

                            await Linking.openURL(upiUrl);

                            // Update payment meta
                            setPaymentInfo({
                              method: "UPI",
                              amount,
                              txnRef,
                              upiId,
                            });

                            // Auto-proceed after user returns from UPI app
                            setTimeout(() => {
                              setPaid(true);
                              setShowPayment(false);
                            }, 1500);
                          } catch (e) {
                            console.warn(e);
                            Alert.alert("Payment failed to start");
                          } finally {
                            setPaying(false);
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-blue-600"
                      >
                        {paying ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text className="text-white font-semibold text-center">
                            Try Again
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </Modal>
          ) : (
            <DateFormat doctorId={doctorId} paymentInfo={paymentInfo} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
