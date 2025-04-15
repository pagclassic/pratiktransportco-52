
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

const LocalStorageDebugger = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  const loadDebugData = () => {
    try {
      // Clear any previous errors
      setStorageError(null);
      
      // Get userCredentials
      const userCredentialsStr = localStorage.getItem('userCredentials');
      if (!userCredentialsStr) {
        console.warn("No userCredentials found in localStorage");
      }
      
      const userCredentials = JSON.parse(userCredentialsStr || '[]');
      setCredentials(userCredentials.map((cred: any) => ({
        ...cred,
        password: '******', // Hide passwords
        rawData: JSON.stringify(cred, null, 2) // Store raw data for inspection
      })));
      
      // Get transportCompanies
      const transportCompaniesStr = localStorage.getItem('transportCompanies');
      if (!transportCompaniesStr) {
        console.warn("No transportCompanies found in localStorage");
      }
      
      const transportCompanies = JSON.parse(transportCompaniesStr || '[]');
      setCompanies(transportCompanies);
      
      // Get current user if available
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        setCurrentUser(JSON.parse(currentUserStr));
      } else {
        setCurrentUser(null);
      }
      
      setShowDebug(true);
    } catch (error) {
      console.error("Error loading debug data:", error);
      setStorageError(error instanceof Error ? error.message : 'Unknown error parsing localStorage data');
    }
  };

  // Auto-load debug data when component mounts
  useEffect(() => {
    loadDebugData();
  }, []);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          onClick={loadDebugData} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {showDebug ? "Refresh Debug Data" : "Check Stored Credentials"}
        </Button>
        
        {storageError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>{storageError}</AlertDescription>
          </Alert>
        )}
      </div>
      
      {showDebug && (
        <div className="space-y-4 mt-4">
          {/* Current User Info */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Current User Status</CardTitle>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <div className="text-sm">
                  <Badge className="mb-2 bg-green-500">Logged In</Badge>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="font-medium">Email:</div>
                    <div>{currentUser.email}</div>
                    <div className="font-medium">Company ID:</div>
                    <div>{currentUser.companyId || 'None'}</div>
                    <div className="font-medium">Company Name:</div>
                    <div>{currentUser.companyName || 'None'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-100">Not Logged In</Badge>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Transport Companies */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                Transport Companies
                <Badge variant="outline" className="ml-2 text-xs">
                  {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}
                </Badge>
              </CardTitle>
              <CardDescription>Registered transport companies in localStorage</CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <p className="text-gray-500 text-sm">No companies found</p>
              ) : (
                <div className="space-y-4">
                  {companies.map((company, index) => (
                    <div key={index} className="p-3 border rounded-md text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <strong className="text-primary">{company.name}</strong>
                        <Badge className={company.isActive ? "bg-green-500" : "bg-red-500"}>
                          {company.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div className="font-medium">ID:</div>
                        <div className="font-mono text-xs overflow-hidden text-ellipsis">{company.id}</div>
                        <div className="font-medium">Email:</div>
                        <div>{company.email}</div>
                        <div className="font-medium">Created:</div>
                        <div>{new Date(company.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* User Credentials */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                User Credentials
                <Badge variant="outline" className="ml-2 text-xs">
                  {credentials.length} {credentials.length === 1 ? 'User' : 'Users'}
                </Badge>
              </CardTitle>
              <CardDescription>User login credentials stored in localStorage</CardDescription>
            </CardHeader>
            <CardContent>
              {credentials.length === 0 ? (
                <p className="text-gray-500 text-sm">No credentials found</p>
              ) : (
                <div className="space-y-4">
                  {credentials.map((cred, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div className="font-medium">Email:</div>
                        <div>{cred.email}</div>
                        <div className="font-medium">Password:</div>
                        <div>{cred.password}</div>
                        <div className="font-medium">Company ID:</div>
                        <div className="font-mono text-xs overflow-hidden text-ellipsis">
                          {cred.companyId}
                        </div>
                        <div className="font-medium">Associated Company:</div>
                        <div>
                          {companies.find((c) => c.id === cred.companyId)?.name || 
                            <span className="text-red-500">Not found</span>}
                        </div>
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-500">View Raw JSON</summary>
                        <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">{cred.rawData}</pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Storage Keys Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">localStorage Overview</CardTitle>
              <CardDescription>All keys in localStorage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(localStorage).map((key) => (
                  <Badge key={key} variant="outline" className="justify-start overflow-hidden">
                    {key}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LocalStorageDebugger;
