
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

// Admin credentials
const ADMIN_EMAIL = "pratikgagurde35@gmail.com";
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
    
    // Check if it's an admin login attempt
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      // For admin login, redirect to email verification
      setTimeout(() => {
        setIsLoading(false);
        navigate("/verify-admin", { state: { email: values.email } });
      }, 1000);
      return;
    }
    
    // Regular user login
    // Get user credentials from localStorage
    const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
    const user = userCredentials.find((user: any) => user.email === values.email && user.password === values.password);
    
    // Get companies to check if the user's company is active
    const companies = JSON.parse(localStorage.getItem('transportCompanies') || '[]');
    
    setTimeout(() => {
      if (user) {
        const company = companies.find((c: any) => c.id === user.companyId);
        
        if (!company) {
          toast.error("Company not found");
          setIsLoading(false);
          return;
        }
        
        if (!company.isActive) {
          toast.error("Your account has been paused. Please contact administrator.");
          setIsLoading(false);
          return;
        }
        
        // Set user in localStorage
        localStorage.setItem("currentUser", JSON.stringify({ 
          email: values.email, 
          companyId: user.companyId,
          companyName: company.name
        }));
        
        toast.success("Login successful");
        navigate("/");
      } else {
        toast.error("Invalid credentials");
      }
      setIsLoading(false);
    }, 1000);
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
