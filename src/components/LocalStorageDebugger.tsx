
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LocalStorageDebugger = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const loadDebugData = () => {
    try {
      const userCredentials = JSON.parse(localStorage.getItem('userCredentials') || '[]');
      setCredentials(userCredentials.map((cred: any) => ({
        ...cred,
        password: '******' // Hide passwords
      })));
      
      const transportCompanies = JSON.parse(localStorage.getItem('transportCompanies') || '[]');
      setCompanies(transportCompanies);
      
      setShowDebug(true);
    } catch (error) {
      console.error("Error loading debug data:", error);
    }
  };

  return (
    <div className="mt-6">
      <Button 
        variant="outline" 
        onClick={loadDebugData} 
        className="mb-4"
      >
        {showDebug ? "Refresh Debug Data" : "Check Stored Credentials"}
      </Button>
      
      {showDebug && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transport Companies</CardTitle>
              <CardDescription>List of registered transport companies</CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <p className="text-gray-500">No companies found</p>
              ) : (
                <div className="space-y-4">
                  {companies.map((company, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <strong>Name:</strong> <span>{company.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>ID:</strong> <span>{company.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Email:</strong> <span>{company.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Active:</strong> 
                        <span className={company.isActive ? "text-green-500" : "text-red-500"}>
                          {company.isActive ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Credentials</CardTitle>
              <CardDescription>List of registered user credentials</CardDescription>
            </CardHeader>
            <CardContent>
              {credentials.length === 0 ? (
                <p className="text-gray-500">No credentials found</p>
              ) : (
                <div className="space-y-4">
                  {credentials.map((cred, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <strong>Email:</strong> <span>{cred.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Company ID:</strong> <span>{cred.companyId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LocalStorageDebugger;
