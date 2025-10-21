"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { Appointment } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  User,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface DoctorStats {
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  missedAppointments: number;
  upcomingAppointments: number;
  nextAppointment: Appointment | null;
}

export function DoctorDashboard() {
  const { callApi, isLoading } = useApi();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadStats();
    loadAppointments();
  }, [selectedDate]);

  const loadStats = async () => {
    try {
      const statsData = await callApi("get", "/doctor/stats");
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadAppointments = async () => {
    try {
      const appointmentsData = await callApi(
        "get",
        `/doctor/appointments?date=${selectedDate}`
      );
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: string
  ) => {
    try {
      await callApi("patch", `/doctor/appointments/${appointmentId}/status`, {
        status,
      });
      loadAppointments();
      loadStats();
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  const refreshData = () => {
    loadStats();
    loadAppointments();
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <Button onClick={refreshData} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalAppointments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.todayAppointments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedAppointments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.missedAppointments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Appointment
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats?.nextAppointment ? (
              <div>
                <div className="text-lg font-bold">
                  {stats.nextAppointment.patientName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(stats.nextAppointment.date)} at{" "}
                  {formatTime(stats.nextAppointment.startTime)}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                No upcoming appointments
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="date-filter" className="text-sm font-medium">
          Filter by Date:
        </label>
        <input
          type="date"
          id="date-filter"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments for {formatDate(selectedDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {appointment.patientName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.patientEmail} •{" "}
                          {appointment.patientPhone}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      {formatTime(appointment.startTime)} -{" "}
                      {formatTime(appointment.endTime)}
                    </div>
                    <div className="text-sm mt-1">{appointment.symptoms}</div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "missed"
                          ? "bg-red-100 text-red-800"
                          : appointment.status === "cancelled"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                    {appointment.status === "confirmed" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, "completed")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateAppointmentStatus(appointment.id, "missed")
                          }
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Missed
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No appointments scheduled for {formatDate(selectedDate)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}