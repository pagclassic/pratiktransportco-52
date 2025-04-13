
import { supabase } from "@/integrations/supabase/client";
import { TransportEntry } from "@/types/transport";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

// Define the type for database insert
type TransportEntryInsert = Database['public']['Tables']['transport_entries']['Insert'];

// Transform date objects for Supabase (Date objects to ISO strings)
const prepareEntryForDb = (entry: TransportEntry): TransportEntryInsert => {
  console.log('Preparing entry for database:', entry);
  return {
    date: entry.date instanceof Date ? entry.date.toISOString() : entry.date,
    advance_date: entry.advanceDate instanceof Date ? entry.advanceDate.toISOString() : entry.advanceDate,
    balance_date: entry.balanceDate instanceof Date ? entry.balanceDate.toISOString() : entry.balanceDate,
    vehicle_number: entry.vehicleNumber,
    driver_name: entry.weight, // Use driver_name column for weight
    driver_mobile: entry.driverMobile,
    transport_name: entry.transportName,
    place: entry.place,
    rent_amount: entry.rentAmount,
    advance_amount: entry.advanceAmount,
    advance_type: entry.advanceType,
    balance_status: entry.balanceStatus,
    company_id: entry.companyId // Add company_id field
  };
};

// Transform Supabase data to our app's format (ISO strings to Date objects)
const transformDbEntry = (entry: any): TransportEntry => {
  console.log('Transforming DB entry:', entry);
  return {
    id: entry.id,
    date: entry.date ? new Date(entry.date) : new Date(),
    vehicleNumber: entry.vehicle_number || "",
    weight: entry.driver_name || "",
    driverMobile: entry.driver_mobile || "",
    place: entry.place || "",
    transportName: entry.transport_name || "",
    rentAmount: Number(entry.rent_amount) || 0,
    advanceAmount: entry.advance_amount ? Number(entry.advance_amount) : null,
    advanceDate: entry.advance_date ? new Date(entry.advance_date) : null,
    advanceType: entry.advance_type || "Cash",
    balanceStatus: entry.balance_status || "Pending",
    balanceDate: entry.balance_date ? new Date(entry.balance_date) : null,
    companyId: entry.company_id || null,
  };
};

export const fetchTransportEntries = async (): Promise<TransportEntry[]> => {
  try {
    console.log('Fetching transport entries from Supabase...');
    
    // Get current user from localStorage
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      console.error('No user data found in localStorage');
      return [];
    }
    
    const user = JSON.parse(userData);
    const companyId = user.companyId;
    
    if (!companyId) {
      console.error('No company ID found in user data');
      return [];
    }
    
    console.log(`Fetching entries for company ID: ${companyId}`);
    
    const { data, error } = await supabase
      .from('transport_entries')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error.message);
      toast.error('Failed to load entries');
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No entries found for this company');
      return [];
    }

    console.log(`Successfully fetched ${data.length} entries for company ID: ${companyId}`);
    
    return data.map(entry => transformDbEntry(entry));
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    toast.error('Failed to load entries');
    return [];
  }
};

export const createTransportEntry = async (entry: TransportEntry): Promise<TransportEntry | null> => {
  try {
    // Get current user's company ID
    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      toast.error('User data not found');
      return null;
    }
    
    const user = JSON.parse(userData);
    const companyId = user.companyId;
    
    if (!companyId) {
      toast.error('Company ID not found');
      return null;
    }
    
    console.log('Creating transport entry for company:', companyId);
    const { id, ...entryData } = entry;
    
    // Create a complete entry object with company ID
    const completeEntry: TransportEntry = {
      ...entryData,
      id: id, // Maintain the ID
      companyId: companyId
    };
    
    // Convert to database format
    const preparedEntry = prepareEntryForDb(completeEntry);
    
    const { data, error } = await supabase
      .from('transport_entries')
      .insert(preparedEntry)
      .select()
      .single();

    if (error) {
      console.error('Error creating entry:', error.message);
      toast.error('Failed to create entry');
      return null;
    }

    console.log('Entry created successfully:', data);
    toast.success('Entry created successfully');
    return transformDbEntry(data);
  } catch (error) {
    console.error('Failed to create entry:', error);
    toast.error('Failed to create entry');
    return null;
  }
};

export const updateTransportEntry = async (entry: TransportEntry): Promise<boolean> => {
  try {
    console.log('Updating transport entry:', entry);
    const preparedEntry = prepareEntryForDb(entry);

    const { error } = await supabase
      .from('transport_entries')
      .update(preparedEntry)
      .eq('id', entry.id);

    if (error) {
      console.error('Error updating entry:', error.message);
      toast.error('Failed to update entry');
      return false;
    }

    console.log('Entry updated successfully');
    toast.success('Entry updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update entry:', error);
    toast.error('Failed to update entry');
    return false;
  }
};

export const deleteTransportEntry = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting transport entry:', id);
    const { error } = await supabase
      .from('transport_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error.message);
      toast.error('Failed to delete entry');
      return false;
    }

    console.log('Entry deleted successfully');
    toast.success('Entry deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete entry:', error);
    toast.error('Failed to delete entry');
    return false;
  }
};
