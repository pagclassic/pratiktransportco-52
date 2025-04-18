import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "pratikgangurde35@gmail.com";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

const UserLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    console.log("[Login] Attempting login with email:", values.email);
    
    // Check for admin login first
    if (values.email.trim() === ADMIN_EMAIL) {
      console.log("[Login] Admin login detected, redirecting to verification");
      setTimeout(() => {
        setIsLoading(false);
        navigate("/verify-admin", { state: { email: values.email } });
      }, 1000);
      return;
    }
    
    try {
      console.log("[Login] Checking transport credentials for:", values.email);
      
      // Get transport credentials directly from the transport_credentials table
      const { data: credentials, error: credentialsError } = await supabase
        .from('transport_credentials')
        .select('company_id, password_hash, email')
        .eq('email', values.email)
        .single();
      
      if (credentialsError || !credentials) {
        console.error("[Login] Credentials error:", credentialsError);
        toast.error("Invalid credentials. Please check your email and password.");
        setIsLoading(false);
        return;
      }

      // Basic password verification (in a real app, use proper hashing)
      if (credentials.password_hash !== values.password) {
        console.error("[Login] Invalid password");
        toast.error("Invalid credentials. Please check your email and password.");
        setIsLoading(false);
        return;
      }

      // Get company details
      const { data: company, error: companyError } = await supabase
        .from('transport_companies')
        .select('name, is_active')
        .eq('id', credentials.company_id)
        .single();
      
      if (companyError || !company) {
        console.error("[Login] Company error:", companyError);
        toast.error("Company not found");
        setIsLoading(false);
        return;
      }

      if (!company.is_active) {
        console.log("[Login] Company is inactive");
        toast.error("Your account has been paused. Please contact administrator.");
        setIsLoading(false);
        return;
      }

      console.log("[Login] Login successful for company:", company.name);

      // Store user info in localStorage
      const userData = { 
        email: values.email, 
        companyId: credentials.company_id,
        companyName: company.name
      };
      
      localStorage.setItem("currentUser", JSON.stringify(userData));
      toast.success("Login successful");
      navigate("/");
      
    } catch (error) {
      console.error("[Login] Error:", error);
      toast.error("System error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Transport Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your transport dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLogin;
