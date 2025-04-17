
-- Function to create transport credentials with proper permissions
CREATE OR REPLACE FUNCTION public.create_transport_credentials(
  company_id UUID,
  email_address TEXT,
  password_hash TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This executes with the privileges of the function creator
SET search_path = public -- Restrict search path for security
AS $$
BEGIN
  INSERT INTO public.transport_credentials (company_id, email, password_hash)
  VALUES (company_id, email_address, password_hash);
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in create_transport_credentials: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission to the anon role
GRANT EXECUTE ON FUNCTION public.create_transport_credentials TO anon;
GRANT EXECUTE ON FUNCTION public.create_transport_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_transport_credentials TO service_role;

-- Grant necessary permissions on the transport_credentials table
GRANT INSERT ON public.transport_credentials TO anon, authenticated, service_role;
