
import { useState, useEffect, useCallback } from 'react';
import ClientList from '@/components/ClientList';
import DocumentGrid from '@/components/DocumentGrid';
import LoginButton from '@/components/LoginButton';
import { useClients } from '@/hooks/useClients';
import { useDocuments } from '@/hooks/useDocuments';
import '@fontsource/heebo';

const Index = () => {
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
  }, [loadClients]);

  const handleRootFolderCreated = useCallback((folderId: string) => {
    console.log('Root folder created:', folderId);
    setRootFolderId(folderId);
    loadClients(folderId);
  }, [loadClients]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-heebo">
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 flex justify-between items-center">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
        <LoginButton onRootFolderCreated={handleRootFolderCreated} />
      </div>
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          fixed top-16 right-0 bottom-0 z-20 w-64 
          md:relative md:translate-x-0 md:top-0
          transition-transform duration-300 ease-in-out
        `}>
          <ClientList
            clients={clients}
            selectedClient={selectedClient}
            onClientSelect={handleClientSelect}
            onCreateClient={(name) => rootFolderId && handleCreateClient(rootFolderId, name)}
          />
        </div>
        
        <main className={`
          flex-1 p-4 md:p-6 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'md:mr-64' : ''}
        `}>
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
