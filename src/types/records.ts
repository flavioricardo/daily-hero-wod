import { RECORD_TYPES } from "../utils/helpers";

export interface WorkoutRecord {
  /** Firestore document id (present only for records synced to Firestore) */
  id?: string;
  workout: string;
  recordType: keyof typeof RECORD_TYPES;
  /** "HH:MM:SS" for TIME, "<value> KG|LB" for WEIGHT, "<n>" for REPS */
  recordValue: string;
  /** ISO 8601 date string */
  date: string;
}

export interface WorkoutOption {
  name: string;
  category: string;
  type?: keyof typeof RECORD_TYPES;
}
