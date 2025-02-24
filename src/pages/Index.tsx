
import { useState, useEffect, useCallback } from 'react';
import ClientList from '@/components/ClientList';
import DocumentGrid from '@/components/DocumentGrid';
import LoginButton from '@/components/LoginButton';
import { useClients } from '@/hooks/useClients';
import { useDocuments } from '@/hooks/useDocuments';
import '@fontsource/heebo';

const Index = () => {
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  
  const { 
    clients, 
    selectedClient, 
    setSelectedClient, 
    loadClients, 
    handleCreateClient,
    updateClientDocumentCount 
  } = useClients();
  
  const { 
    clientDocuments, 
    isLoadingDocs, 
    loadClientDocuments, 
    handleDocumentUpdate 
  } = useDocuments();

  const handleClientSelect = useCallback((clientId: string) => {
    console.log('Selected client:', clientId);
    setSelectedClient(clientId);
    
    const client = clients.find(c => c.id === clientId);
    if (client) {
      loadClientDocuments(client.folderId, clientId).then(count => {
        if (count !== undefined) {
          updateClientDocumentCount(clientId, count);
        }
      });
    }
  }, [clients, loadClientDocuments, setSelectedClient, updateClientDocumentCount]);

  useEffect(() => {
    const storedFolderId = localStorage.getItem('root_folder_id');
    if (storedFolderId) {
      console.log('Initializing with root folder:', storedFolderId);
      setRootFolderId(storedFolderId);
      loadClients(storedFolderId);
    }
  }, []); // רק בטעינה הראשונית

  const handleRootFolderCreated = useCallback((folderId: string) => {
    console.log('Root folder created:', folderId);
    setRootFolderId(folderId);
    loadClients(folderId);
  }, [loadClients]);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-heebo">
      <LoginButton onRootFolderCreated={handleRootFolderCreated} />
      <div className="flex h-screen">
        <ClientList
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={handleClientSelect}
          onCreateClient={(name) => rootFolderId && handleCreateClient(rootFolderId, name)}
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
                onDocumentUpdate={(doc) => handleDocumentUpdate(selectedClient, doc)}
                selectedClientFolderId={clients.find(c => c.id === selectedClient)?.folderId || ''}
                onUploadComplete={() => {
                  const client = clients.find(c => c.id === selectedClient);
                  if (client) {
                    loadClientDocuments(client.folderId, selectedClient).then(count => {
                      if (count !== undefined) {
                        updateClientDocumentCount(selectedClient, count);
                      }
                    });
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
