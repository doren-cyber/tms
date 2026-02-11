
import { 
  User, UserRole, Booking, BookingStatus, Vehicle, Driver, Department, 
  VehicleType, PriorityLevel 
} from './types';

// Mock Data Constants
const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Emergency Services', headId: 'user-2' },
  { id: 'dept-2', name: 'Cardiology', headId: 'user-3' },
  { id: 'dept-3', name: 'Radiology', headId: 'user-4' },
];

const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'John Staff', email: 'john@hospital.com', role: UserRole.STAFF, departmentId: 'dept-1' },
  { id: 'user-2', name: 'Dr. Smith', email: 'smith@hospital.com', role: UserRole.DEPT_HEAD, departmentId: 'dept-1' },
  { id: 'user-3', name: 'Dr. Alice', email: 'alice@hospital.com', role: UserRole.DEPT_HEAD, departmentId: 'dept-2' },
  { id: 'user-4', name: 'Admin One', email: 'admin@hospital.com', role: UserRole.ADMIN, departmentId: 'dept-1' },
  { id: 'user-5', name: 'Mark Operator', email: 'mark@hospital.com', role: UserRole.OPERATOR, departmentId: 'dept-1' },
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v-1', type: VehicleType.AMBULANCE, plateNumber: 'AMB-101', capacity: 2, equipmentLoad: 500, status: 'AVAILABLE', lastServiceDate: '2023-10-01' },
  { id: 'v-2', type: VehicleType.AMBULANCE, plateNumber: 'AMB-102', capacity: 2, equipmentLoad: 500, status: 'BUSY', lastServiceDate: '2023-11-15' },
  { id: 'v-3', type: VehicleType.CAR, plateNumber: 'CAR-501', capacity: 4, equipmentLoad: 100, status: 'AVAILABLE', lastServiceDate: '2023-09-20' },
  { id: 'v-4', type: VehicleType.VAN, plateNumber: 'VAN-201', capacity: 8, equipmentLoad: 300, status: 'AVAILABLE', lastServiceDate: '2023-12-05' },
];

const MOCK_DRIVERS: Driver[] = [
  { id: 'd-1', name: 'Robert Driver', licenseNumber: 'L-001', status: 'AVAILABLE', shift: 'MORNING', phone: '+1234567890' },
  { id: 'd-2', name: 'James Speed', licenseNumber: 'L-002', status: 'ON_DUTY', shift: 'MORNING', phone: '+1234567891' },
  { id: 'd-3', name: 'Susan Wheel', licenseNumber: 'L-003', status: 'AVAILABLE', shift: 'EVENING', phone: '+1234567892' },
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    requesterId: 'user-1',
    departmentId: 'dept-1',
    purpose: 'Patient transfer to Diagnostic Center',
    pickupLocation: 'Main Wing A',
    dropLocation: 'Diagnostic Center',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    passengers: 2,
    hasEquipment: true,
    equipmentDescription: 'Oxygen cylinders',
    preferredVehicleType: VehicleType.AMBULANCE,
    priority: PriorityLevel.NORMAL,
    status: BookingStatus.REQUESTED,
    createdAt: new Date().toISOString(),
  }
];

export class HTMService {
  private static STORAGE_KEY = 'htm_vbs_bookings';
  private static VEHICLES_KEY = 'htm_vbs_vehicles';
  private static DRIVERS_KEY = 'htm_vbs_drivers';
  private static USERS_KEY = 'htm_vbs_users';
  
  private static _bookings: Booking[] = [];
  private static _vehicles: Vehicle[] = [];
  private static _drivers: Driver[] = [];
  private static _users: User[] = [];
  private static _currentUser: User = MOCK_USERS[0];

  static init() {
    const storedBookings = localStorage.getItem(this.STORAGE_KEY);
    this._bookings = storedBookings ? JSON.parse(storedBookings) : [...DEFAULT_BOOKINGS];

    const storedVehicles = localStorage.getItem(this.VEHICLES_KEY);
    this._vehicles = storedVehicles ? JSON.parse(storedVehicles) : [...MOCK_VEHICLES];

    const storedDrivers = localStorage.getItem(this.DRIVERS_KEY);
    this._drivers = storedDrivers ? JSON.parse(storedDrivers) : [...MOCK_DRIVERS];

    const storedUsers = localStorage.getItem(this.USERS_KEY);
    this._users = storedUsers ? JSON.parse(storedUsers) : [...MOCK_USERS];

    if (!storedBookings) this.save();
  }

  private static save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._bookings));
    localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(this._vehicles));
    localStorage.setItem(this.DRIVERS_KEY, JSON.stringify(this._drivers));
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this._users));
  }

  static setCurrentUser(user: User) {
    this._currentUser = user;
  }

  static getCurrentUser(): User {
    return this._currentUser;
  }

  static getAllUsers(): User[] {
    if (this._users.length === 0) this.init();
    return this._users;
  }

  static createUser(userData: Partial<User>): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || UserRole.STAFF,
      departmentId: userData.departmentId || 'dept-1',
    };
    this._users = [...this._users, newUser];
    this.save();
    return newUser;
  }

  static getBookings(): Booking[] {
    if (this._bookings.length === 0) this.init();
    return this._bookings;
  }

  static getAuthorizedBookings(): Booking[] {
    const user = this.getCurrentUser();
    const all = this.getBookings();
    
    if (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR || user.role === UserRole.TRANSPORT_HEAD) {
      return all;
    }
    
    if (user.role === UserRole.DEPT_HEAD) {
      return all.filter(b => b.departmentId === user.departmentId);
    }
    
    return all.filter(b => b.requesterId === user.id);
  }

  static getVehicles(): Vehicle[] {
    if (this._vehicles.length === 0) this.init();
    return this._vehicles;
  }

  static getDrivers(): Driver[] {
    if (this._drivers.length === 0) this.init();
    return this._drivers;
  }

  static getDepartments(): Department[] {
    return MOCK_DEPARTMENTS;
  }

  static createBooking(bookingData: Partial<Booking>): Booking {
    const user = this.getCurrentUser();
    // Special rule: if a Dept Head creates a booking for their own dept, it is auto-approved by them
    const isDeptHead = user.role === UserRole.DEPT_HEAD;
    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      requesterId: user.id,
      departmentId: user.departmentId,
      purpose: bookingData.purpose || '',
      pickupLocation: bookingData.pickupLocation || '',
      dropLocation: bookingData.dropLocation || '',
      startTime: bookingData.startTime || new Date().toISOString(),
      endTime: bookingData.endTime || new Date().toISOString(),
      passengers: bookingData.passengers || 1,
      hasEquipment: bookingData.hasEquipment || false,
      equipmentDescription: bookingData.equipmentDescription,
      preferredVehicleType: bookingData.preferredVehicleType,
      priority: bookingData.priority || PriorityLevel.NORMAL,
      status: isDeptHead ? BookingStatus.APPROVED : BookingStatus.REQUESTED,
      createdAt: new Date().toISOString(),
    };
    this._bookings = [newBooking, ...this._bookings];
    this.save();
    return newBooking;
  }

  static rescheduleBooking(bookingId: string, startTime: string, endTime: string): void {
    this._bookings = this._bookings.map(b => 
      b.id === bookingId ? { ...b, startTime, endTime, notes: `Rescheduled by transport office on ${new Date().toLocaleString()}` } : b
    );
    this.save();
  }

  static updateBookingStatus(bookingId: string, status: BookingStatus, metadata?: Partial<Booking>): void {
    const booking = this._bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (status === BookingStatus.ON_TRIP) {
      if (booking.assignedVehicleId) {
        this._vehicles = this._vehicles.map(v => v.id === booking.assignedVehicleId ? { ...v, status: 'BUSY' } : v);
      }
      if (booking.assignedDriverId) {
        this._drivers = this._drivers.map(d => d.id === booking.assignedDriverId ? { ...d, status: 'ON_DUTY' } : d);
      }
    } else if (status === BookingStatus.COMPLETED || status === BookingStatus.CANCELLED) {
      if (booking.assignedVehicleId) {
        this._vehicles = this._vehicles.map(v => v.id === booking.assignedVehicleId ? { ...v, status: 'AVAILABLE' } : v);
      }
      if (booking.assignedDriverId) {
        this._drivers = this._drivers.map(d => d.id === booking.assignedDriverId ? { ...d, status: 'AVAILABLE' } : d);
      }
    }

    this._bookings = this._bookings.map(b => 
      b.id === bookingId ? { ...b, status, ...metadata } : b
    );
    this.save();
  }

  static assignVehicleAndDriver(bookingId: string, vehicleId: string, driverId: string): void {
    this._bookings = this._bookings.map(b => 
      b.id === bookingId ? { 
        ...b, 
        assignedVehicleId: vehicleId, 
        assignedDriverId: driverId,
        status: BookingStatus.CONFIRMED 
      } : b
    );
    this.save();
  }

  static getStats() {
    const user = this.getCurrentUser();
    const bookings = this.getAuthorizedBookings();
    const vehicles = this.getVehicles();
    
    return {
      totalBookings: bookings.length,
      pendingApprovals: bookings.filter(b => b.status === BookingStatus.REQUESTED).length,
      activeTrips: bookings.filter(b => b.status === BookingStatus.ON_TRIP).length,
      availableVehicles: vehicles.filter(v => v.status === 'AVAILABLE').length,
    };
  }
}
