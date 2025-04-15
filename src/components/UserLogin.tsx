
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
import LocalStorageDebugger from './LocalStorageDebugger';

const ADMIN_EMAIL = "pratikgangurde35@gmail.com";
const ADMIN_PASSWORD = "Pratik121ff@ybl";

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

  const onSubmit = (values: FormValues) => {
    setIsLoading(true);
    
    console.log("[Login] Attempting login with email:", values.email, "Password length:", values.password.length);
    
    // Check for admin login first
    if (values.email.trim() === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      console.log("[Login] Admin login detected, redirecting to verification");
      setTimeout(() => {
        setIsLoading(false);
        navigate("/verify-admin", { state: { email: values.email } });
      }, 1000);
      return;
    }
    
    // Get user credentials from localStorage
    const userCredentialsStr = localStorage.getItem('userCredentials');
    const companiesStr = localStorage.getItem('transportCompanies');
    
    console.log("[Login] localStorage keys:", Object.keys(localStorage));
    console.log("[Login] userCredentials exists:", !!userCredentialsStr);
    console.log("[Login] transportCompanies exists:", !!companiesStr);
    
    if (!userCredentialsStr) {
      console.warn("[Login] No userCredentials found in localStorage");
      setTimeout(() => {
        toast.error("No user accounts found. Please contact administrator.");
        setIsLoading(false);
      }, 1000);
      return;
    }
    
    try {
      const userCredentials = JSON.parse(userCredentialsStr);
      const companies = JSON.parse(companiesStr || '[]');
      
      console.log("[Login] Found", userCredentials.length, "user accounts");
      console.log("[Login] Credentials stored:", userCredentials.map((u: any) => ({ 
        email: u.email, 
        companyId: u.companyId, 
        passwordLength: u.password?.length || 0 
      })));
      
      // Find user with matching credentials
      const user = userCredentials.find((u: any) => 
        u.email === values.email && u.password === values.password
      );
      
      console.log("[Login] User match found:", !!user);
      
      setTimeout(() => {
        if (user) {
          console.log("[Login] Checking company details for ID:", user.companyId);
          const company = companies.find((c: any) => c.id === user.companyId);
          
          if (!company) {
            console.error("[Login] Company not found for ID:", user.companyId);
            toast.error("Company not found");
            setIsLoading(false);
            return;
          }
          
          console.log("[Login] Company found:", company.name, "Active:", company.isActive);
          
          if (!company.isActive) {
            console.log("[Login] Company is inactive");
            toast.error("Your account has been paused. Please contact administrator.");
            setIsLoading(false);
            return;
          }
          
          // Store user info in localStorage
          const userData = { 
            email: values.email, 
            companyId: user.companyId,
            companyName: company.name
          };
          
          console.log("[Login] Setting currentUser:", userData);
          localStorage.setItem("currentUser", JSON.stringify(userData));
          
          toast.success("Login successful");
          navigate("/");
        } else {
          console.log("[Login] Invalid credentials - user not found");
          toast.error("Invalid credentials. Please check your email and password.");
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("[Login] Error parsing localStorage data:", error);
      toast.error("System error. Please try again later.");
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
          <LocalStorageDebugger />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLogin;
