export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  roomNumber: string;
  floorNumber: string;
  profilePhotoUrl: string | null;
  createdAt: string;
  onboardingComplete?: boolean;  // true only after user fills the setup form
}

export interface ClothingCategory {
  id: string;                // e.g. "shirt", "tshirt", "pant"
  name: string;              // "Shirt", "T-Shirt", "Pant", etc.
  icon: string;              // Lucide icon identifier
  careNote: string;          // short line, e.g. "Wash cold, no bleach"
  tempWashType?: string;     // e.g. "Gentle Cycle", "Heavy Duty", "Normal"
}

export interface WardrobeItem {
  id: string;
  userId: string;
  roomNumber: string;
  categoryId: string;
  photoUrl: string;
  color: string | null;
  label: string;              // nickname e.g. "Blue formal shirt"
  addedAt: string;
  inWash?: boolean;
  isMissing?: boolean;
}

export type BatchStatus = "submitted" | "in_wash" | "ready" | "collected";

export interface LaundryBatch {
  id: string;
  userId: string;
  roomNumber: string;
  itemIds: string[];
  itemCount: number;
  status: BatchStatus;
  submittedAt: string;
  expectedCollectionDate: string;
  collectedAt: string | null;
  notes?: string;
}

export type ActivityType = "submitted" | "collected" | "item_added" | "profile_updated" | "washed" | "missing";

export interface ActivityLogItem {
  id: string;
  userId: string;
  roomNumber: string;
  batchId: string | null;
  type: ActivityType;
  message: string;            // e.g., "3 items submitted for wash"
  timestamp: string;
}
