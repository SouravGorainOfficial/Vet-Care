export type UserRole = 'USER' | 'VETERINARIAN' | 'ADMIN' | 'SUPPORT_AGENT';

export type VetVerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type AppointmentType = 'ONLINE_VIDEO' | 'ONLINE_CHAT' | 'CLINIC_VISIT';
export type ConsultationType = AppointmentType;

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'REJECTED'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_VET'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type VaccinationStatus = 'COMPLETED' | 'UPCOMING' | 'OVERDUE';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  preferredLanguage: 'en' | 'bn';
  city: string;
  country: string;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface VeterinarianProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  qualification: string;
  university: string;
  graduationYear: number;
  licenseNumber: string;
  licenseAuthority: string;
  specializations: string[];
  supportedSpecies: string[];
  yearsExperience: number;
  languages: string[];
  bio: string;
  consultationFee: number;
  clinicVisitFee: number;
  rating: number;
  reviewCount: number;
  status: VetVerificationStatus;
  verificationStatus?: VetVerificationStatus;
  isVerified?: boolean;
  documentUrls?: {
    degree?: string;
    license?: string;
    identity?: string;
  };
  clinicAddress?: string;
  city: string;
  country: string;
  weeklySchedule: {
    day: string; // 'Monday', 'Tuesday', etc.
    active: boolean;
    startTime: string; // '09:00'
    endTime: string; // '17:00'
  }[];
  breaks?: {
    startTime: string;
    endTime: string;
    description: string;
  }[];
  consultationDurationMinutes?: number;
  timezone: string;
  availableDaysOff?: string[]; // ISO date strings
}

export interface AnimalWeightRecord {
  date: string;
  weightKg: number;
  notes?: string;
}

export interface Animal {
  id: string;
  ownerId: string;
  name: string;
  species: string; // Dog, Cat, Bird, Rabbit, Goat, Cow, Horse, etc.
  breed: string;
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  dateOfBirth?: string;
  ageYears?: number;
  approximateAge?: string;
  weightKg: number;
  color?: string;
  microchipNumber?: string;
  photoUrl?: string;
  isSterilized?: boolean;
  isNeutered?: boolean;
  allergies: string[];
  conditions?: string[];
  chronicConditions?: string[];
  medications?: string[];
  notes?: string;
  weightHistory?: AnimalWeightRecord[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  animalId: string;
  animalName: string;
  animalSpecies?: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  vetId?: string;
  veterinarianId?: string;
  vetName?: string;
  veterinarianName?: string;
  vetSpecialization?: string;
  vetAvatarUrl?: string;
  type?: AppointmentType;
  consultationType?: AppointmentType;
  dateTimeUtc?: string;
  appointmentDate?: string;
  timeSlot?: string;
  durationMinutes?: number;
  reason: string;
  symptoms?: string | string[];
  symptomDuration?: string;
  documentUrls?: string[];
  attachments?: string[];
  status: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  fee?: number;
  amountPaid?: number;
  paymentId?: string;
  meetingLink?: string;
  clinicalNotesSummary?: string;
  prescriptionId?: string;
  reviewSubmitted?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text?: string;
  content?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'document';
  timestamp?: string;
  createdAt?: string;
}
export type ConsultationMessage = ChatMessage;

export interface ClinicalNotes {
  appointmentId: string;
  animalId: string;
  vetId: string;
  symptoms: string;
  examinationFindings: string;
  assessment: string;
  treatmentPlan: string;
  followUpRecommendation: string;
  attachments?: string[];
  updatedAt: string;
}

export interface MedicationItem {
  id?: string;
  medicationName?: string;
  name?: string;
  strength: string; // e.g. "250mg"
  form?: string; // Tablet, Syrup, Injection, Ointment, Drops
  dosage: string; // "1 tablet"
  frequency: string; // "Twice daily with meals"
  duration?: string; // "7 days"
  durationDays?: number;
  route: string; // Oral, Topical, Subcutaneous
  instructions: string;
  warnings?: string;
  refills?: number;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  animalId: string;
  animalName: string;
  animalSpecies?: string;
  vetId?: string;
  vetName?: string;
  veterinarianName?: string;
  vetLicenseNumber: string;
  vetQualification?: string;
  ownerName?: string;
  diagnosis?: string;
  medications?: MedicationItem[];
  items?: MedicationItem[];
  notes?: string;
  status?: PrescriptionStatus;
  createdAt: string;
  validUntil?: string;
}

export interface Vaccination {
  id: string;
  animalId: string;
  animalName: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate: string;
  batchNumber?: string;
  veterinarianName: string;
  notes?: string;
  status: VaccinationStatus;
}
export type VaccinationRecord = Vaccination;

export interface MedicalRecord {
  id: string;
  animalId: string;
  appointmentId?: string;
  vetId?: string;
  vetName: string;
  date: string;
  title: string;
  symptoms: string;
  examinationFindings: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  attachments?: string[];
}

export interface Invoice {
  id: string;
  appointmentId: string;
  userId: string;
  userName: string;
  vetName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionRef: string;
  createdAt: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface Review {
  id: string;
  vetId: string;
  userId: string;
  userName: string;
  appointmentId: string;
  rating: number; // 1 - 5
  comment: string;
  verifiedAppointment: boolean;
  status: 'APPROVED' | 'PENDING_MODERATION' | 'REJECTED';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'appointment_booked'
    | 'appointment_confirmed'
    | 'appointment_cancelled'
    | 'appointment_reminder'
    | 'payment_successful'
    | 'payment_failed'
    | 'prescription_created'
    | 'vaccination_reminder'
    | 'new_message'
    | 'vet_verification_status'
    | 'support_response';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  response?: string;
  createdAt: string;
}

export interface SpeciesCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  commonBreeds: string[];
}

export interface AuditLogItem {
  id: string;
  action: string;
  performedBy: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  fullRefundWindowHours: number;
  partialRefundHours: number;
  partialRefundPercent: number;
  platformFeePercent: number;
  maintenanceMode: boolean;
  emergencyPhone: string;
}

export type MedicineCategory =
  | 'ALL'
  | 'PRESCRIPTION_RX'
  | 'FLEA_TICK_DEWORMING'
  | 'JOINT_MOBILITY'
  | 'SKIN_DERMATOLOGY'
  | 'DIGESTIVE_PROBIOTICS'
  | 'ANTIBIOTICS_PAIN'
  | 'EAR_EYE_CARE'
  | 'FIRST_AID_WELLNESS';

export interface MedicineProduct {
  id: string;
  name: string;
  genericName?: string;
  brand: string;
  category: MedicineCategory;
  targetSpecies: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity: number;
  requiresPrescription: boolean;
  dosageForm: string;
  packageSize: string;
  strength?: string;
  description: string;
  indications: string;
  dosageGuide: string;
  sideEffects?: string;
  warnings?: string;
  imageUrl: string;
  featured?: boolean;
}

export interface PharmacyOrderItem {
  productId: string;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  requiresPrescription: boolean;
  prescriptionId?: string;
  dosageForm: string;
  packageSize: string;
}

export interface PharmacyOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: PharmacyOrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  prescriptionUploaded?: boolean;
  prescriptionId?: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    stateZip: string;
    phone: string;
  };
  deliveryMethod: 'STANDARD' | 'EXPRESS_COLD_CHAIN';
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING';
  orderStatus: 'CONFIRMED' | 'PHARMACIST_VERIFYING' | 'DISPATCHED' | 'DELIVERED';
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
}

export interface CartItem {
  product: MedicineProduct;
  quantity: number;
  prescriptionId?: string;
}
