
import { useState, useEffect } from 'react';
import ClientList from '@/components/ClientList';
import DocumentGrid from '@/components/DocumentGrid';
import LoginButton from '@/components/LoginButton';
import { Client, Document } from '@/types';
import { createNewClient } from '@/services/driveClientService';
import { useToast } from "@/components/ui/use-toast";
import '@fontsource/heebo';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDocuments, setClientDocuments] = useState<Record<string, Document[]>>({});
  const { toast } = useToast();
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);

  useEffect(() => {
    // טעינת מזהה תיקיית השורש בעת טעינת הדף
    const storedFolderId = localStorage.getItem('root_folder_id');
    if (storedFolderId) {
      setRootFolderId(storedFolderId);
    }
  }, []);

  const handleCreateClient = async (name: string) => {
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
      toast({
        title: "שגיאה ביצירת לקוח",
        description: "אירעה שגיאה ביצירת הלקוח. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const handleDocumentUpdate = (updatedDoc: Document) => {
    if (!selectedClient) return;

    setClientDocuments((prev) => ({
      ...prev,
      [selectedClient]: prev[selectedClient].map((doc) =>
        doc.id === updatedDoc.id ? { ...updatedDoc, lastModified: new Date() } : doc
      ),
    }));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-heebo">
      <LoginButton onRootFolderCreated={setRootFolderId} />
      <div className="flex h-screen">
        <ClientList
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={setSelectedClient}
          onCreateClient={handleCreateClient}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">ניהול מסמכים</h1>
          {selectedClient ? (
            clientDocuments[selectedClient] ? (
              <DocumentGrid
                documents={clientDocuments[selectedClient]}
                onDocumentUpdate={handleDocumentUpdate}
              />
            ) : (
              <div className="text-center text-gray-500 mt-10">
                אין מסמכים ללקוח זה
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 mt-10">
              בחר לקוח כדי להציג את המסמכים
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
