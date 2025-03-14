
import { supabase } from "@/integrations/supabase/client";
import { TransportEntry } from "@/types/transport";
import { toast } from "@/hooks/use-toast";

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
    balance_status: entry.balanceStatus
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
    const { data, error } = await supabase
      .from('transport_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map(transformDbEntry);
  } catch (error) {
    console.error('Error fetching transport entries:', error);
    toast({
      title: "Error fetching entries",
      description: "There was a problem loading your data. Please try again.",
      variant: "destructive",
    });
    return [];
  }
};

export const createTransportEntry = async (entry: TransportEntry): Promise<TransportEntry | null> => {
  try {
    // Remove id property when creating a new entry
    const { id, ...entryWithoutId } = entry;
    const preparedEntry = prepareEntryForDb(entryWithoutId as TransportEntry);
    
    // Add console logs to debug
    console.log('Entry to create:', entry);
    console.log('Prepared entry for DB:', preparedEntry);
    
    const { data, error } = await supabase
      .from('transport_entries')
      .insert(preparedEntry)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return transformDbEntry(data);
  } catch (error) {
    console.error('Error creating transport entry:', error);
    toast({
      title: "Error creating entry",
      description: "There was a problem saving your data. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

export const updateTransportEntry = async (entry: TransportEntry): Promise<TransportEntry | null> => {
  try {
    const preparedEntry = prepareEntryForDb(entry);
    
    // Remove id from the update data, as it's used in the where clause
    const { id, ...updateData } = preparedEntry;
    
    const { data, error } = await supabase
      .from('transport_entries')
      .update(updateData)
      .eq('id', entry.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return transformDbEntry(data);
  } catch (error) {
    console.error('Error updating transport entry:', error);
    toast({
      title: "Error updating entry",
      description: "There was a problem updating your data. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteTransportEntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transport_entries')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting transport entry:', error);
    toast({
      title: "Error deleting entry",
      description: "There was a problem deleting your data. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
