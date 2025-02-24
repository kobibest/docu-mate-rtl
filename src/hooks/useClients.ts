
import { useState, useCallback } from 'react';
import { Client } from '@/types';
import { createNewClient, loadExistingClients } from '@/services/driveClientService';
import { useToast } from "@/components/ui/use-toast";

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const { toast } = useToast();

  const loadClients = useCallback(async (folderId: string) => {
    console.log('Loading clients for folder:', folderId);
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) {
      toast({
        title: "יש להתחבר מחדש",
        description: "נדרשת התחברות מחדש לGoogle",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingClients = await loadExistingClients(accessToken, folderId);
      console.log('Loaded clients:', existingClients);
      setClients(existingClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        toast({
          title: "יש להתחבר מחדש",
          description: "נדרשת התחברות מחדש לGoogle",
          variant: "destructive",
        });
      } else {
        toast({
          title: "שגיאה בטעינת לקוחות",
          description: "אירעה שגיאה בטעינת רשימת הלקוחות",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleCreateClient = useCallback(async (rootFolderId: string, name: string) => {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken || !rootFolderId) {
      toast({
        title: "שגיאה",
        description: "יש להתחבר לחשבון Google תחילה",
        variant: "destructive",
      });
      return;
    }

    try {
      const newClient = await createNewClient(accessToken, rootFolderId, name);
      setClients(prev => [...prev, newClient]);
      toast({
        title: "לקוח נוצר בהצלחה",
        description: `הלקוח ${name} נוסף למערכת`,
      });
    } catch (error) {
      console.error('Error creating client:', error);
      if (error instanceof Error && error.message === 'UNAUTHORIZED') {
        toast({
          title: "יש להתחבר מחדש",
          description: "נדרשת התחברות מחדש לGoogle",
          variant: "destructive",
        });
      } else {
        toast({
          title: "שגיאה ביצירת לקוח",
          description: "אירעה שגיאה ביצירת הלקוח. אנא נסה שוב.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const updateClientDocumentCount = useCallback((clientId: string, count: number) => {
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, documentCount: count } : c
    ));
  }, []);

  return {
    clients,
    selectedClient,
    setSelectedClient,
    loadClients,
    handleCreateClient,
    updateClientDocumentCount
  };
};
