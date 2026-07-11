
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, setDoc, doc, addDoc, updateDoc, query, where, orderBy, getDoc, deleteDoc 
} from "firebase/firestore";
import { 
  User, UserRole, Booking, BookingStatus, Vehicle, Driver, Department, 
  VehicleType, PriorityLevel 
} from './types';

// Firebase project configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  !!import.meta.env.VITE_FIREBASE_API_KEY;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to prevent database calls from blocking the application indefinitely
const promiseWithTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  let timeoutId: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Firebase operation timed out after ${ms}ms, using offline fallback.`);
      resolve(fallback);
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).then((val) => {
    clearTimeout(timeoutId);
    return val;
  });
};

// Mock Data Constants (used for initial seeding)
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
  { id: 'd-2', name: 'James Speed', licenseNumber: 'L-002', status: 'AVAILABLE', shift: 'MORNING', phone: '+1234567891' },
  { id: 'd-3', name: 'Susan Wheel', licenseNumber: 'L-003', status: 'AVAILABLE', shift: 'EVENING', phone: '+1234567892' },
];

// In-memory fallback storage
const localStore: { [key: string]: any[] } = {
  users: [...MOCK_USERS],
  vehicles: [...MOCK_VEHICLES],
  drivers: [...MOCK_DRIVERS],
  departments: [...MOCK_DEPARTMENTS],
  bookings: []
};

export class HTMService {
  private static _currentUser: User | null = null;

  static async init() {
    if (!isFirebaseConfigured) {
      console.warn("Firebase not configured, using local storage fallback.");
      const savedBookings = localStorage.getItem('htm_bookings');
      if (savedBookings) {
        localStore.bookings = JSON.parse(savedBookings);
      }
      return;
    }

    try {
      const usersSnapshot = await promiseWithTimeout(
        getDocs(collection(db, "users")),
        3000,
        { empty: false } as any
      );
      if (usersSnapshot.empty) {
        console.log("Seeding database...");
        await Promise.all([
          ...MOCK_USERS.map(u => setDoc(doc(db, "users", u.id), u)),
          ...MOCK_VEHICLES.map(v => setDoc(doc(db, "vehicles", v.id), v)),
          ...MOCK_DRIVERS.map(d => setDoc(doc(db, "drivers", d.id), d)),
          ...MOCK_DEPARTMENTS.map(d => setDoc(doc(db, "departments", d.id), d)),
        ]);
      }
    } catch (error) {
      console.error("Firebase init failed, falling back to local storage:", error);
    }
  }

  static setCurrentUser(user: User) {
    this._currentUser = user;
  }

  static getCurrentUser(): User | null {
    return this._currentUser;
  }

  static async getAllUsers(): Promise<User[]> {
    if (!isFirebaseConfigured) return localStore.users;
    try {
      const fetchPromise = getDocs(collection(db, "users")).then(snapshot => 
        snapshot.docs.map(doc => doc.data() as User)
      );
      return await promiseWithTimeout(fetchPromise, 3000, localStore.users);
    } catch (e) {
      return localStore.users;
    }
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || UserRole.STAFF,
      departmentId: userData.departmentId || 'dept-1',
    };
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "users", id), newUser);
      } catch (e) {
        localStore.users.push(newUser);
      }
    } else {
      localStore.users.push(newUser);
    }
    return newUser;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const index = localStore.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      localStore.users[index] = { ...localStore.users[index], ...updates };
    }

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "users", userId), { ...localStore.users[index], ...updates }, { merge: true });
      } catch (e) {
        console.error("Firebase updateUser failed", e);
      }
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    const index = localStore.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      localStore.users.splice(index, 1);
    }

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (e) {
        console.error("Firebase deleteUser failed", e);
      }
    }
  }

  static async getBookings(): Promise<Booking[]> {
    if (!isFirebaseConfigured) return localStore.bookings;
    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const fetchPromise = getDocs(q).then(snapshot => 
        snapshot.docs.map(doc => doc.data() as Booking)
      );
      return await promiseWithTimeout(fetchPromise, 3000, localStore.bookings);
    } catch (e) {
      return localStore.bookings;
    }
  }

  static async getAuthorizedBookings(): Promise<Booking[]> {
    const user = this.getCurrentUser();
    if (!user) return [];

    if (!isFirebaseConfigured) {
      if (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR || user.role === UserRole.TRANSPORT_HEAD) {
        return localStore.bookings;
      } else if (user.role === UserRole.DEPT_HEAD) {
        return localStore.bookings.filter(b => b.departmentId === user.departmentId);
      } else {
        return localStore.bookings.filter(b => b.requesterId === user.id);
      }
    }

    try {
      let q;
      if (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR || user.role === UserRole.TRANSPORT_HEAD) {
        q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      } else if (user.role === UserRole.DEPT_HEAD) {
        q = query(collection(db, "bookings"), where("departmentId", "==", user.departmentId), orderBy("createdAt", "desc"));
      } else {
        q = query(collection(db, "bookings"), where("requesterId", "==", user.id), orderBy("createdAt", "desc"));
      }

      const fetchPromise = getDocs(q).then(snapshot => 
        snapshot.docs.map(doc => doc.data() as Booking)
      );
      return await promiseWithTimeout(fetchPromise, 3000, localStore.bookings);
    } catch (e) {
      return this.getBookings(); // Fallback to all if query fails
    }
  }

  static async getVehicles(): Promise<Vehicle[]> {
    if (!isFirebaseConfigured) return localStore.vehicles;
    try {
      const fetchPromise = getDocs(collection(db, "vehicles")).then(snapshot => 
        snapshot.docs.map(doc => doc.data() as Vehicle)
      );
      return await promiseWithTimeout(fetchPromise, 3000, localStore.vehicles);
    } catch (e) {
      return localStore.vehicles;
    }
  }

  static async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const id = `v-${Date.now()}`;
    const newVehicle: Vehicle = {
      id,
      plateNumber: vehicleData.plateNumber || '',
      type: vehicleData.type || VehicleType.CAR,
      capacity: vehicleData.capacity || 4,
      status: vehicleData.status || 'AVAILABLE',
      lastServiceDate: vehicleData.lastServiceDate || new Date().toISOString().split('T')[0],
      equipmentLoad: vehicleData.equipmentLoad || 50
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "vehicles", id), newVehicle);
      } catch (e) {
        console.error("Firebase createVehicle failed, using localStore fallback", e);
      }
    }
    
    const index = localStore.vehicles.findIndex(v => v.id === id);
    if (index === -1) {
      localStore.vehicles.push(newVehicle);
    }
    return newVehicle;
  }

  static async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
    const index = localStore.vehicles.findIndex(v => v.id === vehicleId);
    if (index !== -1) {
      localStore.vehicles[index] = { ...localStore.vehicles[index], ...updates };
    }

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "vehicles", vehicleId), { ...localStore.vehicles[index], ...updates }, { merge: true });
      } catch (e) {
        console.error("Firebase updateVehicle failed", e);
      }
    }
  }

  static async deleteVehicle(vehicleId: string): Promise<void> {
    const index = localStore.vehicles.findIndex(v => v.id === vehicleId);
    if (index !== -1) {
      localStore.vehicles.splice(index, 1);
    }

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "vehicles", vehicleId));
      } catch (e) {
        console.error("Firebase deleteVehicle failed", e);
      }
    }
  }

  static async getDrivers(): Promise<Driver[]> {
    if (!isFirebaseConfigured) return localStore.drivers;
    try {
      const fetchPromise = getDocs(collection(db, "drivers")).then(snapshot => 
        snapshot.docs.map(doc => doc.data() as Driver)
      );
      return await promiseWithTimeout(fetchPromise, 3000, localStore.drivers);
    } catch (e) {
      return localStore.drivers;
    }
  }

  static async createDriver(driverData: Partial<Driver>): Promise<Driver> {
    const id = `d-${Date.now()}`;
    const newDriver: Driver = {
      id,
      name: driverData.name || 'New Personnel',
      licenseNumber: driverData.licenseNumber || '',
      status: driverData.status || 'AVAILABLE',
      shift: driverData.shift || 'MORNING',
      phone: driverData.phone || '',
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "drivers", id), newDriver);
      } catch (e) {
        console.error("Firebase createDriver failed, using localStore fallback", e);
      }
    }
    
    // Always keep localStore sync'd as fallback
    const index = localStore.drivers.findIndex(d => d.id === id);
    if (index === -1) {
      localStore.drivers.push(newDriver);
    }
    return newDriver;
  }

  static async updateDriver(driverId: string, updates: Partial<Driver>): Promise<void> {
    const index = localStore.drivers.findIndex(d => d.id === driverId);
    if (index !== -1) {
      localStore.drivers[index] = { ...localStore.drivers[index], ...updates };
    }

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "drivers", driverId), { ...localStore.drivers[index], ...updates }, { merge: true });
      } catch (e) {
        console.error("Firebase updateDriver failed", e);
      }
    }
  }


  static async getDepartments(): Promise<Department[]> {
    if (!isFirebaseConfigured) return localStore.departments;
    try {
      const fetchPromise = getDocs(collection(db, "departments")).then(snapshot => 
        snapshot.docs.map(doc => doc.data() as Department)
      );
      return await promiseWithTimeout(fetchPromise, 3000, localStore.departments);
    } catch (e) {
      return localStore.departments;
    }
  }

  static async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const user = this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    const id = `b-${Date.now()}`;
    const isDeptHead = user.role === UserRole.DEPT_HEAD;
    const newBooking: Booking = {
      id,
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

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "bookings", id), newBooking);
      } catch (e) {
        this.saveLocalBooking(newBooking);
      }
    } else {
      this.saveLocalBooking(newBooking);
    }
    return newBooking;
  }

  private static saveLocalBooking(booking: Booking) {
    localStore.bookings.unshift(booking);
    localStorage.setItem('htm_bookings', JSON.stringify(localStore.bookings));
  }

  static async updateBookingStatus(bookingId: string, status: BookingStatus, metadata?: Partial<Booking>): Promise<void> {
    if (!isFirebaseConfigured) {
      const index = localStore.bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        localStore.bookings[index] = { ...localStore.bookings[index], status, ...metadata };
        localStorage.setItem('htm_bookings', JSON.stringify(localStore.bookings));
      }
      return;
    }

    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) return;
      const booking = bookingSnap.data() as Booking;

      const updates: Partial<Booking> = { status, ...metadata };

      if (status === BookingStatus.ON_TRIP) {
        if (booking.assignedVehicleId) {
          await updateDoc(doc(db, "vehicles", booking.assignedVehicleId), { status: 'BUSY' });
        }
        if (booking.assignedDriverId) {
          await updateDoc(doc(db, "drivers", booking.assignedDriverId), { status: 'ON_DUTY' });
        }
      } else if (status === BookingStatus.COMPLETED || status === BookingStatus.CANCELLED) {
        if (booking.assignedVehicleId) {
          await updateDoc(doc(db, "vehicles", booking.assignedVehicleId), { status: 'AVAILABLE' });
        }
        if (booking.assignedDriverId) {
          await updateDoc(doc(db, "drivers", booking.assignedDriverId), { status: 'AVAILABLE' });
        }
      }

      await updateDoc(bookingRef, updates);
    } catch (e) {
      console.error("Update failed", e);
    }
  }

  static async assignVehicleAndDriver(bookingId: string, vehicleId: string, driverId: string): Promise<void> {
    if (!isFirebaseConfigured) {
      const index = localStore.bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        localStore.bookings[index] = { 
          ...localStore.bookings[index], 
          assignedVehicleId: vehicleId, 
          assignedDriverId: driverId,
          status: BookingStatus.CONFIRMED 
        };
        localStorage.setItem('htm_bookings', JSON.stringify(localStore.bookings));
      }
      return;
    }
    try {
      await updateDoc(doc(db, "bookings", bookingId), { 
        assignedVehicleId: vehicleId, 
        assignedDriverId: driverId,
        status: BookingStatus.CONFIRMED 
      });
    } catch (e) {
      console.error("Assign failed", e);
    }
  }

  static async rescheduleBooking(bookingId: string, startTime: string, endTime: string): Promise<void> {
    if (!isFirebaseConfigured) {
      const index = localStore.bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        localStore.bookings[index] = {
          ...localStore.bookings[index],
          startTime,
          endTime,
          notes: `Rescheduled by transport office on ${new Date().toLocaleString()}`
        };
        localStorage.setItem('htm_bookings', JSON.stringify(localStore.bookings));
      }
      return;
    }
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        startTime,
        endTime,
        notes: `Rescheduled by transport office on ${new Date().toLocaleString()}`
      });
    } catch (e) {
      console.error("Reschedule failed", e);
    }
  }

  static async getStats() {
    const bookings = await this.getAuthorizedBookings();
    const vehicles = await this.getVehicles();
    
    return {
      totalBookings: bookings.length,
      pendingApprovals: bookings.filter(b => b.status === BookingStatus.REQUESTED).length,
      activeTrips: bookings.filter(b => b.status === BookingStatus.ON_TRIP).length,
      availableVehicles: vehicles.filter(v => v.status === 'AVAILABLE').length,
    };
  }
}
