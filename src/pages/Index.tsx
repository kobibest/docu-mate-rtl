
import { useState, useEffect } from 'react';
import ClientList from '@/components/ClientList';
import DocumentGrid from '@/components/DocumentGrid';
import LoginButton from '@/components/LoginButton';
import { Client, Document } from '@/types';
import { createNewClient, loadExistingClients, loadClientDocuments as loadDocs } from '@/services/driveClientService';
import { useToast } from "@/components/ui/use-toast";
import '@fontsource/heebo';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDocuments, setClientDocuments] = useState<Record<string, Document[]>>({});
  const { toast } = useToast();
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const loadClients = async (folderId: string) => {
    console.log('Loading clients for folder:', folderId);
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return;

    try {
      const existingClients = await loadExistingClients(accessToken, folderId);
      console.log('Loaded clients:', existingClients);
      setClients(existingClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "שגיאה בטעינת לקוחות",
        description: "אירעה שגיאה בטעינת רשימת הלקוחות",
        variant: "destructive",
      });
    }
  };

  const loadClientDocuments = async (folderId: string) => {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return;

    console.log('Loading documents for client folder:', folderId);
    setIsLoadingDocs(true);

    try {
      const documents = await loadDocs(accessToken, folderId);
      console.log('Loaded documents:', documents);
      
      if (selectedClient) {
        console.log('Updating documents for client:', selectedClient);
        setClientDocuments(prev => ({
          ...prev,
          [selectedClient]: documents
        }));
        
        // עדכון מספר המסמכים בלקוח
        setClients(prev => prev.map(c => 
          c.id === selectedClient ? { ...c, documentCount: documents.length } : c
        ));
      }
    } catch (error) {
      console.error('Error loading client documents:', error);
      toast({
        title: "שגיאה בטעינת מסמכים",
        description: "אירעה שגיאה בטעינת מסמכי הלקוח",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    console.log('Selected client:', clientId);
    setSelectedClient(clientId);
    setClientDocuments(prev => ({ ...prev, [clientId]: [] })); // אתחול מערך ריק לפני הטעינה
    
    const client = clients.find(c => c.id === clientId);
    if (client) {
      loadClientDocuments(client.folderId);
    }
  };

  useEffect(() => {
    const storedFolderId = localStorage.getItem('root_folder_id');
    if (storedFolderId && !isInitialized) {
      console.log('Initializing with root folder:', storedFolderId);
      setRootFolderId(storedFolderId);
      setIsInitialized(true);
      loadClients(storedFolderId);
    }
  }, [isInitialized]);

  const handleRootFolderCreated = (folderId: string) => {
    console.log('Root folder created:', folderId);
    setRootFolderId(folderId);
    setIsInitialized(true);
    loadClients(folderId);
  };

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

    setClientDocuments(prev => ({
      ...prev,
      [selectedClient]: prev[selectedClient].map((doc) =>
        doc.id === updatedDoc.id ? { ...updatedDoc, lastModified: new Date() } : doc
      ),
    }));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-heebo">
      <LoginButton onRootFolderCreated={handleRootFolderCreated} />
      <div className="flex h-screen">
        <ClientList
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={handleClientSelect}
          onCreateClient={handleCreateClient}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold mb-6">ניהול מסמכים</h1>
          {selectedClient ? (
            isLoadingDocs ? (
              <div className="text-center text-gray-500 mt-10">
                טוען מסמכים...
              </div>
            ) : clientDocuments[selectedClient] ? (
              <DocumentGrid
                documents={clientDocuments[selectedClient]}
                onDocumentUpdate={handleDocumentUpdate}
                selectedClientFolderId={clients.find(c => c.id === selectedClient)?.folderId || ''}
                onUploadComplete={() => {
                  const client = clients.find(c => c.id === selectedClient);
                  if (client) {
                    loadClientDocuments(client.folderId);
                  }
                }}
              />
            ) : (
              <div className="text-center text-gray-500 mt-10">
                אין מסמכים בתיקייה זו
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
