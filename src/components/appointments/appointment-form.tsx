"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appointmentSchema } from "@/lib/validations";
import { useApi } from "@/hooks/use-api";
import { TimeSlot } from "@/types";
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  doctorId: string;
  selectedDate: string;
  availableSlots: TimeSlot[];
  onSuccess?: () => void;
}

export function AppointmentForm({
  doctorId,
  selectedDate,
  availableSlots,
  onSuccess,
}: AppointmentFormProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { callApi } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      symptoms: "",
      date: selectedDate,
    },
  });

  // Update form when selectedDate changes
  useState(() => {
    setValue("date", selectedDate);
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedSlot) {
      setSubmitError("Please select a time slot");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("📤 Submitting appointment data:", {
        doctorId,
        selectedDate,
        selectedSlot,
        patientData: data,
      });

      const appointmentData = {
        doctorId: doctorId,
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        patientPhone: data.patientPhone,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        symptoms: data.symptoms,
      };

      console.log("🔄 Sending to API:", appointmentData);

      const response = await callApi("post", "/appointments", appointmentData);
      
      console.log("✅ Appointment booked successfully:", response);

      setSubmitSuccess(true);
      reset();
      setSelectedSlot(null);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error("❌ Appointment booking error:", error);
      
      let errorMessage = "Failed to book appointment. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSubmitError(null);
    setValue("startTime", slot.startTime);
    setValue("endTime", slot.endTime);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Success Message */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-green-800 font-medium">
                  Appointment booked successfully!
                </p>
                <p className="text-green-700 text-sm mt-1">
                  You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-red-800 font-medium">{submitError}</p>
                <p className="text-red-700 text-sm mt-1">
                  Please check your information and try again.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Information */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patientName">Full Name *</Label>
          <Input
            id="patientName"
            {...register("patientName")}
            placeholder="Enter your full name"
            disabled={isSubmitting}
            className={errors.patientName ? "border-red-500" : ""}
          />
          {errors.patientName && (
            <p className="text-sm text-red-500">{errors.patientName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientEmail">Email *</Label>
          <Input
            id="patientEmail"
            type="email"
            {...register("patientEmail")}
            placeholder="Enter your email"
            disabled={isSubmitting}
            className={errors.patientEmail ? "border-red-500" : ""}
          />
          {errors.patientEmail && (
            <p className="text-sm text-red-500">{errors.patientEmail.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="patientPhone">Phone Number *</Label>
        <Input
          id="patientPhone"
          {...register("patientPhone")}
          placeholder="Enter your phone number"
          disabled={isSubmitting}
          className={errors.patientPhone ? "border-red-500" : ""}
        />
        {errors.patientPhone && (
          <p className="text-sm text-red-500">{errors.patientPhone.message}</p>
        )}
      </div>

      {/* Hidden date field */}
      <input type="hidden" {...register("date")} />

      {/* Time Slots */}
      <div className="space-y-2">
        <Label className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Available Time Slots *
        </Label>
        {availableSlots.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSlots.map((slot, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  disabled={isSubmitting || !slot.available}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 text-sm font-medium
                    ${selectedSlot === slot
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                      : slot.available
                      ? "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md"
                      : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {slot.startTime} - {slot.endTime}
                  {!slot.available && " (Booked)"}
                </motion.button>
              ))}
            </div>
            {selectedSlot && (
              <p className="text-sm text-green-600">
                Selected: {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
            )}
            {!selectedSlot && (
              <p className="text-sm text-yellow-600">Please select a time slot</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
            No available slots for this date. Please try another date.
          </p>
        )}
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <Label htmlFor="symptoms">Symptoms/Reason for Visit *</Label>
        <Textarea
          id="symptoms"
          {...register("symptoms")}
          placeholder="Please describe your symptoms or reason for the appointment in detail..."
          rows={4}
          disabled={isSubmitting}
          className={errors.symptoms ? "border-red-500" : ""}
        />
        {errors.symptoms && (
          <p className="text-sm text-red-500">{errors.symptoms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={isSubmitting || !selectedSlot}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking Appointment...
            </>
          ) : (
            "Confirm Appointment"
          )}
        </Button>
      </div>
    </motion.form>
  );
}