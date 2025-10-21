// In pages/book/[doctorId].tsx - Add loading states and error handling
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { VoiceBooking } from "@/components/appointments/voice-booking";
import { useApi } from "@/hooks/use-api";
import { User, TimeSlot } from "@/types";
import { Calendar, MapPin, Clock, ArrowLeft, Mic, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;
  const [doctor, setDoctor] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [activeTab, setActiveTab] = useState<"form" | "voice">("form");
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { callApi, isLoading } = useApi();

  useEffect(() => {
    if (!doctorId) {
      console.error("Doctor ID is undefined");
      router.push("/doctors");
      return;
    }
    loadDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctorId) {
      loadAvailableSlots();
    }
  }, [selectedDate, doctorId]);

  const loadDoctor = async () => {
    try {
      setLoadingDoctor(true);
      setError(null);
      console.log("Loading doctor with ID:", doctorId);
      const doctorData = await callApi("get", `/doctors/${doctorId}`);
      setDoctor(doctorData);
    } catch (error) {
      console.error("Failed to load doctor:", error);
      // Try public endpoint as fallback
      try {
        const doctorData = await callApi("get", `/public/doctors/${doctorId}`);
        setDoctor(doctorData);
      } catch (fallbackError) {
        console.error(
          "Failed to load doctor from public endpoint:",
          fallbackError
        );
        setError("Doctor not found. Please try another doctor.");
      }
    } finally {
      setLoadingDoctor(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setError(null);

      console.log(
        "🔄 Loading slots for doctor:",
        doctorId,
        "date:",
        selectedDate
      );

      // First, try the main endpoint
      const response = await callApi(
        "get",
        `/appointments/availability?doctorId=${doctorId}&date=${selectedDate}`
      );

      console.log("📦 API Response:", response);

      if (response && response.availableSlots) {
        console.log("✅ Available slots:", response.availableSlots);
        setAvailableSlots(response.availableSlots);
      } else {
        console.log("⚠️ No slots in response, using fallback");
        // Fallback to default slots
        const defaultSlots = [
          { startTime: "09:00", endTime: "09:30", available: true },
          { startTime: "09:30", endTime: "10:00", available: true },
          { startTime: "10:00", endTime: "10:30", available: true },
          { startTime: "10:30", endTime: "11:00", available: true },
          { startTime: "11:00", endTime: "11:30", available: true },
          { startTime: "11:30", endTime: "12:00", available: true },
        ];
        setAvailableSlots(defaultSlots);
      }
    } catch (error: any) {
      console.error("❌ Failed to load available slots:", error);
      // Use fallback slots on error
      const fallbackSlots = [
        { startTime: "09:00", endTime: "09:30", available: true },
        { startTime: "14:00", endTime: "14:30", available: true },
        { startTime: "16:00", endTime: "16:30", available: true },
      ];
      setAvailableSlots(fallbackSlots);
      setError("Using default time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookingSuccess = () => {
    setSelectedDate("");
    setAvailableSlots([]);
    // Show success message or redirect
    alert(
      "Appointment booked successfully! Check your email for confirmation."
    );
  };

  if (!doctorId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Invalid doctor ID. Redirecting...</div>
      </div>
    );
  }

  if (loadingDoctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
          <span>Loading doctor information...</span>
        </div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600 mb-4">{error}</div>
        <Button onClick={() => router.push("/doctors")} className="mt-4">
          Back to Doctors
        </Button>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Doctor not found</div>
        <Button onClick={() => router.push("/doctors")} className="mt-4">
          Back to Doctors
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/doctors"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Book Appointment with {doctor.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-700">
                  {doctor.specialization}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-gray-600">
                  Available: Monday - Friday, 9:00 AM - 5:00 PM
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Method Selection */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm ${
              activeTab === "form"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("form")}
          >
            Standard Booking
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm flex items-center ${
              activeTab === "voice"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("voice")}
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice Booking
          </button>
        </div>

        {activeTab === "form" ? (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setError(null);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {selectedDate && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Available slots for {formatDate(selectedDate)}
                    {loadingSlots && " (loading...)"}
                  </p>
                )}
              </CardContent>
            </Card>

            {selectedDate && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Book Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                      <span>Loading available slots...</span>
                    </div>
                  ) : (
                    <AppointmentForm
                      doctorId={doctorId}
                      selectedDate={selectedDate}
                      availableSlots={availableSlots}
                      onSuccess={handleBookingSuccess}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="h-5 w-5 mr-2 text-blue-600" />
                Voice Booking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VoiceBooking
                doctorId={doctorId}
                doctorName={doctor.name}
                onBookingComplete={handleBookingSuccess}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
