
import { useState } from 'react';
import ClientList from '@/components/ClientList';
import DocumentGrid from '@/components/DocumentGrid';
import { clients, documents } from '@/data/mockData';
import { Document } from '@/types';
import '@fontsource/heebo';

const Index = () => {
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [clientDocuments, setClientDocuments] = useState(documents);

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
      <div className="flex h-screen">
        <ClientList
          clients={clients}
          selectedClient={selectedClient}
          onClientSelect={setSelectedClient}
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
