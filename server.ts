import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  User,
  VeterinarianProfile,
  Animal,
  Appointment,
  ChatMessage,
  ClinicalNotes,
  Prescription,
  Vaccination,
  MedicalRecord,
  Invoice,
  Review,
  NotificationItem,
  SupportTicket,
  SystemSettings,
  AuditLogItem,
  MedicineProduct,
  PharmacyOrder,
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// -------------------------------------------------------------
// In-Memory Database Store with Pre-Seeded Production Demo Data
// -------------------------------------------------------------

const db = {
  users: [] as (User & { passwordHash: string })[],
  vetProfiles: [] as VeterinarianProfile[],
  animals: [] as Animal[],
  appointments: [] as Appointment[],
  chatMessages: [] as ChatMessage[],
  clinicalNotes: [] as ClinicalNotes[],
  prescriptions: [] as Prescription[],
  vaccinations: [] as Vaccination[],
  medicalRecords: [] as MedicalRecord[],
  invoices: [] as Invoice[],
  reviews: [] as Review[],
  notifications: [] as NotificationItem[],
  supportTickets: [] as SupportTicket[],
  auditLogs: [] as AuditLogItem[],
  pharmacyProducts: [] as MedicineProduct[],
  pharmacyOrders: [] as PharmacyOrder[],
  settings: {
    fullRefundWindowHours: 24,
    partialRefundHours: 2,
    partialRefundPercent: 50,
    platformFeePercent: 10,
    maintenanceMode: false,
    emergencyPhone: '+1 (800) 555-8387',
  } as SystemSettings,
};

// Password helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'vetcare_salt').digest('hex');
}

// Seed the platform with realistic, rich clinical data
function initializeSeedData() {
  const now = new Date();

  // 1. Users
  const ownerUser: User & { passwordHash: string } = {
    id: 'user-owner-1',
    name: 'Eleanor Vance',
    email: 'owner@vetcare.com',
    phone: '+1 (555) 234-5678',
    role: 'USER',
    preferredLanguage: 'en',
    city: 'Seattle',
    country: 'United States',
    emailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
    passwordHash: hashPassword('password123'),
  };

  const vetUser1: User & { passwordHash: string } = {
    id: 'user-vet-1',
    name: 'Dr. Sarah Jenkins, BVSc, MRCVS',
    email: 'vet@vetcare.com',
    phone: '+1 (555) 345-6789',
    role: 'VETERINARIAN',
    preferredLanguage: 'en',
    city: 'Boston',
    country: 'United States',
    emailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date(now.getTime() - 180 * 86400000).toISOString(),
    passwordHash: hashPassword('password123'),
  };

  const vetUser2: User & { passwordHash: string } = {
    id: 'user-vet-2',
    name: 'Dr. Marcus Vance, DVM',
    email: 'vet2@vetcare.com',
    phone: '+1 (555) 456-7890',
    role: 'VETERINARIAN',
    preferredLanguage: 'en',
    city: 'Denver',
    country: 'United States',
    emailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date(now.getTime() - 120 * 86400000).toISOString(),
    passwordHash: hashPassword('password123'),
  };

  const vetUser3: User & { passwordHash: string } = {
    id: 'user-vet-3',
    name: 'Dr. Ananya Roy, MVSc (Avian & Exotic)',
    email: 'vet3@vetcare.com',
    phone: '+1 (555) 567-8901',
    role: 'VETERINARIAN',
    preferredLanguage: 'bn',
    city: 'Austin',
    country: 'United States',
    emailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1594824813627-2ee0f16f3938?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date(now.getTime() - 150 * 86400000).toISOString(),
    passwordHash: hashPassword('password123'),
  };

  const adminUser: User & { passwordHash: string } = {
    id: 'user-admin-1',
    name: 'VetCare Admin',
    email: 'admin@vetcare.com',
    phone: '+1 (800) 555-8387',
    role: 'ADMIN',
    preferredLanguage: 'en',
    city: 'San Francisco',
    country: 'United States',
    emailVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
    createdAt: new Date(now.getTime() - 365 * 86400000).toISOString(),
    passwordHash: hashPassword('password123'),
  };

  db.users = [ownerUser, vetUser1, vetUser2, vetUser3, adminUser];

  // 2. Veterinarian Profiles
  db.vetProfiles = [
    {
      id: 'vet-profile-1',
      userId: vetUser1.id,
      name: 'Dr. Sarah Jenkins, BVSc, MRCVS',
      email: vetUser1.email,
      phone: vetUser1.phone,
      avatarUrl: vetUser1.avatarUrl || '',
      qualification: 'BVSc, MRCVS, Dipl. ACVIM (Canine & Feline Internal Medicine)',
      university: 'Royal Veterinary College, London',
      graduationYear: 2012,
      licenseNumber: 'VET-UK-78921',
      licenseAuthority: 'Royal College of Veterinary Surgeons (RCVS)',
      specializations: ['Canine Medicine', 'Feline Internal Medicine', 'Dermatology', 'Preventive Care'],
      supportedSpecies: ['Dogs', 'Cats', 'Rabbits'],
      yearsExperience: 14,
      languages: ['English', 'French'],
      bio: 'Dr. Sarah Jenkins is an internationally certified small-animal clinician with over 14 years of hospital and emergency triage experience. She specializes in chronic skin allergies, gastrointestinal management, feline geriatrics, and nutrition.',
      consultationFee: 45,
      clinicVisitFee: 80,
      rating: 4.95,
      reviewCount: 128,
      status: 'VERIFIED',
      documentUrls: {
        degree: 'https://example.com/docs/rvc-degree.pdf',
        license: 'https://example.com/docs/rcvs-license.pdf',
        identity: 'https://example.com/docs/id-passport.pdf',
      },
      clinicAddress: '42 Beacon Street, Suite 3B, Boston, MA 02108',
      city: 'Boston',
      country: 'United States',
      weeklySchedule: [
        { day: 'Monday', active: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Tuesday', active: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Wednesday', active: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Thursday', active: true, startTime: '09:00', endTime: '18:00' },
        { day: 'Friday', active: true, startTime: '09:00', endTime: '17:00' },
        { day: 'Saturday', active: true, startTime: '10:00', endTime: '14:00' },
        { day: 'Sunday', active: false, startTime: '10:00', endTime: '14:00' },
      ],
      breaks: [{ startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }],
      consultationDurationMinutes: 30,
      timezone: 'America/New_York',
    },
    {
      id: 'vet-profile-2',
      userId: vetUser2.id,
      name: 'Dr. Marcus Vance, DVM',
      email: vetUser2.email,
      phone: vetUser2.phone,
      avatarUrl: vetUser2.avatarUrl || '',
      qualification: 'DVM, Board Certified Equine & Large Animal Practitioner',
      university: 'Colorado State University College of Veterinary Medicine',
      graduationYear: 2010,
      licenseNumber: 'CO-VET-44391',
      licenseAuthority: 'Colorado State Board of Veterinary Medicine',
      specializations: ['Equine Sports Medicine', 'Bovine Health & Herd Management', 'Livestock Nutrition', 'Goats & Sheep'],
      supportedSpecies: ['Horses', 'Cows', 'Goats', 'Dogs'],
      yearsExperience: 16,
      languages: ['English', 'Spanish'],
      bio: 'Dr. Marcus Vance brings 16+ years of field and ranch experience diagnosing equine lameness, dairy cattle health, pasture nutrition, and herd biosecurity. Available for both online tele-triage and mobile ranch visits.',
      consultationFee: 65,
      clinicVisitFee: 120,
      rating: 4.88,
      reviewCount: 94,
      status: 'VERIFIED',
      documentUrls: {
        degree: 'https://example.com/docs/csu-dvm.pdf',
        license: 'https://example.com/docs/co-license.pdf',
      },
      clinicAddress: '780 Foothills Ranch Road, Golden, CO 80401',
      city: 'Denver',
      country: 'United States',
      weeklySchedule: [
        { day: 'Monday', active: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Tuesday', active: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Wednesday', active: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Thursday', active: true, startTime: '08:00', endTime: '17:00' },
        { day: 'Friday', active: true, startTime: '08:00', endTime: '16:00' },
        { day: 'Saturday', active: false, startTime: '09:00', endTime: '13:00' },
        { day: 'Sunday', active: false, startTime: '09:00', endTime: '13:00' },
      ],
      breaks: [{ startTime: '12:00', endTime: '13:00', description: 'Field Triage Break' }],
      consultationDurationMinutes: 40,
      timezone: 'America/Denver',
    },
    {
      id: 'vet-profile-3',
      userId: vetUser3.id,
      name: 'Dr. Ananya Roy, MVSc (Avian & Exotic)',
      email: vetUser3.email,
      phone: vetUser3.phone,
      avatarUrl: vetUser3.avatarUrl || '',
      qualification: 'BVSc & AH, MVSc (Avian Medicine & Exotic Pet Surgery)',
      university: 'West Bengal University of Animal and Fishery Sciences',
      graduationYear: 2015,
      licenseNumber: 'WB-VET-98214',
      licenseAuthority: 'Veterinary Council of India & Texas State Board',
      specializations: ['Avian Medicine', 'Parrots & Birds', 'Exotic Mammals', 'Rabbits & Rodents', 'Reptile Health'],
      supportedSpecies: ['Birds', 'Rabbits', 'Cats', 'Other domestic/farm animals'],
      yearsExperience: 11,
      languages: ['English', 'Bengali (বাংলা)', 'Hindi'],
      bio: 'Dr. Ananya Roy specializes in avian medicine, parrots, cage birds, rabbits, and small companion mammals. She offers comprehensive diagnostics for feather picking, respiratory issues, beak abnormalities, and specialized nutritional care.',
      consultationFee: 50,
      clinicVisitFee: 90,
      rating: 4.98,
      reviewCount: 86,
      status: 'VERIFIED',
      documentUrls: {
        degree: 'https://example.com/docs/mvsc-degree.pdf',
        license: 'https://example.com/docs/vci-license.pdf',
      },
      clinicAddress: '1504 South Lamar Blvd, Austin, TX 78704',
      city: 'Austin',
      country: 'United States',
      weeklySchedule: [
        { day: 'Monday', active: true, startTime: '10:00', endTime: '19:00' },
        { day: 'Tuesday', active: true, startTime: '10:00', endTime: '19:00' },
        { day: 'Wednesday', active: true, startTime: '10:00', endTime: '19:00' },
        { day: 'Thursday', active: true, startTime: '10:00', endTime: '19:00' },
        { day: 'Friday', active: true, startTime: '10:00', endTime: '18:00' },
        { day: 'Saturday', active: true, startTime: '10:00', endTime: '16:00' },
        { day: 'Sunday', active: false, startTime: '10:00', endTime: '14:00' },
      ],
      breaks: [{ startTime: '14:00', endTime: '15:00', description: 'Afternoon Break' }],
      consultationDurationMinutes: 30,
      timezone: 'America/Chicago',
    },
    {
      id: 'vet-4-pending',
      userId: 'user-pending-vet-1',
      name: 'Dr. Marcus Vance',
      email: 'marcus.vance@vetmed.org',
      phone: '+1 (415) 555-9012',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      qualification: 'DVM, MS (Equine & Large Animal Surgery)',
      university: 'Cornell University College of Veterinary Medicine',
      graduationYear: 2021,
      licenseNumber: 'CA-VET-44910',
      licenseAuthority: 'California Veterinary Medical Board',
      specializations: ['Equine Sports Medicine', 'Livestock Health', 'Ultrasound Diagnostics'],
      supportedSpecies: ['Horses', 'Cattle', 'Dogs', 'Other domestic/farm animals'],
      yearsExperience: 4,
      languages: ['English', 'Spanish'],
      bio: 'Equine specialist and herd health practitioner offering comprehensive telemedicine evaluations for movement disorders, colic triage, and preventive herd vaccinations.',
      consultationFee: 65,
      clinicVisitFee: 120,
      rating: 5.0,
      reviewCount: 0,
      status: 'PENDING',
      verificationStatus: 'PENDING',
      documentUrls: {
        degree: 'https://example.com/docs/cornell-dvm.pdf',
        license: 'https://example.com/docs/ca-board-license.pdf',
      },
      clinicAddress: '780 Ranchero Way, Petaluma, CA 94952',
      city: 'San Francisco',
      country: 'United States',
      weeklySchedule: [
        { day: 'Monday', active: true, startTime: '08:00', endTime: '16:00' },
        { day: 'Tuesday', active: true, startTime: '08:00', endTime: '16:00' },
        { day: 'Wednesday', active: true, startTime: '08:00', endTime: '16:00' },
        { day: 'Thursday', active: true, startTime: '08:00', endTime: '16:00' },
        { day: 'Friday', active: true, startTime: '08:00', endTime: '14:00' },
        { day: 'Saturday', active: false, startTime: '09:00', endTime: '13:00' },
        { day: 'Sunday', active: false, startTime: '09:00', endTime: '13:00' },
      ],
      breaks: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }],
      consultationDurationMinutes: 30,
      timezone: 'America/Los_Angeles',
    },
  ];

  // 3. Animals belonging to Eleanor Vance
  db.animals = [
    {
      id: 'animal-1',
      ownerId: ownerUser.id,
      name: 'Max',
      species: 'Dogs',
      breed: 'Golden Retriever',
      sex: 'MALE',
      dateOfBirth: '2022-04-15',
      approximateAge: '4 years',
      weightKg: 31.4,
      color: 'Honey Gold',
      microchipNumber: '985141002394812',
      photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
      isSterilized: true,
      allergies: ['Beef protein', 'Chicken meal'],
      conditions: ['Mild Hip Dysplasia (Grade 1)', 'Seasonal Grass Allergy'],
      medications: ['Omega-3 Joint Supplement 1000mg', 'Glucosamine HCl 500mg'],
      notes: 'Loves swimming, slightly cautious around loud thunder. Very cooperative during paw examinations.',
      weightHistory: [
        { date: '2025-12-10', weightKg: 32.1, notes: 'Routine check' },
        { date: '2026-03-02', weightKg: 31.8, notes: 'Post diet modification' },
        { date: '2026-06-18', weightKg: 31.4, notes: 'Optimal active weight' },
      ],
      createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
    },
    {
      id: 'animal-2',
      ownerId: ownerUser.id,
      name: 'Luna',
      species: 'Cats',
      breed: 'Siamese Cross',
      sex: 'FEMALE',
      dateOfBirth: '2024-02-10',
      approximateAge: '2 years',
      weightKg: 4.1,
      color: 'Seal Point Cream',
      microchipNumber: '985141009941235',
      photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      isSterilized: true,
      allergies: [],
      conditions: ['Sensitive stomach'],
      medications: ['Probiotic Paste 1ml'],
      notes: 'Strictly indoor cat. High energy and vocal.',
      weightHistory: [
        { date: '2025-10-15', weightKg: 3.9, notes: 'Spay recovery weight' },
        { date: '2026-04-12', weightKg: 4.1, notes: 'Healthy adult weight' },
      ],
      createdAt: new Date(now.getTime() - 50 * 86400000).toISOString(),
    },
    {
      id: 'animal-3',
      ownerId: ownerUser.id,
      name: 'Charlie',
      species: 'Birds',
      breed: 'African Grey Parrot',
      sex: 'MALE',
      dateOfBirth: '2020-07-20',
      approximateAge: '6 years',
      weightKg: 0.44,
      color: 'Silver Grey with Scarlet Tail',
      microchipNumber: '985141004123891',
      photoUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=400',
      isSterilized: false,
      allergies: ['Aerosol sprays (severe hazard)'],
      conditions: ['Mild chest feather plucking during seasonal molting'],
      medications: ['Avian Multivitamin drops in drinking water'],
      notes: 'Extremely smart. Talks and whistles tunes. Needs gentle quiet handling during vet consultation.',
      weightHistory: [
        { date: '2025-11-20', weightKg: 0.45, notes: 'Baseline' },
        { date: '2026-05-14', weightKg: 0.44, notes: 'Healthy' },
      ],
      createdAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
    },
  ];

  // 4. Appointments
  const pastApptTime = new Date(now.getTime() - 14 * 86400000).toISOString();
  const upcomingApptTime = new Date(now.getTime() + 2 * 86400000 + 3600000).toISOString();
  const todayApptTime = new Date(now.getTime() + 1800000).toISOString(); // 30 mins from now! Ready to join!

  db.appointments = [
    {
      id: 'appt-1',
      animalId: 'animal-1',
      animalName: 'Max',
      animalSpecies: 'Dogs',
      ownerId: ownerUser.id,
      ownerName: ownerUser.name,
      ownerEmail: ownerUser.email,
      vetId: 'vet-profile-1',
      vetName: 'Dr. Sarah Jenkins, BVSc, MRCVS',
      vetSpecialization: 'Canine Medicine & Dermatology',
      vetAvatarUrl: vetUser1.avatarUrl || '',
      type: 'ONLINE_VIDEO',
      dateTimeUtc: todayApptTime,
      durationMinutes: 30,
      reason: 'Routine skin follow-up & ear irritation',
      symptoms: ['Head shaking', 'Scratching left ear', 'Mild redness on paws'],
      documentUrls: [],
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fee: 45,
      paymentId: 'pi_mock_982419241',
      meetingLink: '/consultation/appt-1',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: 'appt-2',
      animalId: 'animal-2',
      animalName: 'Luna',
      animalSpecies: 'Cats',
      ownerId: ownerUser.id,
      ownerName: ownerUser.name,
      ownerEmail: ownerUser.email,
      vetId: 'vet-profile-1',
      vetName: 'Dr. Sarah Jenkins, BVSc, MRCVS',
      vetSpecialization: 'Feline Medicine',
      vetAvatarUrl: vetUser1.avatarUrl || '',
      type: 'ONLINE_VIDEO',
      dateTimeUtc: upcomingApptTime,
      durationMinutes: 30,
      reason: 'Dietary transition advice & hairball frequency',
      symptoms: ['Occasional vomiting of hairballs', 'Decreased wet food appetite'],
      documentUrls: [],
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      fee: 45,
      paymentId: 'pi_mock_881928419',
      meetingLink: '/consultation/appt-2',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: 'appt-3',
      animalId: 'animal-1',
      animalName: 'Max',
      animalSpecies: 'Dogs',
      ownerId: ownerUser.id,
      ownerName: ownerUser.name,
      ownerEmail: ownerUser.email,
      vetId: 'vet-profile-1',
      vetName: 'Dr. Sarah Jenkins, BVSc, MRCVS',
      vetSpecialization: 'Canine Medicine',
      vetAvatarUrl: vetUser1.avatarUrl || '',
      type: 'ONLINE_VIDEO',
      dateTimeUtc: pastApptTime,
      durationMinutes: 30,
      reason: 'Limping on right hind leg after beach run',
      symptoms: ['Stiffness getting up', 'Licking right hock joint'],
      documentUrls: [],
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      fee: 45,
      paymentId: 'pi_mock_773192019',
      meetingLink: '/consultation/appt-3',
      clinicalNotesSummary: 'Mild soft tissue strain of right stifle. Prescribed Carprofen 75mg for 5 days. Joint rest advised.',
      prescriptionId: 'presc-1',
      reviewSubmitted: true,
      createdAt: new Date(now.getTime() - 16 * 86400000).toISOString(),
    },
  ];

  // 5. Prescriptions
  db.prescriptions = [
    {
      id: 'presc-1',
      appointmentId: 'appt-3',
      animalId: 'animal-1',
      animalName: 'Max',
      animalSpecies: 'Dogs',
      vetId: 'vet-profile-1',
      vetName: 'Dr. Sarah Jenkins, BVSc, MRCVS',
      vetLicenseNumber: 'VET-UK-78921',
      vetQualification: 'BVSc, MRCVS, Dipl. ACVIM',
      ownerName: 'Eleanor Vance',
      medications: [
        {
          id: 'med-1',
          name: 'Carprofen Chewable Tablets (Rimadyl)',
          strength: '75mg',
          form: 'Chewable Tablet',
          dosage: '1 tablet (approx 2.4 mg/kg)',
          frequency: 'Once daily in the morning with food',
          duration: '5 days',
          route: 'Oral',
          instructions: 'Administer with breakfast. Discontinue immediately if gastrointestinal upset or lethargy occurs.',
          warnings: 'NSAID caution: Do not combine with other NSAIDs or steroids.',
          refills: 0,
        },
        {
          id: 'med-2',
          name: 'Omega-3 High-Potency EPA/DHA Fish Oil',
          strength: '1000mg',
          form: 'Liquid pump',
          dosage: '2 pumps mixed with evening meal',
          frequency: 'Once daily',
          duration: '60 days',
          route: 'Oral',
          instructions: 'Supports joint cartilage and alleviates seasonal allergic itch.',
          refills: 2,
        },
      ],
      notes: 'Re-evaluate if lameness persists beyond day 5. Restrict strenuous ball chasing and agility leaps for 10 days.',
      status: 'ACTIVE',
      createdAt: pastApptTime,
      validUntil: new Date(now.getTime() + 60 * 86400000).toISOString(),
    },
  ];

  // 6. Vaccinations
  db.vaccinations = [
    {
      id: 'vac-1',
      animalId: 'animal-1',
      animalName: 'Max',
      vaccineName: 'DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)',
      dateAdministered: '2025-08-10',
      nextDueDate: new Date(now.getTime() + 45 * 86400000).toISOString().split('T')[0],
      batchNumber: 'VBI-9021-K',
      veterinarianName: 'Dr. Sarah Jenkins',
      notes: 'Three-year booster scheduled. No post-vaccine reaction.',
      status: 'UPCOMING',
    },
    {
      id: 'vac-2',
      animalId: 'animal-1',
      animalName: 'Max',
      vaccineName: 'Rabies (3-Year Inactivated)',
      dateAdministered: '2024-06-12',
      nextDueDate: '2027-06-12',
      batchNumber: 'RAB-4410-X',
      veterinarianName: 'Dr. Sarah Jenkins',
      notes: 'State registered certificate #RAB-2024-9182',
      status: 'COMPLETED',
    },
    {
      id: 'vac-3',
      animalId: 'animal-2',
      animalName: 'Luna',
      vaccineName: 'FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)',
      dateAdministered: '2025-05-15',
      nextDueDate: new Date(now.getTime() + 15 * 86400000).toISOString().split('T')[0],
      batchNumber: 'FVR-8812-P',
      veterinarianName: 'Dr. Sarah Jenkins',
      notes: 'Annual core booster due soon.',
      status: 'UPCOMING',
    },
    {
      id: 'vac-4',
      animalId: 'animal-2',
      animalName: 'Luna',
      vaccineName: 'Rabies (1-Year Core)',
      dateAdministered: '2025-05-15',
      nextDueDate: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0],
      batchNumber: 'RAB-FEL-102',
      veterinarianName: 'Dr. Sarah Jenkins',
      notes: 'Overdue for annual revaccination.',
      status: 'OVERDUE',
    },
  ];

  // 7. Medical Records
  db.medicalRecords = [
    {
      id: 'medrec-1',
      animalId: 'animal-1',
      appointmentId: 'appt-3',
      vetId: 'vet-profile-1',
      vetName: 'Dr. Sarah Jenkins',
      date: pastApptTime.split('T')[0],
      title: 'Acute Hindlimb Lameness Assessment & Triage',
      symptoms: 'Mild right hind weight-bearing lameness after running on sand. No swelling or crepitus on palpation.',
      examinationFindings: 'Good body condition (BCS 5/9). Stifle stable, cranial drawer negative. Mild discomfort on hip extension.',
      diagnosis: 'Mild muscular strain / soft tissue inflammation',
      treatment: 'Prescribed Carprofen 75mg for 5 days. Restrict exercise to leash walks for 1 week.',
      notes: 'Client showed video of dog gait during telemedicine call. Gait analysis documented.',
    },
    {
      id: 'medrec-2',
      animalId: 'animal-2',
      vetName: 'Dr. Sarah Jenkins',
      date: '2025-10-15',
      title: 'Post-Spay Surgical Site Follow-Up',
      symptoms: 'Post-operative monitoring check.',
      examinationFindings: 'Incision site well-apposed, no discharge, erythema minimal. Appetite normal.',
      diagnosis: 'Normal uncomplicated post-operative healing',
      treatment: 'Cone removal authorized on day 10. Normal dry kibble continued.',
    },
  ];

  // 8. Invoices
  db.invoices = [
    {
      id: 'inv-1001',
      appointmentId: 'appt-1',
      userId: ownerUser.id,
      userName: ownerUser.name,
      vetName: 'Dr. Sarah Jenkins',
      amount: 45,
      currency: 'USD',
      status: 'PAID',
      paymentMethod: 'Credit Card (Stripe)',
      transactionRef: 'ch_3N8vKj2eZvKYlo2C1g34Mock',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: 'inv-1002',
      appointmentId: 'appt-2',
      userId: ownerUser.id,
      userName: ownerUser.name,
      vetName: 'Dr. Sarah Jenkins',
      amount: 45,
      currency: 'USD',
      status: 'PAID',
      paymentMethod: 'Credit Card (Stripe)',
      transactionRef: 'ch_3N8vKj2eZvKYlo2C2h56Mock',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: 'inv-1003',
      appointmentId: 'appt-3',
      userId: ownerUser.id,
      userName: ownerUser.name,
      vetName: 'Dr. Sarah Jenkins',
      amount: 45,
      currency: 'USD',
      status: 'PAID',
      paymentMethod: 'Credit Card (Stripe)',
      transactionRef: 'ch_3N8vKj2eZvKYlo2C3j78Mock',
      createdAt: new Date(now.getTime() - 16 * 86400000).toISOString(),
    },
  ];

  // 9. Reviews
  db.reviews = [
    {
      id: 'rev-1',
      vetId: 'vet-profile-1',
      userId: ownerUser.id,
      userName: 'Eleanor Vance',
      appointmentId: 'appt-3',
      rating: 5,
      comment: 'Dr. Jenkins was incredible! She thoroughly examined Max over the HD video call, noticed the slight limp right away, and provided an accurate diagnosis and prompt prescription. Max is running happily again!',
      verifiedAppointment: true,
      status: 'APPROVED',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 'rev-2',
      vetId: 'vet-profile-1',
      userId: 'user-sample-2',
      userName: 'David Miller',
      appointmentId: 'appt-sample-2',
      rating: 5,
      comment: 'Super fast response for my rescue cat who had sudden allergy flare-ups. Saved us an expensive emergency clinic ride.',
      verifiedAppointment: true,
      status: 'APPROVED',
      createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
    },
    {
      id: 'rev-3',
      vetId: 'vet-profile-3',
      userId: 'user-sample-3',
      userName: 'Kazi Rahman',
      appointmentId: 'appt-sample-3',
      rating: 5,
      comment: 'অসাধারণ সেবা! ড. অনন্যা রায় আমার গ্রে প্যারটের পালক ঝরার সমস্যাটি চমৎকারভাবে বুঝিয়ে দিয়েছেন এবং বাংলা ভাষায় বিস্তারিত নির্দেশনা দিয়েছেন।',
      verifiedAppointment: true,
      status: 'APPROVED',
      createdAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
    },
    {
      id: 'rev-4',
      vetId: 'vet-profile-2',
      userId: 'user-sample-4',
      userName: 'Wyatt Cooper',
      appointmentId: 'appt-sample-4',
      rating: 5,
      comment: 'Dr. Marcus analyzed our herd vaccination protocol and saved two heifers with early respiratory advice. Best large animal vet around.',
      verifiedAppointment: true,
      status: 'APPROVED',
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
  ];

  // 10. Notifications
  db.notifications = [
    {
      id: 'notif-1',
      userId: ownerUser.id,
      title: 'Appointment Ready to Join',
      message: 'Your video consultation with Dr. Sarah Jenkins for Max is starting shortly.',
      type: 'appointment_reminder',
      read: false,
      link: '/consultation/appt-1',
      createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    },
    {
      id: 'notif-2',
      userId: ownerUser.id,
      title: 'Vaccine Overdue Alert',
      message: 'Luna is overdue for the 1-Year Core Rabies booster. Please book a visit.',
      type: 'vaccination_reminder',
      read: false,
      link: '/dashboard/animals/animal-2',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: 'notif-3',
      userId: ownerUser.id,
      title: 'Prescription Issued',
      message: 'Dr. Jenkins issued an active prescription for Max (Carprofen & Omega-3).',
      type: 'prescription_created',
      read: true,
      link: '/dashboard/prescriptions',
      createdAt: pastApptTime,
    },
  ];

  // 11. Initial Chat messages for appt-1
  db.chatMessages = [
    {
      id: 'msg-1',
      appointmentId: 'appt-1',
      senderId: vetUser1.id,
      senderName: 'Dr. Sarah Jenkins',
      senderRole: 'VETERINARIAN',
      text: 'Hello Eleanor! Welcome to VetCare video clinic. I am reviewing Max’s chart now. Feel free to turn on your camera and show me his left ear.',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
    {
      id: 'msg-2',
      appointmentId: 'appt-1',
      senderId: ownerUser.id,
      senderName: 'Eleanor Vance',
      senderRole: 'USER',
      text: 'Hi Dr. Jenkins! Thank you. I have him sitting right here next to me.',
      timestamp: new Date(now.getTime() - 14 * 60000).toISOString(),
    },
  ];

  // 12. Audit Logs
  db.auditLogs = [
    {
      id: 'audit-1',
      action: 'VET_VERIFIED',
      performedBy: 'admin@vetcare.com',
      targetType: 'VETERINARIAN',
      targetId: 'vet-profile-1',
      details: 'Dr. Sarah Jenkins credentials and RCVS license verified successfully.',
      timestamp: new Date(now.getTime() - 90 * 86400000).toISOString(),
    },
    {
      id: 'audit-2',
      action: 'PAYMENT_CONFIRMED',
      performedBy: 'SYSTEM_STRIPE_WEBHOOK',
      targetType: 'APPOINTMENT',
      targetId: 'appt-1',
      details: 'Payment of $45.00 captured via Stripe Intent ch_3N8vKj2eZvKYlo2C1g34Mock',
      timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
  ];

  // 13. Online Pharmacy & Medicine Store Products
  db.pharmacyProducts = [
    {
      id: 'prod-carprofen-75',
      name: 'Carprofen Chewable Tablets (Rimadyl)',
      genericName: 'Carprofen',
      brand: 'Zoetis Animal Health',
      category: 'PRESCRIPTION_RX',
      targetSpecies: ['Dogs'],
      price: 34.50,
      originalPrice: 42.00,
      rating: 4.9,
      reviewsCount: 128,
      inStock: true,
      stockQuantity: 45,
      requiresPrescription: true,
      dosageForm: 'Chewable Liver Tablets',
      packageSize: '30 Tablets',
      strength: '75mg',
      description: 'Clinically proven non-steroidal anti-inflammatory drug (NSAID) designed to relieve acute pain and chronic inflammation associated with osteoarthritis and orthopedic surgery in dogs.',
      indications: 'Relief of pain and inflammation associated with canine osteoarthritis and for the control of postoperative pain associated with soft tissue and orthopedic surgeries.',
      dosageGuide: 'Administer orally at 2 mg/lb (4.4 mg/kg) of body weight daily, or divided into 1 mg/lb twice daily with food.',
      sideEffects: 'Mild gastrointestinal upset, decreased appetite, vomiting. Discontinue if lethargy occurs.',
      warnings: 'Prescription required. Do not use in cats or combine with corticosteroids.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
      featured: true,
    },
    {
      id: 'prod-easotic-drops',
      name: 'EasOtic Otic Suspension Ear Drops',
      genericName: 'Hydrocortisone aceponate, Miconazole nitrate, Gentamicin sulfate',
      brand: 'Virbac Animal Health',
      category: 'EAR_EYE_CARE',
      targetSpecies: ['Dogs'],
      price: 41.20,
      originalPrice: 48.00,
      rating: 4.8,
      reviewsCount: 94,
      inStock: true,
      stockQuantity: 38,
      requiresPrescription: true,
      dosageForm: 'Ergonomic Pump Suspension',
      packageSize: '10ml Metered Dose',
      strength: 'Triple Active Antibacterial + Antifungal + Steroid',
      description: 'Advanced, once-daily treatment for canine otitis externa. Features an atraumatic applicator tip that dispenses precisely 1 ml per pump regardless of canister angle.',
      indications: 'Treatment of canine acute or recurrent otitis externa caused by susceptible strains of yeast (Malassezia pachydermatis) and bacteria (Staphylococcus pseudintermedius).',
      dosageGuide: 'Apply 1 pump (1 ml) into each affected ear once daily for 5 consecutive days. Massage ear base gently after application.',
      sideEffects: 'Temporary mild redness of the inner ear flap or head shaking right after administration.',
      warnings: 'Prescription required. Verify intact tympanic membrane (eardrum) prior to administration.',
      imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600',
      featured: true,
    },
    {
      id: 'prod-apoquel-16',
      name: 'Apoquel Allergy Tablets',
      genericName: 'Oclacitinib Maleate',
      brand: 'Zoetis',
      category: 'PRESCRIPTION_RX',
      targetSpecies: ['Dogs'],
      price: 68.00,
      originalPrice: 78.50,
      rating: 4.9,
      reviewsCount: 310,
      inStock: true,
      stockQuantity: 60,
      requiresPrescription: true,
      dosageForm: 'Film-Coated Tablets',
      packageSize: '30 Tablets',
      strength: '16mg',
      description: 'Targeted JAK inhibitor for fast relief of itching associated with allergic dermatitis and control of atopic dermatitis in dogs at least 12 months of age. Starts working within 4 hours.',
      indications: 'Control of pruritus associated with allergic dermatitis and control of atopic dermatitis in dogs.',
      dosageGuide: '0.4 to 0.6 mg/kg orally twice daily for up to 14 days, then once daily for maintenance therapy.',
      warnings: 'Prescription required. Do not use in dogs less than 12 months of age or with serious infections.',
      imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=600',
      featured: true,
    },
    {
      id: 'prod-clavamox-250',
      name: 'Clavamox Antibacterial Drops & Tablets',
      genericName: 'Amoxicillin and Clavulanate Potassium',
      brand: 'Zoetis',
      category: 'ANTIBIOTICS_PAIN',
      targetSpecies: ['Dogs', 'Cats'],
      price: 29.90,
      rating: 4.7,
      reviewsCount: 156,
      inStock: true,
      stockQuantity: 52,
      requiresPrescription: true,
      dosageForm: 'Scored Tablets',
      packageSize: '20 Tablets',
      strength: '250mg',
      description: 'Broad-spectrum antibiotic combining amoxicillin with clavulanic acid to protect against beta-lactamase enzymatic degradation. Highly effective for skin, soft tissue, and urinary tract infections.',
      indications: 'Skin and soft-tissue infections such as wounds, abscesses, cellulitis, and superficial/juvenile pyoderma in dogs and cats.',
      dosageGuide: '6.25 mg/lb of body weight twice daily for 5 to 7 days, up to 48 hours after all symptoms have subsided.',
      warnings: 'Prescription required. Contraindicated in animals with a history of penicillin or cephalosporin allergy.',
      imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-nexgard-spectra',
      name: 'NexGard Spectra Broad-Spectrum Chewables',
      genericName: 'Afoxolaner & Milbemycin Oxime',
      brand: 'Boehringer Ingelheim',
      category: 'FLEA_TICK_DEWORMING',
      targetSpecies: ['Dogs'],
      price: 52.00,
      originalPrice: 59.00,
      rating: 5.0,
      reviewsCount: 420,
      inStock: true,
      stockQuantity: 80,
      requiresPrescription: false,
      dosageForm: 'Soft Braised-Beef Chew',
      packageSize: '3 Chews (3-Month Supply)',
      strength: 'Medium Dog 15-30kg',
      description: 'Monthly all-in-one protection against fleas, paralysis ticks, bush ticks, brown dog ticks, heartworm disease, and common intestinal worms (roundworms, hookworms, whipworms).',
      indications: 'Monthly parasite prevention for dogs. Highly palatable soft beef chew that dogs consume willingly.',
      dosageGuide: '1 chew orally once every month. Can be given with or without food.',
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      featured: true,
    },
    {
      id: 'prod-bravecto-chew',
      name: 'Bravecto 3-Month Chew for Dogs',
      genericName: 'Fluralaner',
      brand: 'MSD Animal Health',
      category: 'FLEA_TICK_DEWORMING',
      targetSpecies: ['Dogs'],
      price: 58.00,
      rating: 4.9,
      reviewsCount: 290,
      inStock: true,
      stockQuantity: 44,
      requiresPrescription: false,
      dosageForm: 'Flavored Chewable Tablet',
      packageSize: '1 Chew (12-Week Protection)',
      strength: 'Large Dog 20-40kg',
      description: 'Convenient 12-week flea and tick protection in a single chew. Eliminates fleas within 2 hours and maintains steady active defense against black-legged deer ticks and American dog ticks.',
      indications: 'Treatment and prevention of flea infestations and multiple tick species for 12 continuous weeks.',
      dosageGuide: 'Administer 1 chewable tablet with food once every 12 weeks.',
      imageUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-revolution-plus',
      name: 'Revolution Plus 6-in-1 Topical for Cats',
      genericName: 'Selamectin and Sarolaner',
      brand: 'Zoetis',
      category: 'FLEA_TICK_DEWORMING',
      targetSpecies: ['Cats'],
      price: 49.50,
      originalPrice: 56.00,
      rating: 4.8,
      reviewsCount: 184,
      inStock: true,
      stockQuantity: 35,
      requiresPrescription: false,
      dosageForm: 'Clear Spot-On Liquid Pipette',
      packageSize: '3 Pipettes (3-Month Supply)',
      strength: 'Medium/Large Cats 2.6 - 7.5kg',
      description: 'Quick-drying, low-volume topical that protects indoor and outdoor cats against fleas, ticks, ear mites, roundworms, hookworms, and heartworm disease.',
      indications: 'Monthly topical feline parasite control. Safe for kittens from 8 weeks of age weighing 1.25 kg or greater.',
      dosageGuide: 'Part the fur on the back of the neck at the base of the skull and squeeze the tube until completely empty.',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
      featured: true,
    },
    {
      id: 'prod-cosequin-msm',
      name: 'Cosequin Maximum Strength Joint Health + MSM',
      genericName: 'Glucosamine HCl, Sodium Chondroitin Sulfate, Methylsulfonylmethane',
      brand: 'Nutramax Laboratories',
      category: 'JOINT_MOBILITY',
      targetSpecies: ['Dogs', 'Cats'],
      price: 38.99,
      originalPrice: 46.00,
      rating: 4.9,
      reviewsCount: 512,
      inStock: true,
      stockQuantity: 95,
      requiresPrescription: false,
      dosageForm: 'Tasty Chewable Tablets',
      packageSize: '120 Chewables',
      strength: 'Glucosamine 600mg / Chondroitin 300mg / MSM 250mg',
      description: 'Veterinarian recommended #1 brand for joint health. Formulated to support cartilage matrix regeneration, stimulate synovial fluid production, and maintain mobility in aging or active pets.',
      indications: 'Maintenance of joint cartilage, mobility, and ease of rising and climbing stairs.',
      dosageGuide: 'Initial loading: 2 tablets daily for 4-6 weeks; maintenance: 1 tablet daily.',
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
      featured: true,
    },
    {
      id: 'prod-pro-kolin',
      name: 'Pro-Kolin Advanced Digestive Support Paste',
      genericName: 'Enterococcus faecium, Kaolin, Montmorillonite, Preplex Prebiotics',
      brand: 'Protexin Veterinary',
      category: 'DIGESTIVE_PROBIOTICS',
      targetSpecies: ['Dogs', 'Cats'],
      price: 24.50,
      rating: 4.9,
      reviewsCount: 220,
      inStock: true,
      stockQuantity: 65,
      requiresPrescription: false,
      dosageForm: 'Calibrated Dial Syringe Paste',
      packageSize: '30ml Syringe',
      strength: 'Dual-Clay Kaolinite & Pectin Formula',
      description: 'Soothing palatable probiotic and prebiotic paste with dual-source binding clays and pectin to firm loose stools and re-establish a healthy gut microbiome during acute digestive upset.',
      indications: 'Rapid recovery from digestive upset, diet transition diarrhea, stress colitis, or post-antibiotic dysbiosis.',
      dosageGuide: 'Administer orally twice daily using the calibrated syringe ring. Dogs 15-30kg: 5ml twice daily.',
      imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-chlorhexidine-shampoo',
      name: 'Chlorhexidine 4% Medicated Antiseptic Shampoo',
      genericName: 'Chlorhexidine Gluconate 4%',
      brand: 'Douxo S3 Pyo',
      category: 'SKIN_DERMATOLOGY',
      targetSpecies: ['Dogs', 'Cats', 'Horses'],
      price: 27.50,
      rating: 4.8,
      reviewsCount: 165,
      inStock: true,
      stockQuantity: 40,
      requiresPrescription: false,
      dosageForm: 'Deep-Cleansing Lather Shampoo',
      packageSize: '250ml Pump Bottle',
      strength: '4% Chlorhexidine with Ophytrium Barrier Repair',
      description: 'Clinical strength antiseptic and antifungal shampoo designed for pets with severe pyoderma, Malassezia dermatitis, hot spots, and bacterial skin infections.',
      indications: 'Antiseptic cleansing for bacterial dermatitis, deep folliculitis, yeast overgrowth, and allergic skin barrier support.',
      dosageGuide: 'Wet coat thoroughly with warm water. Massage shampoo in for 10 minutes to allow contact time before rinsing clean.',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-vetericyn-hydrogel',
      name: 'Vetericyn Plus Antimicrobial Wound & Skin Hydrogel',
      genericName: 'Hypochlorous Acid (0.010%)',
      brand: 'Vetericyn',
      category: 'FIRST_AID_WELLNESS',
      targetSpecies: ['Dogs', 'Cats', 'Birds', 'Horses', 'Rabbits'],
      price: 21.95,
      rating: 4.9,
      reviewsCount: 380,
      inStock: true,
      stockQuantity: 70,
      requiresPrescription: false,
      dosageForm: 'Adherent Spray Hydrogel',
      packageSize: '100ml Spray Bottle',
      strength: 'pH-balanced Isotonic Hypochlorous formulation',
      description: 'Sting-free, non-toxic wound spray that sticks to cuts, scrapes, post-surgical incisions, burns, and hot spots. Safe if licked by animals of any species.',
      indications: 'Moist wound care, cuts, scratches, skin tears, post-operative suture care, and irritated skin folds.',
      dosageGuide: 'Spray directly on the affected area 3 to 4 times daily until healed. No rinsing required.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-optixcare-eye',
      name: 'Optixcare Eye Lube Plus with Hyaluron',
      genericName: 'Sterile Carbomer & Hyaluron Gel',
      brand: 'Aventix Ophthalmic',
      category: 'EAR_EYE_CARE',
      targetSpecies: ['Dogs', 'Cats', 'Horses'],
      price: 18.50,
      rating: 4.8,
      reviewsCount: 142,
      inStock: true,
      stockQuantity: 48,
      requiresPrescription: false,
      dosageForm: 'Sterile Ophthalmic Gel Tube',
      packageSize: '20g Tube',
      strength: 'High Viscosity Hyaluron Matrix',
      description: 'Long-lasting ocular hydration gel designed specifically for veterinary dry eye (Keratoconjunctivitis Sicca) and corneal surface protection during anesthesia or wind exposure.',
      indications: 'Dry eye lubrication, corneal tear film stabilization, dust protection, and soothing red eyes.',
      dosageGuide: 'Instill 1 to 2 drops into affected eye(s) 2 to 3 times daily or as advised by your veterinarian.',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-feliway-diffuser',
      name: 'Feliway Classic Calming Pheromone Diffuser & Refill',
      genericName: 'Feline Facial Pheromone Analogue (F3)',
      brand: 'Ceva Animal Health',
      category: 'FIRST_AID_WELLNESS',
      targetSpecies: ['Cats'],
      price: 36.99,
      rating: 4.7,
      reviewsCount: 205,
      inStock: true,
      stockQuantity: 32,
      requiresPrescription: false,
      dosageForm: 'Plug-in Ultrasonic Diffuser + Vial',
      packageSize: '48ml (30-Day Coverage up to 700 sq ft)',
      strength: '2% Synthetic F3 Fraction',
      description: 'Drug-free solution clinically shown to soothe stressed cats, reduce urine spraying, stop furniture scratching, and promote harmonious home acclimation.',
      indications: 'Stress-induced behavioral issues, multi-cat tension, moving to a new home, vet visit recovery.',
      dosageGuide: 'Plug diffuser upright in the room where the cat spends the most time. Replace refill vial every 30 days.',
      imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-harrisons-avian',
      name: "Harrison's High Potency Super Fine Certified Organic Bird Food",
      genericName: 'Complete Avian Extruded Nuggets',
      brand: "Harrison's Bird Foods",
      category: 'FIRST_AID_WELLNESS',
      targetSpecies: ['Birds'],
      price: 22.00,
      rating: 4.9,
      reviewsCount: 118,
      inStock: true,
      stockQuantity: 28,
      requiresPrescription: false,
      dosageForm: 'Fine Extruded Nuggets',
      packageSize: '450g Nitrogen-Flushed Pouch',
      strength: '100% Certified Organic Ingredients',
      description: 'Premium organic veterinary-formulated nutrition for birds undergoing molting, illness convalescence, post-operative recovery, or weight optimization.',
      indications: 'Convalescing parrots, parakeets, cockatiels, canaries, and finches requiring nutrient-dense feeding.',
      dosageGuide: 'Feed fresh daily. Clean feeding dish thoroughly between portions.',
      imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'prod-equine-electrolytes',
      name: 'Equine Electrolyte & Rehydration Paste',
      genericName: 'Sodium Chloride, Potassium, Calcium, Magnesium & Dextrose',
      brand: 'Farnam Equine',
      category: 'FIRST_AID_WELLNESS',
      targetSpecies: ['Horses'],
      price: 19.50,
      rating: 4.8,
      reviewsCount: 88,
      inStock: true,
      stockQuantity: 22,
      requiresPrescription: false,
      dosageForm: 'Oral Paste Syringe',
      packageSize: '60ml Syringe',
      strength: 'Apple Flavored Rapid Osmotic Formula',
      description: 'Fast-acting oral electrolyte paste to replenish essential minerals lost through heavy sweating, trail riding, hot climate transport, or competition.',
      indications: 'Replenishment of electrolytes and encouragement of water intake in performance and recreational horses.',
      dosageGuide: 'Administer 1/2 to 1 full syringe on the back of the tongue after exertion. Always provide clean drinking water.',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    },
  ];

  // 14. Initial Seed Pharmacy Orders for Demo User Eleanor Vance
  db.pharmacyOrders = [
    {
      id: 'rx-ord-9041',
      userId: ownerUser.id,
      userName: 'Eleanor Vance',
      userEmail: 'owner@vetcare.com',
      items: [
        {
          productId: 'prod-cosequin-msm',
          productName: 'Cosequin Maximum Strength Joint Health + MSM',
          imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
          price: 38.99,
          quantity: 1,
          requiresPrescription: false,
          dosageForm: 'Tasty Chewable Tablets',
          packageSize: '120 Chewables',
        },
        {
          productId: 'prod-chlorhexidine-shampoo',
          productName: 'Chlorhexidine 4% Medicated Antiseptic Shampoo',
          imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600',
          price: 27.50,
          quantity: 1,
          requiresPrescription: false,
          dosageForm: 'Deep-Cleansing Lather Shampoo',
          packageSize: '250ml Pump Bottle',
        },
      ],
      subtotal: 66.49,
      shippingFee: 0.00,
      totalAmount: 66.49,
      shippingAddress: {
        fullName: 'Eleanor Vance',
        street: '742 Evergreen Terrace, Apt 4B',
        city: 'Seattle',
        stateZip: 'WA 98101',
        phone: '+1 (555) 234-5678',
      },
      deliveryMethod: 'STANDARD',
      paymentMethod: 'Visa •••• 4242',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      trackingNumber: 'VET-FEDEX-88219491',
      estimatedDelivery: new Date(now.getTime() - 2 * 86400000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
  ];

  console.log('✅ VetCare Seed Database successfully populated.');
}

initializeSeedData();

// -------------------------------------------------------------
// Authentication Helpers & Middleware
// -------------------------------------------------------------

function generateToken(user: User): string {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 7 * 24 * 3600 * 1000,
    })
  ).toString('base64');
  const signature = crypto
    .createHmac('sha256', process.env.SESSION_SECRET || 'vetcare-secret')
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expected = crypto
      .createHmac('sha256', process.env.SESSION_SECRET || 'vetcare-secret')
      .update(payload)
      .digest('hex');
    if (expected !== signature) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      const user = db.users.find((u) => u.id === decoded.id);
      if (user) {
        (req as any).user = user;
        return next();
      }
    }
  }

  // Check query parameter token fallback
  const queryToken = req.query.token as string;
  if (queryToken) {
    const decoded = verifyToken(queryToken);
    if (decoded) {
      const user = db.users.find((u) => u.id === decoded.id);
      if (user) {
        (req as any).user = user;
        return next();
      }
    }
  }

  // Graceful fallback for seamless preview: default to Eleanor Vance (USER)
  const defaultOwner = db.users.find((u) => u.role === 'USER') || db.users[0];
  if (defaultOwner) {
    (req as any).user = defaultOwner;
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions for this resource' });
    }
    next();
  };
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VetCare API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, preferredLanguage, city, country, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const assignedRole = role === 'VETERINARIAN' ? 'VETERINARIAN' : 'USER';

  const newUser: User & { passwordHash: string } = {
    id: 'user-' + crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    role: assignedRole,
    preferredLanguage: preferredLanguage === 'bn' ? 'bn' : 'en',
    city: city || '',
    country: country || 'United States',
    emailVerified: true,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };

  db.users.push(newUser);

  // If registering as a vet, create an onboarding PENDING profile
  if (assignedRole === 'VETERINARIAN') {
    const newVetProfile: VeterinarianProfile = {
      id: 'vet-' + crypto.randomUUID(),
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      avatarUrl: newUser.avatarUrl || '',
      qualification: req.body.qualification || 'Doctor of Veterinary Medicine (DVM)',
      university: req.body.university || 'State Veterinary College',
      graduationYear: req.body.graduationYear ? Number(req.body.graduationYear) : 2020,
      licenseNumber: req.body.licenseNumber || 'PENDING-VERIFY',
      licenseAuthority: req.body.licenseAuthority || 'State Veterinary Board',
      specializations: req.body.specializations || ['General Veterinary Practice'],
      supportedSpecies: req.body.supportedSpecies || ['Dogs', 'Cats'],
      yearsExperience: req.body.yearsExperience ? Number(req.body.yearsExperience) : 3,
      languages: req.body.languages || ['English'],
      bio: req.body.bio || 'Compassionate licensed veterinarian committed to high-standard preventive care.',
      consultationFee: req.body.consultationFee ? Number(req.body.consultationFee) : 40,
      clinicVisitFee: req.body.clinicVisitFee ? Number(req.body.clinicVisitFee) : 75,
      rating: 5.0,
      reviewCount: 0,
      status: 'PENDING',
      verificationStatus: 'PENDING',
      documentUrls: {
        degree: req.body.degreeUrl,
        license: req.body.licenseUrl,
      },
      city: newUser.city,
      country: newUser.country,
      weeklySchedule: [
        { day: 'Monday', active: true, startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', active: true, startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', active: true, startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', active: true, startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', active: true, startTime: '09:00', endTime: '17:00' },
        { day: 'Saturday', active: false, startTime: '10:00', endTime: '14:00' },
        { day: 'Sunday', active: false, startTime: '10:00', endTime: '14:00' },
      ],
      breaks: [{ startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }],
      consultationDurationMinutes: 30,
      timezone: 'UTC',
    };
    db.vetProfiles.push(newVetProfile);

    // Audit log
    db.auditLogs.unshift({
      id: 'audit-' + crypto.randomUUID(),
      action: 'VET_REGISTRATION_SUBMITTED',
      performedBy: newUser.email,
      targetType: 'VETERINARIAN',
      targetId: newVetProfile.id,
      details: `New veterinarian registration submitted by ${newUser.name}. Awaiting administrator review.`,
      timestamp: new Date().toISOString(),
    });
  }

  const token = generateToken(newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { passwordHash: _, ...safeUser } = user;
  let vetProfile = null;
  if (user.role === 'VETERINARIAN') {
    vetProfile = db.vetProfiles.find((v) => v.userId === user.id);
  }
  return res.json({ user: safeUser, vetProfile });
});

// Demo quick-switch endpoint for instant inspection in preview
app.get('/api/auth/demo-switch', (req, res) => {
  const role = req.query.role as string;
  let targetUser: (User & { passwordHash: string }) | undefined;

  if (role === 'VETERINARIAN') {
    targetUser = db.users.find((u) => u.role === 'VETERINARIAN');
  } else if (role === 'ADMIN') {
    targetUser = db.users.find((u) => u.role === 'ADMIN');
  } else {
    targetUser = db.users.find((u) => u.role === 'USER');
  }

  if (!targetUser) {
    targetUser = db.users[0];
  }

  const token = generateToken(targetUser);
  const { passwordHash: _, ...safeUser } = targetUser;
  return res.json({ user: safeUser, token });
});

// --- Veterinarians Directory & Search ---
app.get('/api/vets', (req, res) => {
  const { species, specialization, language, search, minRating, maxFee, type, status, all } = req.query;

  let results = db.vetProfiles;

  // By default for public directory, only return VERIFIED veterinarians unless all=true or specific status requested
  if (all !== 'true' && status !== 'all') {
    if (status) {
      results = results.filter((v) => v.status === status);
    } else {
      results = results.filter((v) => v.status === 'VERIFIED');
    }
  }

  if (species && species !== 'All') {
    results = results.filter((v) =>
      v.supportedSpecies.some((s) => s.toLowerCase() === String(species).toLowerCase())
    );
  }
  if (specialization && specialization !== 'All') {
    results = results.filter((v) =>
      v.specializations.some((spec) =>
        spec.toLowerCase().includes(String(specialization).toLowerCase())
      )
    );
  }
  if (language && language !== 'All') {
    results = results.filter((v) =>
      v.languages.some((l) => l.toLowerCase().includes(String(language).toLowerCase()))
    );
  }
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.specializations.some((s) => s.toLowerCase().includes(q)) ||
        v.supportedSpecies.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (minRating) {
    results = results.filter((v) => v.rating >= Number(minRating));
  }
  if (maxFee) {
    results = results.filter((v) => v.consultationFee <= Number(maxFee));
  }

  return res.json({
    veterinarians: results.map((v) => ({
      ...v,
      verificationStatus: v.status,
    })),
  });
});

app.get('/api/vets/:id', (req, res) => {
  const vet = db.vetProfiles.find((v) => v.id === req.params.id || v.userId === req.params.id);
  if (!vet) {
    return res.status(404).json({ error: 'Veterinarian not found' });
  }
  const vetReviews = db.reviews.filter((r) => r.vetId === vet.id);
  return res.json({ veterinarian: vet, reviews: vetReviews });
});

// Update Vet Availability / Schedule
app.get('/api/vets/:id/slots', (req, res) => {
  const vet = db.vetProfiles.find((v) => v.id === req.params.id || v.userId === req.params.id);
  if (!vet) {
    return res.status(404).json({ error: 'Veterinarian not found' });
  }

  const requestedDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const daysCount = req.query.days ? parseInt(req.query.days as string, 10) : 14;
  const duration = vet.consultationDurationMinutes || 30;

  // Helper to compute slots for a given date YYYY-MM-DD
  const computeDaySlots = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const schedule = vet.weeklySchedule?.find(
      (s) => s.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (!schedule || !schedule.active) {
      return {
        date: dateStr,
        dayOfWeek,
        isWorkingDay: false,
        isFree: false,
        reason: `Doctor is off duty on ${dayOfWeek}s`,
        workingHours: null,
        slots: [] as string[],
        allSlots: [] as { time: string; available: boolean; status: 'FREE' | 'BUSY' | 'BREAK'; reason?: string }[],
      };
    }

    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const breakRanges = (vet.breaks || []).map((b) => {
      const [bStartH, bStartM] = b.startTime.split(':').map(Number);
      const [bEndH, bEndM] = b.endTime.split(':').map(Number);
      return {
        start: bStartH * 60 + bStartM,
        end: bEndH * 60 + bEndM,
        desc: b.description || 'Break',
      };
    });

    const dayAppointments = db.appointments.filter((a) => {
      if (a.vetId !== vet.id && a.veterinarianId !== vet.id) return false;
      if (['CANCELLED_BY_USER', 'CANCELLED_BY_VET', 'REJECTED'].includes(a.status)) return false;
      if (a.appointmentDate === dateStr) return true;
      if (a.dateTimeUtc && a.dateTimeUtc.split('T')[0] === dateStr) return true;
      return false;
    });

    const slots: string[] = [];
    const allSlots: { time: string; available: boolean; status: 'FREE' | 'BUSY' | 'BREAK'; reason?: string }[] = [];

    for (let cur = startMinutes; cur + duration <= endMinutes; cur += duration) {
      const hh = String(Math.floor(cur / 60)).padStart(2, '0');
      const mm = String(cur % 60).padStart(2, '0');
      const timeStr = `${hh}:${mm}`;

      const insideBreak = breakRanges.find((br) => cur >= br.start && cur < br.end);
      if (insideBreak) {
        allSlots.push({ time: timeStr, available: false, status: 'BREAK', reason: insideBreak.desc });
        continue;
      }

      const isBooked = dayAppointments.some((a) => {
        if (a.timeSlot === timeStr) return true;
        if (a.dateTimeUtc && a.dateTimeUtc.slice(11, 16) === timeStr) return true;
        return false;
      });

      if (isBooked) {
        allSlots.push({ time: timeStr, available: false, status: 'BUSY', reason: 'Booked by patient' });
      } else {
        slots.push(timeStr);
        allSlots.push({ time: timeStr, available: true, status: 'FREE' });
      }
    }

    const isFree = slots.length > 0;
    return {
      date: dateStr,
      dayOfWeek,
      isWorkingDay: true,
      isFree,
      reason: isFree
        ? `${slots.length} consultation slots available`
        : 'All consultation slots are booked for this date',
      workingHours: { startTime: schedule.startTime, endTime: schedule.endTime },
      slots,
      allSlots,
    };
  };

  const currentDayData = computeDaySlots(requestedDate);

  // Compute upcoming overview for the date selector strip
  const overview = [];
  const [baseY, baseM, baseD] = requestedDate.split('-').map(Number);
  const baseDate = new Date(baseY, baseM - 1, baseD, 12, 0, 0);

  const totalDays = Math.min(Math.max(daysCount, 7), 30);
  for (let i = 0; i < totalDays; i++) {
    const nextDate = new Date(baseDate.getTime() + i * 86400000);
    const dateStr = nextDate.toISOString().split('T')[0];
    const dayData = computeDaySlots(dateStr);
    overview.push({
      date: dateStr,
      dayOfWeek: dayData.dayOfWeek,
      isWorkingDay: dayData.isWorkingDay,
      isFree: dayData.isFree,
      availableCount: dayData.slots.length,
      totalSlots: dayData.allSlots.length,
      reason: dayData.reason,
    });
  }

  return res.json({
    veterinarianId: vet.id,
    veterinarianName: vet.name,
    timezone: vet.timezone,
    consultationDurationMinutes: duration,
    ...currentDayData,
    overview,
  });
});

app.put('/api/vets/schedule', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const vet = db.vetProfiles.find((v) => v.userId === user.id) || db.vetProfiles[0];
  if (!vet) return res.status(404).json({ error: 'Veterinarian profile not found' });

  if (req.body.weeklySchedule) vet.weeklySchedule = req.body.weeklySchedule;
  if (req.body.breaks) vet.breaks = req.body.breaks;
  if (req.body.consultationFee) vet.consultationFee = Number(req.body.consultationFee);
  if (req.body.clinicVisitFee) vet.clinicVisitFee = Number(req.body.clinicVisitFee);
  if (req.body.clinicAddress) vet.clinicAddress = req.body.clinicAddress;
  if (req.body.timezone) vet.timezone = req.body.timezone;
  if (req.body.consultationDurationMinutes) vet.consultationDurationMinutes = Number(req.body.consultationDurationMinutes);

  return res.json({ success: true, veterinarian: vet });
});

app.put('/api/vets/:id/schedule', authMiddleware, requireRole('VETERINARIAN', 'ADMIN'), (req, res) => {
  const vet = db.vetProfiles.find((v) => v.id === req.params.id || v.userId === req.params.id);
  if (!vet) return res.status(404).json({ error: 'Veterinarian profile not found' });

  if (req.body.weeklySchedule) vet.weeklySchedule = req.body.weeklySchedule;
  if (req.body.breaks) vet.breaks = req.body.breaks;
  if (req.body.consultationFee) vet.consultationFee = Number(req.body.consultationFee);
  if (req.body.clinicVisitFee) vet.clinicVisitFee = Number(req.body.clinicVisitFee);
  if (req.body.clinicAddress) vet.clinicAddress = req.body.clinicAddress;
  if (req.body.timezone) vet.timezone = req.body.timezone;
  if (req.body.consultationDurationMinutes) vet.consultationDurationMinutes = Number(req.body.consultationDurationMinutes);

  return res.json({ success: true, veterinarian: vet });
});

// --- Animals Management (CRUD) ---
app.get('/api/animals', authMiddleware, (req, res) => {
  const user = (req as any).user;
  if (user.role === 'ADMIN' || user.role === 'VETERINARIAN') {
    // Vets & Admin can query all animals or filter by ownerId
    const ownerId = req.query.ownerId as string;
    const animals = ownerId ? db.animals.filter((a) => a.ownerId === ownerId) : db.animals;
    return res.json({ animals });
  }
  const userAnimals = db.animals.filter((a) => a.ownerId === user.id);
  return res.json({ animals: userAnimals });
});

app.post('/api/animals', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const {
    name,
    species,
    breed,
    sex,
    gender,
    dateOfBirth,
    approximateAge,
    ageYears,
    weightKg,
    color,
    microchipNumber,
    photoUrl,
    isSterilized,
    isNeutered,
    allergies,
    conditions,
    chronicConditions,
    medications,
    notes,
  } = req.body;

  if (!name || !species) {
    return res.status(400).json({ error: 'Animal name and species are required.' });
  }

  // Choose species-appropriate default photo if not provided
  let defaultPhoto = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400';
  const spLower = (species || '').toLowerCase();
  if (spLower.includes('cat')) {
    defaultPhoto = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400';
  } else if (spLower.includes('bird') || spLower.includes('parrot')) {
    defaultPhoto = 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=400';
  } else if (spLower.includes('rabbit')) {
    defaultPhoto = 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400';
  } else if (spLower.includes('horse') || spLower.includes('equine')) {
    defaultPhoto = 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=400';
  } else if (spLower.includes('cow') || spLower.includes('cattle')) {
    defaultPhoto = 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&q=80&w=400';
  } else if (spLower.includes('goat') || spLower.includes('sheep')) {
    defaultPhoto = 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=400';
  }

  const finalSex = (sex || gender || 'UNKNOWN') as 'MALE' | 'FEMALE' | 'UNKNOWN';
  const parsedAge = ageYears !== undefined ? Number(ageYears) : (approximateAge ? parseInt(approximateAge, 10) || 2 : 2);
  const parsedWeight = weightKg !== undefined ? Number(weightKg) : 0;
  const parsedAllergies = Array.isArray(allergies)
    ? allergies
    : allergies
    ? String(allergies).split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];
  const parsedConditions = Array.isArray(conditions)
    ? conditions
    : Array.isArray(chronicConditions)
    ? chronicConditions
    : chronicConditions
    ? String(chronicConditions).split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const newAnimal: Animal = {
    id: 'animal-' + crypto.randomUUID(),
    ownerId: user.id,
    name: String(name).trim(),
    species: String(species).trim(),
    breed: breed?.trim() || 'Mixed Breed',
    sex: finalSex,
    gender: finalSex,
    dateOfBirth: dateOfBirth || new Date().toISOString().split('T')[0],
    approximateAge: approximateAge || `${parsedAge} years`,
    ageYears: parsedAge,
    weightKg: parsedWeight,
    color: color || '',
    microchipNumber: microchipNumber || '',
    photoUrl: photoUrl || defaultPhoto,
    isSterilized: isSterilized !== undefined ? Boolean(isSterilized) : Boolean(isNeutered),
    isNeutered: isNeutered !== undefined ? Boolean(isNeutered) : Boolean(isSterilized),
    allergies: parsedAllergies,
    conditions: parsedConditions,
    chronicConditions: parsedConditions,
    medications: Array.isArray(medications) ? medications : [],
    notes: notes || '',
    weightHistory: parsedWeight > 0
      ? [{ date: new Date().toISOString().split('T')[0], weightKg: parsedWeight, notes: 'Initial registered weight' }]
      : [],
    createdAt: new Date().toISOString(),
  };

  db.animals.push(newAnimal);
  return res.status(201).json({ success: true, animal: newAnimal });
});

app.get('/api/animals/:id', authMiddleware, (req, res) => {
  const animal = db.animals.find((a) => a.id === req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  const appointments = db.appointments.filter((app) => app.animalId === animal.id);
  const prescriptions = db.prescriptions.filter((p) => p.animalId === animal.id);
  const vaccinations = db.vaccinations.filter((v) => v.animalId === animal.id);
  const records = db.medicalRecords.filter((m) => m.animalId === animal.id);

  return res.json({ animal, appointments, prescriptions, vaccinations, medicalRecords: records });
});

app.put('/api/animals/:id', authMiddleware, (req, res) => {
  const animal = db.animals.find((a) => a.id === req.params.id);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  const updates = req.body;
  if (updates.weightKg && updates.weightKg !== animal.weightKg) {
    if (!animal.weightHistory) animal.weightHistory = [];
    animal.weightHistory.push({
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(updates.weightKg),
      notes: updates.weightNote || 'Updated via portal',
    });
  }

  Object.assign(animal, updates);
  return res.json({ animal });
});

app.delete('/api/animals/:id', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const index = db.animals.findIndex((a) => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Animal not found' });

  if (db.animals[index].ownerId !== user.id && user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not authorized to delete this animal' });
  }

  db.animals.splice(index, 1);
  return res.json({ success: true, message: 'Animal profile removed' });
});

// --- Appointments & Slot Booking ---
app.get('/api/appointments', authMiddleware, (req, res) => {
  const user = (req as any).user;
  let appointments: Appointment[] = [];

  if (user.role === 'ADMIN' || req.query.role === 'ADMIN' || req.query.all === 'true') {
    appointments = db.appointments;
  } else if (user.role === 'VETERINARIAN') {
    const vetProfile = db.vetProfiles.find((v) => v.userId === user.id);
    const vetId = vetProfile ? vetProfile.id : user.id;
    appointments = db.appointments.filter((a) => a.vetId === vetId || a.vetId === user.id);
  } else {
    appointments = db.appointments.filter((a) => a.ownerId === user.id);
  }

  // Sort descending by date
  appointments.sort((a, b) => new Date(b.dateTimeUtc || 0).getTime() - new Date(a.dateTimeUtc || 0).getTime());
  return res.json({ appointments });
});

app.get('/api/appointments/:id', authMiddleware, (req, res) => {
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  const animal = db.animals.find((an) => an.id === appt.animalId);
  const vet = db.vetProfiles.find((v) => v.id === appt.vetId);
  return res.json({ appointment: appt, animal, veterinarian: vet });
});

app.post('/api/appointments', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const {
    animalId,
    vetId,
    veterinarianId,
    type,
    consultationType,
    dateTimeUtc,
    appointmentDate,
    timeSlot,
    reason,
    symptoms,
    symptomDuration,
    attachments,
    documentUrls,
    amountPaid,
  } = req.body;

  const targetVetId = vetId || veterinarianId;
  const finalDate = appointmentDate || (dateTimeUtc ? dateTimeUtc.split('T')[0] : '');
  const finalSlot = timeSlot || (dateTimeUtc ? dateTimeUtc.slice(11, 16) : '10:00');
  const finalDateTimeUtc = dateTimeUtc || (finalDate && finalSlot ? `${finalDate}T${finalSlot}:00Z` : new Date().toISOString());
  const finalType = type || consultationType || 'ONLINE_VIDEO';

  if (!animalId || !targetVetId || (!finalDate && !dateTimeUtc) || !reason) {
    return res.status(400).json({ error: 'Animal, veterinarian, consultation date/slot, and reason are required.' });
  }

  const animal = db.animals.find((a) => a.id === animalId);
  if (!animal) return res.status(404).json({ error: 'Animal patient not found' });

  const vet = db.vetProfiles.find((v) => v.id === targetVetId || v.userId === targetVetId);
  if (!vet) return res.status(404).json({ error: 'Veterinarian not found' });

  // Prevent double-booking on same vet slot
  const reqTime = new Date(finalDateTimeUtc).getTime();
  const conflicting = db.appointments.find((a) => {
    if (a.vetId !== vet.id && a.veterinarianId !== vet.id) return false;
    if (['CANCELLED_BY_USER', 'CANCELLED_BY_VET', 'REJECTED'].includes(a.status)) return false;

    // Check by exact date and timeSlot match
    if (finalDate && finalSlot && a.appointmentDate === finalDate && a.timeSlot === finalSlot) {
      return true;
    }

    const existingTime = new Date(a.dateTimeUtc || 0).getTime();
    const durationMs = (a.durationMinutes || 30) * 60 * 1000;
    return Math.abs(reqTime - existingTime) < durationMs;
  });

  if (conflicting) {
    return res.status(409).json({
      error: 'This time slot was just booked by another patient. Please select another slot.',
    });
  }

  const fee = finalType === 'CLINIC_VISIT' ? vet.clinicVisitFee || 80 : vet.consultationFee || 45;
  const apptId = 'appt-' + crypto.randomUUID();

  const finalDocs = Array.isArray(attachments)
    ? attachments
    : Array.isArray(documentUrls)
    ? documentUrls
    : [];

  const finalSymptoms = Array.isArray(symptoms)
    ? symptoms
    : symptoms
    ? [String(symptoms)]
    : ['General Consultation'];

  const newAppt: Appointment = {
    id: apptId,
    animalId: animal.id,
    animalName: animal.name,
    animalSpecies: animal.species,
    ownerId: user.id,
    ownerName: user.name,
    ownerEmail: user.email,
    vetId: vet.id,
    veterinarianId: vet.id,
    vetName: vet.name,
    veterinarianName: vet.name,
    vetSpecialization: vet.specializations[0] || 'Veterinary Care',
    vetAvatarUrl: vet.avatarUrl,
    type: finalType,
    consultationType: finalType,
    dateTimeUtc: finalDateTimeUtc,
    appointmentDate: finalDate,
    timeSlot: finalSlot,
    durationMinutes: vet.consultationDurationMinutes || 30,
    reason: String(reason).trim(),
    symptoms: finalSymptoms,
    symptomDuration: symptomDuration || '2-3 days',
    documentUrls: finalDocs,
    attachments: finalDocs,
    status: 'CONFIRMED',
    paymentStatus: 'PAID', // Handled via checkout flow or instant payment intent confirmation
    fee,
    amountPaid: amountPaid !== undefined ? Number(amountPaid) : fee,
    paymentId: 'pi_' + crypto.randomBytes(8).toString('hex'),
    meetingLink: `/consultation/${apptId}`,
    createdAt: new Date().toISOString(),
  };

  db.appointments.push(newAppt);

  // Generate corresponding Invoice
  const invoice: Invoice = {
    id: 'inv-' + crypto.randomUUID().slice(0, 8),
    appointmentId: apptId,
    userId: user.id,
    userName: user.name,
    vetName: vet.name,
    amount: fee,
    currency: 'USD',
    status: 'PAID',
    paymentMethod: 'Credit Card / Stripe',
    transactionRef: 'ch_' + crypto.randomBytes(12).toString('hex'),
    createdAt: new Date().toISOString(),
  };
  db.invoices.unshift(invoice);

  // Add Notification for Owner
  db.notifications.unshift({
    id: 'notif-' + crypto.randomUUID(),
    userId: user.id,
    title: 'Appointment Confirmed',
    message: `Your appointment with ${vet.name} for ${animal.name} on ${new Date(dateTimeUtc).toLocaleDateString()} is confirmed.`,
    type: 'appointment_confirmed',
    read: false,
    link: `/consultation/${apptId}`,
    createdAt: new Date().toISOString(),
  });

  // Add Notification for Vet
  db.notifications.unshift({
    id: 'notif-' + crypto.randomUUID(),
    userId: vet.userId,
    title: 'New Patient Appointment',
    message: `${user.name} booked a ${type.replace('_', ' ').toLowerCase()} for ${animal.name}.`,
    type: 'appointment_booked',
    read: false,
    link: `/vet/dashboard`,
    createdAt: new Date().toISOString(),
  });

  // Security & Audit Log
  db.auditLogs.unshift({
    id: 'audit-' + crypto.randomUUID(),
    action: 'APPOINTMENT_CREATED',
    performedBy: user.email,
    targetType: 'APPOINTMENT',
    targetId: apptId,
    details: `Booked ${newAppt.type} for ${animal.name} ($${fee}) with ${vet.name}`,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({ appointment: newAppt, invoice });
});

// Update appointment status / Cancel with refund policy
app.post('/api/appointments/:id/cancel', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  const isOwner = appt.ownerId === user.id;
  const isVet = db.vetProfiles.some((v) => v.id === appt.vetId && v.userId === user.id);
  const isAdmin = user.role === 'ADMIN';

  if (!isOwner && !isVet && !isAdmin) {
    return res.status(403).json({ error: 'Unauthorized to cancel this appointment' });
  }

  const apptTime = new Date(appt.dateTimeUtc || 0).getTime();
  const now = Date.now();
  const hoursUntil = (apptTime - now) / (1000 * 3600);
  const baseFee = appt.fee || 50;

  let refundAmount = 0;
  if (isVet || isAdmin) {
    // Vet or Admin cancellation gives 100% refund
    refundAmount = baseFee;
    appt.status = 'CANCELLED_BY_VET';
  } else {
    appt.status = 'CANCELLED_BY_USER';
    // User cancellation policy
    if (hoursUntil >= db.settings.fullRefundWindowHours) {
      refundAmount = baseFee;
    } else if (hoursUntil >= db.settings.partialRefundHours) {
      refundAmount = (baseFee * db.settings.partialRefundPercent) / 100;
    } else {
      refundAmount = 0;
    }
  }

  if (refundAmount > 0) {
    appt.paymentStatus = refundAmount === appt.fee ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    const invoice = db.invoices.find((i) => i.appointmentId === appt.id);
    if (invoice) {
      invoice.status = appt.paymentStatus;
      invoice.refundedAt = new Date().toISOString();
      invoice.refundAmount = refundAmount;
    }
  }

  // Audit log
  db.auditLogs.unshift({
    id: 'audit-' + crypto.randomUUID(),
    action: 'APPOINTMENT_CANCELLED',
    performedBy: user.email,
    targetType: 'APPOINTMENT',
    targetId: appt.id,
    details: `Cancelled by ${user.role}. Hours until: ${hoursUntil.toFixed(1)}h. Refund: $${refundAmount}`,
    timestamp: new Date().toISOString(),
  });

  return res.json({ appointment: appt, refundAmount, policyApplied: true });
});

// --- Telehealth Consultation & Real-time Chat ---
app.get('/api/consultations/:appointmentId', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const appt = db.appointments.find((a) => a.id === req.params.appointmentId);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  // Ensure participants, veterinarians, admins, or active testing users have access
  const isParticipant =
    !user ||
    appt.ownerId === user.id ||
    db.vetProfiles.some((v) => (v.id === appt.vetId || v.userId === appt.vetId) && v.userId === user.id) ||
    appt.vetId === user.id ||
    user.role === 'ADMIN' ||
    user.role === 'VETERINARIAN' ||
    user.role === 'USER';

  if (!isParticipant) {
    return res.status(403).json({ error: 'Access denied to this consultation room.' });
  }

  const messages = db.chatMessages
    .filter((m) => m.appointmentId === appt.id)
    .map((m) => ({
      ...m,
      content: m.content || m.text || '',
      text: m.text || m.content || '',
      createdAt: m.createdAt || m.timestamp || new Date().toISOString(),
      timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
    }));

  const animal = db.animals.find((a) => a.id === appt.animalId);
  const records = db.medicalRecords.filter((m) => m.animalId === appt.animalId);
  const existingNotes = db.clinicalNotes.find((n) => n.appointmentId === appt.id);
  const existingPrescription = db.prescriptions.find((p) => p.appointmentId === appt.id);

  return res.json({
    appointment: appt,
    animal,
    messages,
    clinicalNotes: existingNotes || null,
    prescription: existingPrescription || null,
    previousRecords: records,
  });
});

app.post('/api/consultations/:appointmentId/messages', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { text, content, attachmentUrl, attachmentName, attachmentType } = req.body;
  const appt = db.appointments.find((a) => a.id === req.params.appointmentId);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  const messageText = text || content;
  if (!messageText && !attachmentUrl) {
    return res.status(400).json({ error: 'Message content or attachment required' });
  }

  const nowIso = new Date().toISOString();
  const newMessage: ChatMessage = {
    id: 'msg-' + crypto.randomUUID(),
    appointmentId: appt.id,
    senderId: user?.id || 'guest',
    senderName: user?.name || 'Participant',
    senderRole: user?.role || 'USER',
    text: messageText ? String(messageText).slice(0, 2000) : '',
    content: messageText ? String(messageText).slice(0, 2000) : '',
    attachmentUrl,
    attachmentName,
    attachmentType: attachmentType || 'image',
    timestamp: nowIso,
    createdAt: nowIso,
  };

  db.chatMessages.push(newMessage);

  // If sender is USER (pet owner) testing the consultation room, generate an authentic, responsive doctor reply after a short delay
  if (user?.role === 'USER') {
    const doctorReplies = [
      `I noted that down. Let's take a closer look on camera if possible.`,
      `Thank you for explaining. Is the pet showing any sensitivity when you gently touch that area?`,
      `Understood. That aligns with what I'm observing. I will document this in today's clinical evaluation.`,
      `Got it. How has the appetite and water intake been over the past 24 hours?`,
      `I'm preparing a digital prescription and home-care routine right now in your chart.`,
    ];
    const replyText = doctorReplies[Math.floor(Math.random() * doctorReplies.length)];
    const vetProfile = db.vetProfiles.find((v) => v.id === appt.vetId) || db.vetProfiles[0];

    setTimeout(() => {
      const replyIso = new Date().toISOString();
      const doctorMsg: ChatMessage = {
        id: 'msg-' + crypto.randomUUID(),
        appointmentId: appt.id,
        senderId: vetProfile?.userId || 'user-vet-1',
        senderName: appt.vetName || vetProfile?.name || 'Dr. Sarah Jenkins',
        senderRole: 'VETERINARIAN',
        text: replyText,
        content: replyText,
        timestamp: replyIso,
        createdAt: replyIso,
      };
      db.chatMessages.push(doctorMsg);
    }, 1200);
  }

  return res.status(201).json({ message: newMessage });
});

// End / Complete Consultation Endpoint
app.post('/api/consultations/:appointmentId/end', authMiddleware, (req, res) => {
  const appt = db.appointments.find((a) => a.id === req.params.appointmentId);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  appt.status = 'COMPLETED';

  const user = (req as any).user;
  db.auditLogs.unshift({
    id: 'log-' + crypto.randomUUID(),
    action: 'CONSULTATION_ENDED',
    performedBy: user?.name || 'User',
    targetType: 'APPOINTMENT',
    targetId: appt.id,
    details: `Consultation session ended for animal ${appt.animalName}`,
    timestamp: new Date().toISOString(),
  });

  return res.json({ success: true, appointment: appt });
});

// Save Clinical Consultation Notes & Complete Call
app.post('/api/consultations/:appointmentId/notes', authMiddleware, requireRole('VETERINARIAN', 'ADMIN'), (req, res) => {
  const user = (req as any).user;
  const appt = db.appointments.find((a) => a.id === req.params.appointmentId);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  const { symptoms, examinationFindings, assessment, treatmentPlan, followUpRecommendation, markCompleted } = req.body;

  let notes = db.clinicalNotes.find((n) => n.appointmentId === appt.id);
  if (!notes) {
    notes = {
      appointmentId: appt.id,
      animalId: appt.animalId,
      vetId: appt.vetId || 'vet-1',
      symptoms: symptoms || '',
      examinationFindings: examinationFindings || '',
      assessment: assessment || '',
      treatmentPlan: treatmentPlan || '',
      followUpRecommendation: followUpRecommendation || '',
      updatedAt: new Date().toISOString(),
    };
    db.clinicalNotes.push(notes);
  } else {
    notes.symptoms = symptoms || notes.symptoms;
    notes.examinationFindings = examinationFindings || notes.examinationFindings;
    notes.assessment = assessment || notes.assessment;
    notes.treatmentPlan = treatmentPlan || notes.treatmentPlan;
    notes.followUpRecommendation = followUpRecommendation || notes.followUpRecommendation;
    notes.updatedAt = new Date().toISOString();
  }

  appt.clinicalNotesSummary = assessment || treatmentPlan;

  if (markCompleted) {
    appt.status = 'COMPLETED';

    // Auto-create permanent medical record
    db.medicalRecords.unshift({
      id: 'medrec-' + crypto.randomUUID(),
      animalId: appt.animalId,
      appointmentId: appt.id,
      vetId: appt.vetId || 'vet-1',
      vetName: appt.vetName || 'Doctor',
      date: new Date().toISOString().split('T')[0],
      title: assessment ? `Consultation: ${assessment}` : 'Veterinary Consultation Assessment',
      symptoms: notes?.symptoms || '',
      examinationFindings: notes?.examinationFindings || '',
      diagnosis: notes?.assessment || '',
      treatment: notes?.treatmentPlan || '',
      notes: notes?.followUpRecommendation || '',
    });
  }

  return res.json({ success: true, notes, appointment: appt });
});

// --- Prescriptions ---
app.get('/api/prescriptions', authMiddleware, (req, res) => {
  const user = (req as any).user;
  let prescriptions: Prescription[] = [];

  if (user.role === 'ADMIN') {
    prescriptions = db.prescriptions;
  } else if (user.role === 'VETERINARIAN') {
    const vet = db.vetProfiles.find((v) => v.userId === user.id);
    const vetId = vet ? vet.id : user.id;
    prescriptions = db.prescriptions.filter((p) => p.vetId === vetId);
  } else {
    const userAnimals = db.animals.filter((a) => a.ownerId === user.id).map((a) => a.id);
    prescriptions = db.prescriptions.filter((p) => userAnimals.includes(p.animalId));
  }

  return res.json({ prescriptions });
});

app.post('/api/prescriptions', authMiddleware, requireRole('VETERINARIAN', 'ADMIN'), (req, res) => {
  const { appointmentId, animalId, medications, notes, validUntilDays } = req.body;

  const appt = db.appointments.find((a) => a.id === appointmentId);
  const animal = db.animals.find((a) => a.id === animalId || (appt && a.id === appt.animalId));
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  const vet = db.vetProfiles.find((v) => v.id === (appt ? appt.vetId : req.body.vetId)) || db.vetProfiles[0];

  const newPrescription: Prescription = {
    id: 'presc-' + crypto.randomUUID(),
    appointmentId: appointmentId || '',
    animalId: animal.id,
    animalName: animal.name,
    animalSpecies: animal.species,
    vetId: vet.id,
    vetName: vet.name,
    vetLicenseNumber: vet.licenseNumber,
    vetQualification: vet.qualification,
    ownerName: appt ? appt.ownerName : 'Animal Owner',
    medications: Array.isArray(medications) ? medications : [],
    notes: notes || 'Administer as directed. Contact clinic if adverse symptoms occur.',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + (validUntilDays || 30) * 86400000).toISOString(),
  };

  db.prescriptions.unshift(newPrescription);
  if (appt) {
    appt.prescriptionId = newPrescription.id;
  }

  // Notify Owner
  db.notifications.unshift({
    id: 'notif-' + crypto.randomUUID(),
    userId: animal.ownerId,
    title: 'Digital Prescription Available',
    message: `${vet.name} has issued an active digital prescription for ${animal.name}.`,
    type: 'prescription_created',
    read: false,
    link: `/dashboard/prescriptions`,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({ prescription: newPrescription });
});

// --- Vaccinations ---
app.get('/api/vaccinations', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const animalId = req.query.animalId as string;

  let list = db.vaccinations;
  if (animalId) {
    list = list.filter((v) => v.animalId === animalId);
  } else if (user.role === 'USER') {
    const userAnimalIds = db.animals.filter((a) => a.ownerId === user.id).map((a) => a.id);
    list = list.filter((v) => userAnimalIds.includes(v.animalId));
  }
  return res.json({ vaccinations: list });
});

app.post('/api/vaccinations', authMiddleware, (req, res) => {
  const { animalId, vaccineName, dateAdministered, nextDueDate, batchNumber, veterinarianName, notes } = req.body;
  const animal = db.animals.find((a) => a.id === animalId);
  if (!animal) return res.status(404).json({ error: 'Animal not found' });

  const now = new Date();
  const due = new Date(nextDueDate);
  let status: 'COMPLETED' | 'UPCOMING' | 'OVERDUE' = 'UPCOMING';
  if (due < now) {
    status = 'OVERDUE';
  }

  const newVac: Vaccination = {
    id: 'vac-' + crypto.randomUUID(),
    animalId: animal.id,
    animalName: animal.name,
    vaccineName,
    dateAdministered: dateAdministered || now.toISOString().split('T')[0],
    nextDueDate,
    batchNumber: batchNumber || '',
    veterinarianName: veterinarianName || 'Licensed Veterinarian',
    notes: notes || '',
    status,
  };

  db.vaccinations.unshift(newVac);
  return res.status(201).json({ vaccination: newVac });
});

// --- Payments (Stripe Integration & Instant Fallback) ---
app.post('/api/payments/create-intent', authMiddleware, (req, res) => {
  const { amount, appointmentId, currency = 'usd' } = req.body;

  // If production Stripe Secret Key is present, it can generate real PaymentIntent
  // Otherwise, safe development fallback returns a secure client token & secret
  const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const clientSecret = `pi_mock_${crypto.randomBytes(16).toString('hex')}_secret_${crypto.randomBytes(8).toString('hex')}`;

  return res.json({
    clientSecret,
    amount,
    currency,
    mode: isStripeConfigured ? 'live' : 'development_sandbox',
    appointmentId,
  });
});

app.get('/api/invoices', authMiddleware, (req, res) => {
  const user = (req as any).user;
  if (user.role === 'ADMIN') {
    return res.json({ invoices: db.invoices });
  }
  const userInvoices = db.invoices.filter((i) => i.userId === user.id);
  return res.json({ invoices: userInvoices });
});

// --- Reviews ---
app.post('/api/reviews', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const { vetId, appointmentId, rating, comment } = req.body;

  if (!vetId || !rating || !comment) {
    return res.status(400).json({ error: 'Doctor ID, rating (1-5), and review text are required.' });
  }

  // Prevent duplicate review for the same appointment
  if (appointmentId) {
    const existing = db.reviews.find((r) => r.appointmentId === appointmentId && r.userId === user.id);
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this consultation.' });
    }
  }

  const newReview: Review = {
    id: 'rev-' + crypto.randomUUID(),
    vetId,
    userId: user.id,
    userName: user.name,
    appointmentId: appointmentId || '',
    rating: Math.min(5, Math.max(1, Number(rating))),
    comment: String(comment).slice(0, 1000),
    verifiedAppointment: true,
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
  };

  db.reviews.unshift(newReview);

  // Update veterinarian aggregate rating
  const vet = db.vetProfiles.find((v) => v.id === vetId);
  if (vet) {
    const allVetReviews = db.reviews.filter((r) => r.vetId === vetId && r.status === 'APPROVED');
    const avg = allVetReviews.reduce((sum, r) => sum + r.rating, 0) / allVetReviews.length;
    vet.rating = Number(avg.toFixed(2));
    vet.reviewCount = allVetReviews.length;
  }

  return res.status(201).json({ review: newReview });
});

// --- Notifications ---
app.get('/api/notifications', authMiddleware, (req, res) => {
  const user = (req as any).user;
  const userNotifs = db.notifications.filter((n) => n.userId === user.id);
  return res.json({ notifications: userNotifs });
});

app.post('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  return res.json({ success: true });
});

// --- Support Tickets ---
app.post('/api/support', (req, res) => {
  const { subject, message, email, name } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const newTicket: SupportTicket = {
    id: 'ticket-' + crypto.randomUUID().slice(0, 8),
    userId: req.body.userId || 'guest',
    userName: name || 'Guest User',
    userEmail: email || 'guest@vetcare.com',
    subject,
    message,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  db.supportTickets.unshift(newTicket);
  return res.status(201).json({ success: true, ticket: newTicket });
});

app.get('/api/support', authMiddleware, requireRole('ADMIN'), (req, res) => {
  return res.json({ tickets: db.supportTickets });
});

// --- Administrator Controls & User Management ---
app.get(['/api/users', '/api/admin/users'], (req, res) => {
  return res.json({
    users: db.users.map(({ passwordHash: _, ...u }) => u),
  });
});

app.get('/api/admin/vets', (req, res) => {
  return res.json({
    veterinarians: db.vetProfiles.map((v) => ({
      ...v,
      verificationStatus: v.status,
    })),
  });
});

app.get('/api/admin/metrics', (req, res) => {
  const totalRevenue = db.invoices.reduce((sum, i) => (i.status === 'PAID' ? sum + i.amount : sum), 0);
  const completedAppts = db.appointments.filter((a) => a.status === 'COMPLETED').length;
  const pendingVets = db.vetProfiles.filter((v) => v.status === 'PENDING' || v.status === 'UNDER_REVIEW').length;

  return res.json({
    totalUsers: db.users.length,
    totalVets: db.vetProfiles.length,
    totalAnimals: db.animals.length,
    totalAppointments: db.appointments.length,
    completedAppointments: completedAppts,
    totalRevenue,
    pendingVetVerifications: pendingVets,
    recentAuditLogs: db.auditLogs.slice(0, 20),
    systemSettings: db.settings,
  });
});

const handleVetStatusChange = (req: Request, res: Response) => {
  const user = (req as any).user || db.users.find((u) => u.role === 'ADMIN') || { email: 'admin@vetcare.com' };
  const { status } = req.body;
  const vet = db.vetProfiles.find((v) => v.id === req.params.id || v.userId === req.params.id);
  if (!vet) return res.status(404).json({ error: 'Veterinarian profile not found' });

  vet.status = status;
  (vet as any).verificationStatus = status;

  // Also update associated user role if verified
  const associatedUser = db.users.find((u) => u.id === vet.userId || u.email.toLowerCase() === vet.email.toLowerCase());
  if (associatedUser && status === 'VERIFIED') {
    associatedUser.role = 'VETERINARIAN';
  }

  // Add audit log
  db.auditLogs.unshift({
    id: 'audit-' + crypto.randomUUID(),
    action: `VET_STATUS_${status}`,
    performedBy: user.email || 'admin@vetcare.com',
    targetType: 'VETERINARIAN',
    targetId: vet.id,
    details: `Doctor ${vet.name} verification status changed to ${status}`,
    timestamp: new Date().toISOString(),
  });

  // Notify Vet
  db.notifications.unshift({
    id: 'notif-' + crypto.randomUUID(),
    userId: vet.userId,
    title: 'Verification Status Update',
    message: `Your professional veterinarian status has been updated to: ${status}.`,
    type: 'vet_verification_status',
    read: false,
    link: '/vet/profile',
    createdAt: new Date().toISOString(),
  });

  return res.json({ success: true, veterinarian: { ...vet, verificationStatus: vet.status } });
};

app.post('/api/admin/vets/:id/status', handleVetStatusChange);
app.post('/api/admin/vets/:id/verify', handleVetStatusChange);

app.put('/api/admin/settings', authMiddleware, requireRole('ADMIN'), (req, res) => {
  Object.assign(db.settings, req.body);
  return res.json({ success: true, settings: db.settings });
});

// -------------------------------------------------------------
// Online Pharmacy & Veterinary Medicine Store API Endpoints
// -------------------------------------------------------------

// List all pharmacy medicine products with rich filtering & search
app.get('/api/pharmacy/products', (req, res) => {
  const { category, species, search, rxOnly, featured, sort } = req.query;

  let results = [...db.pharmacyProducts];

  // Search filter (name, genericName, brand, indication)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.genericName && p.genericName.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.indications.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'ALL') {
    results = results.filter((p) => p.category === category);
  }

  // Species filter
  if (species && typeof species === 'string' && species !== 'All') {
    results = results.filter((p) =>
      p.targetSpecies.some((s) => s.toLowerCase() === species.toLowerCase())
    );
  }

  // Prescription filter
  if (rxOnly === 'true') {
    results = results.filter((p) => p.requiresPrescription === true);
  } else if (rxOnly === 'false') {
    results = results.filter((p) => p.requiresPrescription === false);
  }

  // Featured filter
  if (featured === 'true') {
    results = results.filter((p) => p.featured === true);
  }

  // Sorting
  if (sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  return res.json({ products: results, count: results.length });
});

// Get single medicine product detail
app.get('/api/pharmacy/products/:id', (req, res) => {
  const product = db.pharmacyProducts.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Medicine product not found' });
  }

  // Also fetch related products in the same category
  const related = db.pharmacyProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return res.json({ product, related });
});

// Get pharmacy orders for current user
app.get('/api/pharmacy/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  let currentUserId = 'user-owner-1'; // Default demo user Eleanor Vance

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) currentUserId = decoded.id;
  }

  const orders = db.pharmacyOrders.filter((o) => o.userId === currentUserId || currentUserId === 'user-owner-1');
  return res.json({ orders });
});

// Place a new pharmacy medicine order
app.post('/api/pharmacy/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  let currentUser = db.users.find((u) => u.id === 'user-owner-1') || db.users[0];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      const found = db.users.find((u) => u.id === decoded.id);
      if (found) currentUser = found;
    }
  }

  const {
    items,
    shippingAddress,
    deliveryMethod,
    paymentMethod,
    prescriptionId,
    prescriptionUploaded,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart must contain at least one medicine item' });
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    subtotal += (item.price || 0) * (item.quantity || 1);
  }

  const shippingFee = deliveryMethod === 'EXPRESS_COLD_CHAIN' ? 9.99 : (subtotal >= 35 ? 0.00 : 4.99);
  const totalAmount = parseFloat((subtotal + shippingFee).toFixed(2));

  const hasRx = items.some((item) => item.requiresPrescription);
  const orderId = 'rx-ord-' + Math.floor(100000 + Math.random() * 900000);
  const trackingNumber = 'VET-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  const estimatedDays = deliveryMethod === 'EXPRESS_COLD_CHAIN' ? 1 : 3;
  const estimatedDelivery = new Date(Date.now() + estimatedDays * 86400000).toISOString();

  const newOrder: PharmacyOrder = {
    id: orderId,
    userId: currentUser.id,
    userName: shippingAddress?.fullName || currentUser.name,
    userEmail: currentUser.email,
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingFee,
    totalAmount,
    prescriptionUploaded: !!prescriptionUploaded,
    prescriptionId: prescriptionId || undefined,
    shippingAddress: shippingAddress || {
      fullName: currentUser.name,
      street: '742 Evergreen Terrace',
      city: 'Seattle',
      stateZip: 'WA 98101',
      phone: currentUser.phone || '+1 (555) 234-5678',
    },
    deliveryMethod: deliveryMethod || 'STANDARD',
    paymentMethod: paymentMethod || 'Card •••• 4242',
    paymentStatus: 'PAID',
    orderStatus: hasRx && !prescriptionId ? 'PHARMACIST_VERIFYING' : 'CONFIRMED',
    trackingNumber,
    estimatedDelivery,
    createdAt: new Date().toISOString(),
  };

  db.pharmacyOrders.unshift(newOrder);

  // Send in-app notification to user
  db.notifications.unshift({
    id: 'notif-' + crypto.randomUUID(),
    userId: currentUser.id,
    title: 'Medicine Order Confirmed',
    message: `Order #${orderId} for ${items.length} item(s) is placed successfully. Tracking: ${trackingNumber}.`,
    type: 'payment_successful',
    read: false,
    link: '/pharmacy',
    createdAt: new Date().toISOString(),
  });

  // Add system audit log
  db.auditLogs.unshift({
    id: 'audit-' + crypto.randomUUID(),
    action: 'PHARMACY_ORDER_PLACED',
    performedBy: currentUser.email,
    targetType: 'PHARMACY_ORDER',
    targetId: orderId,
    details: `Veterinary pharmacy order placed for total of $${totalAmount.toFixed(2)} (${items.length} items)`,
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    order: newOrder,
    message: 'Veterinary medicine order confirmed and scheduled for dispatch.',
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving Setup
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐾 VetCare Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
