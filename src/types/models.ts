export type Role = 'citizen' | 'volunteer' | 'ngo_admin';
export type RequestStatus = 'pending' | 'assigned' | 'resolved';
export type IncidentStatus = 'pending' | 'acknowledged' | 'resolved'; // New status for Incident
export type RequestType = 'Medical' | 'Fire' | 'Flood' | 'Rescue' | 'Other';
export type ResourceType = 'Shelter' | 'Blood' | 'Hospital' | 'Food' | 'Medicine';

export interface ILocation {
  lat: number;
  lng: number;
  address: string;
}

export interface IUser {
  id: string;
  full_name: string;
  role: Role;
  contact_info?: string;
  created_at: string;
}

export interface IEmergencyRequest {
  id: string;
  requester_id: string;
  type: RequestType;
  status: RequestStatus;
  description: string;
  location: ILocation;
  volunteer_id?: string | null;
  created_at: string;
}

export interface IResource {
  id: string;
  provider_id: string;
  type: ResourceType;
  quantity: string;
  location: ILocation;
  description?: string;
  created_at: string;
}

export interface IVolunteerRegistration {
  id: string;
  request_id: string;
  volunteer_id: string;
  message?: string;
  contact_info: string;
  created_at: string;
  // Joins
  volunteer?: IUser;
  request?: IEmergencyRequest;
}

export interface IIncident {
  id: string;
  device_emergency_id: string;
  phone_number?: string;
  latitude: number;
  longitude: number;
  location_confidence: 'high' | 'cell-tower' | 'unknown';
  source_channel: 'data' | 'call' | 'sms';
  status: IncidentStatus;
  voice_url?: string;
  created_at: string;
}
