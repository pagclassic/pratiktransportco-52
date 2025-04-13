
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

// For demonstration, we're using a hard-coded verification code
// In a real app, this would be sent via email and verified on the server
const ADMIN_VERIFICATION_CODE = "123456";

const formSchema = z.object({
  code: z.string().length(6, "Please enter a 6-digit verification code")
});

type FormValues = z.infer<typeof formSchema>;

const EmailVerification = ({ email }: { email: string }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Verifying code:", values.code);
      
      // Here you would typically call an API to verify the code
      // For now, we're using a hard-coded verification code
      const isValid = values.code === ADMIN_VERIFICATION_CODE;
      
      if (isValid) {
        // Set admin in localStorage
        localStorage.setItem("admin", JSON.stringify({ 
          email: email, 
          isLoggedIn: true 
        }));
        
        toast.success("Verification successful");
        navigate("/admin/dashboard");
      } else {
        toast.error("Invalid verification code");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Something went wrong during verification");
    } finally {
      setIsLoading(false);
    }
  };

  // In a real implementation, this function would trigger an email with a verification code
  const sendVerificationCode = async () => {
    toast.info(`Verification code sent to ${email}`);
    
    // In a real app, you would call Supabase Edge Function to send an email
    // Example:
    // await supabase.functions.invoke('send-verification-email', {
    //   body: { email },
    // });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Verification</CardTitle>
          <CardDescription>
            Please enter the verification code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={sendVerificationCode}
              >
                Resend Code
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
