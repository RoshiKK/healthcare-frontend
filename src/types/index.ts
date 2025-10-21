export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  specialization?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Add this helper function to safely get user ID
export const getUserId = (user: User): string => {
  return user.id || user._id || '';
}
export interface Appointment {
  id: string;
  _id?: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctor: User | string;
  doctorName?: string;
  date: string;
  startTime: string;
  endTime: string;
  symptoms: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'missed';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  appointmentId?: string;
}

export interface DoctorAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface VoiceSession {
  sessionId: string;
  welcomeMessage: string;
  audio: string;
}

export interface VoiceCommand {
  sessionId: string;
  audio: string;
  appointmentData: any;
}