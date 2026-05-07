export interface GeoPoint {
  lat: number;
  lng: number;
}

export type CatSex = 'male' | 'female' | 'unsure';

export interface Cat {
  id: string;
  name: string;
  photoUrl?: string;
  color: string;
  sex: CatSex;
  isNeutered: boolean;
  personality?: string;
  healthNotes?: string;
  watchOut?: string;
  preferredFoods?: string;
  location: GeoPoint;
  areaDescription?: string;
  createdByUid: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
}

export type CatDraft = Omit<
  Cat,
  'id' | 'createdByUid' | 'createdByName' | 'createdAt' | 'updatedAt'
>;

export interface FeedingLog {
  id: string;
  catId: string;
  feederUid: string;
  feederName: string;
  fedAt: number;
  notes?: string;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoUrl: string | null;
}
