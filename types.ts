export type Tab = 'Homepage' | 'Intake & Analyze' | 'Formula Builder' | 'Simulation Studio' | 'Research & Education' | 'Profile';

export interface ClientPhoto {
  file: File;
  base64: string;
  url: string;
}

export interface HairAnalysis {
  naturalLevel: string;
  currentCosmeticLevel: string;
  dominantUndertone: string;
  grayPercentage: string;
  porosity: 'Low' | 'Medium' | 'High' | string;
  bandingZones: string;
  riskFlags: string;
  stylistNotes: string;
}

export interface ColorPlan {
  path: string;
  preLighten: {
    product: string;
    ratio: string;
    zone: string;
    time: string;
    visualEndpoint: string;
  } | null;
  tone: {
    shades: string;
    ratio: string;
    developer: string;
    time: string;
  } | null;
  fashionOverlay: {
    shades: string;
    saturation: string;
    time: string;
  } | null;
  steps: string[];
}

export type UserRole = 'Owner' | 'Admin' | 'Stylist';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  isVerified: boolean;
  licenseUrl?: string;
  createdAt: Date;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
