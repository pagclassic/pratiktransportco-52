import { supabase } from "@/integrations/supabase/client";
import { TransportEntry } from "@/types/transport";
import { toast } from "sonner";

// Transform date objects for Supabase (Date objects to ISO strings)
const prepareEntryForDb = (entry: TransportEntry) => {
  return {
    ...entry,
    date: entry.date instanceof Date ? entry.date.toISOString() : entry.date,
    advance_date: entry.advanceDate instanceof Date ? entry.advanceDate.toISOString() : entry.advanceDate,
    balance_date: entry.balanceDate instanceof Date ? entry.balanceDate.toISOString() : entry.balanceDate,
    // Map to DB column names
    vehicle_number: entry.vehicleNumber,
    driver_name: entry.driverName,
    driver_mobile: entry.driverMobile,
    transport_name: entry.transportName,
    rent_amount: entry.rentAmount,
    advance_amount: entry.advanceAmount,
    advance_type: entry.advanceType,
    balance_status: entry.balanceStatus,
    // Remove JavaScript properties that don't exist in the DB
    vehicleNumber: undefined,
    driverName: undefined,
    driverMobile: undefined,
    transportName: undefined,
    rentAmount: undefined,
    advanceAmount: undefined,
    advanceDate: undefined,
    advanceType: undefined,
    balanceStatus: undefined,
    balanceDate: undefined
  };
};

// Transform Supabase data to our app's format (ISO strings to Date objects)
const transformDbEntry = (entry: any): TransportEntry => {
  return {
    id: entry.id,
    date: new Date(entry.date),
    vehicleNumber: entry.vehicle_number,
    driverName: entry.driver_name || "",
    driverMobile: entry.driver_mobile || "",
    place: entry.place || "",
    transportName: entry.transport_name || "",
    rentAmount: Number(entry.rent_amount),
    advanceAmount: entry.advance_amount ? Number(entry.advance_amount) : null,
    advanceDate: entry.advance_date ? new Date(entry.advance_date) : null,
    advanceType: entry.advance_type || "Cash",
    balanceStatus: entry.balance_status,
    balanceDate: entry.balance_date ? new Date(entry.balance_date) : null,
  };
};

export const fetchTransportEntries = async (): Promise<TransportEntry[]> => {
  try {
    console.log('Fetching transport entries from Supabase...');
    
    const { data, error } = await supabase
      .from('transport_entries')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error.message);
      toast.error('Failed to load entries');
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No entries found in database');
      return [];
    }

    console.log(`Successfully fetched ${data.length} entries`);
    
    return data.map(entry => transformDbEntry(entry));
  } catch (error) {
    console.error('Failed to fetch entries:', error);
    toast.error('Failed to load entries');
    return [];
  }
};

export const createTransportEntry = async (entry: TransportEntry): Promise<TransportEntry | null> => {
  try {
    const { id, ...entryData } = entry;
    const preparedEntry = prepareEntryForDb(entryData as TransportEntry);
    
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

    toast.success('Entry created successfully');
    return data;
  } catch (error) {
    console.error('Failed to create entry:', error);
    toast.error('Failed to create entry');
    return null;
  }
};

export const updateTransportEntry = async (entry: TransportEntry): Promise<boolean> => {
  try {
    const preparedEntry = prepareEntryForDb(entry);
    const { id, ...updateData } = preparedEntry;

    const { error } = await supabase
      .from('transport_entries')
      .update(updateData)
      .eq('id', entry.id);

    if (error) {
      console.error('Error updating entry:', error.message);
      toast.error('Failed to update entry');
      return false;
    }

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
    const { error } = await supabase
      .from('transport_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error.message);
      toast.error('Failed to delete entry');
      return false;
    }

    toast.success('Entry deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete entry:', error);
    toast.error('Failed to delete entry');
    return false;
  }
};
