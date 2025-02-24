
import { useState } from 'react';
import { Document } from '@/types';
import { loadClientDocuments as loadDocs } from '@/services/driveClientService';
import { useToast } from "@/components/ui/use-toast";

export const useDocuments = () => {
  const [clientDocuments, setClientDocuments] = useState<Record<string, Document[]>>({});
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const { toast } = useToast();

  const loadClientDocuments = async (folderId: string, selectedClient: string) => {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return;

    console.log('Loading documents for client folder:', folderId);
    setIsLoadingDocs(true);

    try {
      const documents = await loadDocs(accessToken, folderId);
      console.log('Loaded documents:', documents);
      
      setClientDocuments(prev => ({
        ...prev,
        [selectedClient]: documents
      }));
      
      return documents.length;
    } catch (error) {
      console.error('Error loading client documents:', error);
      toast({
        title: "שגיאה בטעינת מסמכים",
        description: "אירעה שגיאה בטעינת מסמכי הלקוח",
        variant: "destructive",
      });
      return 0;
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleDocumentUpdate = (selectedClient: string, updatedDoc: Document) => {
    if (!selectedClient) return;

    setClientDocuments(prev => ({
      ...prev,
      [selectedClient]: prev[selectedClient].map((doc) =>
        doc.id === updatedDoc.id ? { ...updatedDoc, lastModified: new Date() } : doc
      ),
    }));
  };

  return {
    clientDocuments,
    isLoadingDocs,
    loadClientDocuments,
    handleDocumentUpdate
  };
};
