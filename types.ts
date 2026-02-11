
export enum UserRole {
  STAFF = 'STAFF',
  DEPT_HEAD = 'DEPT_HEAD',
  OPERATOR = 'OPERATOR',
  TRANSPORT_HEAD = 'TRANSPORT_HEAD',
  ADMIN = 'ADMIN'
}

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  CONFIRMED = 'CONFIRMED',
  ON_TRIP = 'ON_TRIP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PriorityLevel {
  NORMAL = 'NORMAL',
  EMERGENCY = 'EMERGENCY'
}

export enum VehicleType {
  AMBULANCE = 'AMBULANCE',
  CAR = 'CAR',
  VAN = 'VAN',
  BUS = 'BUS',
  PICKUP = 'PICKUP'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  headId: string;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  plateNumber: string;
  capacity: number;
  equipmentLoad: number; // in kg
  status: 'AVAILABLE' | 'MAINTENANCE' | 'BUSY';
  lastServiceDate: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY';
  shift: 'MORNING' | 'EVENING' | 'NIGHT';
  phone: string;
}

export interface Booking {
  id: string;
  requesterId: string;
  departmentId: string;
  purpose: string;
  pickupLocation: string;
  dropLocation: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  passengers: number;
  hasEquipment: boolean;
  equipmentDescription?: string;
  preferredVehicleType?: VehicleType;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  priority: PriorityLevel;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
  cancelReason?: string;
}

export interface SystemStats {
  totalBookings: number;
  pendingApprovals: number;
  activeTrips: number;
  availableVehicles: number;
}
