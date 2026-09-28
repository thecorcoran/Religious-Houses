export interface Monastery {
  id: string;
  name: string;
  church_rite: string;
  religious_order: string;
  house_type: string;
  year_founded: number | null;
  is_cloistered: boolean;
  is_mens_house: boolean;
  state_province: string;
  country: string;
  address_verified: string | null;
  motherhouse_location?: string | null;
  website_url: string | null;
  contact_person?: string | null;
  contact_email?: string | null;
  map_lat_lng: [number, number] | null;
  notes?: string | null;
  city?: string | null;
  diocese_eparchy?: string | null;
  vocations_url?: string | null;
  phone?: string | null;
}

