
import { useState } from 'react';
import { Document } from '@/types';
import { loadClientDocuments as loadDocs } from '@/services/driveClientService';
import { documentAnalysisService } from '@/services/documentAnalysisService';
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
      
      // טעינת תוצאות הניתוח
      const analysisResults = await documentAnalysisService.loadAnalysisResults(accessToken, folderId);
      
      // הוספת תוצאות הניתוח למסמכים
      const documentsWithAnalysis = documents.map(doc => ({
        ...doc,
        folderId, // הוספת ה-folderId לכל מסמך
        analysisResults: analysisResults[doc.id]?.results
      }));
      
      setClientDocuments(prev => ({
        ...prev,
        [selectedClient]: documentsWithAnalysis
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

  const handleDocumentUpdate = async (selectedClient: string, updatedDoc: Document) => {
    if (!selectedClient) return;

    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return;

    // אם יש תוצאות ניתוח, נשמור אותן
    if (updatedDoc.analysisResults) {
      try {
        await documentAnalysisService.saveAnalysisResult(
          accessToken,
          updatedDoc.folderId, // שימוש ב-folderId מהמסמך עצמו
          updatedDoc,
          updatedDoc.analysisResults
        );
      } catch (error) {
        console.error('Error saving analysis results:', error);
        toast({
          title: "שגיאה בשמירת תוצאות הניתוח",
          description: "אירעה שגיאה בשמירת תוצאות הניתוח",
          variant: "destructive",
        });
      }
    }

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
