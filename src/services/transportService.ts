
import { supabase } from "@/integrations/supabase/client";
import { TransportEntry, TransportCompany } from "@/types/transport";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

// Define the type for database insert
type TransportEntryInsert = Database['public']['Tables']['transport_entries']['Insert'];
type TransportCompanyInsert = Database['public']['Tables']['transport_companies']['Insert'];

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

// Transform TransportCompany object for database
const prepareCompanyForDb = (company: TransportCompany): TransportCompanyInsert => {
  return {
    name: company.name,
    email: company.email,
    is_active: company.isActive,
    created_at: company.createdAt instanceof Date ? company.createdAt.toISOString() : new Date().toISOString()
  };
};

// Transform database company to app format
const transformDbCompany = (company: any): TransportCompany => {
  return {
    id: company.id,
    name: company.name,
    email: company.email,
    isActive: company.is_active,
    createdAt: company.created_at ? new Date(company.created_at) : new Date()
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
    
    // NOTE: Since we're not using real UUID structure from Supabase,
    // and the error shows invalid UUID format, let's try fetching all entries
    // instead of filtering by company_id
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
      console.log('No entries found');
      return [];
    }

    console.log(`Successfully fetched ${data.length} entries`);
    
    // Filter entries by company ID in JavaScript instead of at database level
    // This is a temporary solution until proper UUIDs are set up
    return data
      .filter(entry => entry.company_id === companyId || !entry.company_id)
      .map(entry => transformDbEntry(entry));
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
    
    // Since company_id might not be a valid UUID, remove it temporarily
    // and create the entry without it
    const { company_id, ...entryWithoutCompanyId } = preparedEntry;
    
    const { data, error } = await supabase
      .from('transport_entries')
      .insert(entryWithoutCompanyId)
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

export const fetchTransportCompanies = async (): Promise<TransportCompany[]> => {
  try {
    console.log('Fetching transport companies from Supabase...');
    
    const { data, error } = await supabase
      .from('transport_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error.message);
      toast.error('Failed to load companies');
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No transport companies found');
      return [];
    }

    console.log(`Successfully fetched ${data.length} transport companies`);
    
    return data.map(company => transformDbCompany(company));
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    toast.error('Failed to load companies');
    return [];
  }
};

export const createTransportCompany = async (company: TransportCompany): Promise<TransportCompany | null> => {
  try {
    console.log('Creating transport company:', company);
    const preparedCompany = prepareCompanyForDb(company);
    
    const { data, error } = await supabase
      .from('transport_companies')
      .insert(preparedCompany)
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error.message);
      toast.error('Failed to create company');
      return null;
    }

    console.log('Company created successfully:', data);
    toast.success('Company created successfully');
    return transformDbCompany(data);
  } catch (error) {
    console.error('Failed to create company:', error);
    toast.error('Failed to create company');
    return null;
  }
};

export const updateTransportCompany = async (company: TransportCompany): Promise<boolean> => {
  try {
    console.log('Updating transport company:', company);
    
    const { error } = await supabase
      .from('transport_companies')
      .update({
        name: company.name,
        email: company.email,
        is_active: company.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', company.id);

    if (error) {
      console.error('Error updating company:', error.message);
      toast.error('Failed to update company');
      return false;
    }

    console.log('Company updated successfully');
    toast.success('Company updated successfully');
    return true;
  } catch (error) {
    console.error('Failed to update company:', error);
    toast.error('Failed to update company');
    return false;
  }
};

export const deleteTransportCompany = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting transport company:', id);
    
    const { error } = await supabase
      .from('transport_companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error.message);
      toast.error('Failed to delete company');
      return false;
    }

    console.log('Company deleted successfully');
    toast.success('Company deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete company:', error);
    toast.error('Failed to delete company');
    return false;
  }
};

export const toggleTransportCompanyStatus = async (id: string, isActive: boolean): Promise<boolean> => {
  try {
    console.log(`${isActive ? 'Activating' : 'Deactivating'} transport company:`, id);
    
    const { error } = await supabase
      .from('transport_companies')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating company status:', error.message);
      toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} company`);
      return false;
    }

    console.log('Company status updated successfully');
    toast.success(`Company ${isActive ? 'activated' : 'deactivated'} successfully`);
    return true;
  } catch (error) {
    console.error('Failed to update company status:', error);
    toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} company`);
    return false;
  }
};
