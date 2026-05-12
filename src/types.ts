export type UserRole = 'user' | 'moderator' | 'route_manager' | 'admin';
export type UserStatus = 'active' | 'banned';
export type RouteStatus = 'active' | 'inactive';
export type ReportStatus = 'pending' | 'approved' | 'rejected' | 'spam';
export type NotificationType = 'announcement' | 'disruption' | 'emergency';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  credibilityScore: number;
  status: UserStatus;
  reportCount: number;
  createdAt?: any;
}

export interface Stop {
  id: string;
  name: string;
  sequence: number;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  status: RouteStatus;
  estimatedDuration: number;
  stops: Stop[];
  updatedAt?: any;
}

export interface BusReport {
  id?: string;
  userId: string;
  userName: string;
  routeId: string;
  stopId: string;
  timestamp: any;
  credibilityScore: number;
  status: ReportStatus;
  location: {
    lat: number;
    lng: number;
  };
}

export interface ETA {
  id?: string;
  routeId: string;
  stopId: string;
  estimatedAt: any;
  confidence: number;
}

export interface AppNotification {
  id?: string;
  title: string;
  message: string;
  type: NotificationType;
  scheduledFor: any;
  sentBy: string;
  sentAt?: any;
}
