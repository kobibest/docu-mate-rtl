
import { Document } from '@/types';
import { documentTypes } from '@/data/mockData';
import { format } from 'date-fns';
import DocumentUploader from './DocumentUploader';
import { updateDocumentInDrive } from '@/services/driveClientService';
import { analyzeDocument } from '@/services/docuPandaService';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface DocumentGridProps {
  documents: Document[];
  onDocumentUpdate: (document: Document) => void;
  selectedClientFolderId: string;
  onUploadComplete: () => void;
}

const DocumentGrid = ({ documents, onDocumentUpdate, selectedClientFolderId, onUploadComplete }: DocumentGridProps) => {
  const { toast } = useToast();
  const [localDocuments, setLocalDocuments] = useState<{ [key: string]: { description: string } }>({});
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  
  const handleDocumentUpdate = async (updatedDoc: Document) => {
    try {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      await updateDocumentInDrive(accessToken, updatedDoc);
      onDocumentUpdate(updatedDoc);

    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "שגיאה בעדכון המסמך",
        description: "אירעה שגיאה בעדכון פרטי המסמך",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeDocument = async (doc: Document) => {
    try {
      setAnalyzingDocId(doc.id);
      const results = await analyzeDocument(doc);
      
      const updatedDoc = {
        ...doc,
        analysisResults: results,
        description: doc.description + '\n\nתוצאות ניתוח:\n' + JSON.stringify(results.data, null, 2)
      };
      
      handleDocumentUpdate(updatedDoc);
      
      toast({
        title: "הניתוח הושלם בהצלחה",
        description: "המסמך נותח בהצלחה והתיאור עודכן",
      });
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast({
        title: "שגיאה בניתוח המסמך",
        description: error instanceof Error ? error.message : "אירעה שגיאה בניתוח המסמך",
        variant: "destructive",
      });
    } finally {
      setAnalyzingDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      <DocumentUploader 
        folderId={selectedClientFolderId} 
        onUploadComplete={onUploadComplete}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="glass rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 border border-gray-700/50 hover:border-blue-500/30 group"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start space-x-4 space-x-reverse w-full">
                  <img
                    src={doc.thumbnail}
                    alt={doc.fileName}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300"
                  />
                  <div className="flex-1 min-w-0">
                    <input
                      className="w-full text-lg font-medium bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-all duration-300"
                      value={doc.fileName}
                      onChange={(e) =>
                        handleDocumentUpdate({ ...doc, fileName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleAnalyzeDocument(doc)}
                  disabled={analyzingDocId === doc.id}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-blue-600/20"
                >
                  {analyzingDocId === doc.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'נתח'
                  )}
                </button>
              </div>
              <select
                className="w-full bg-white/5 border border-gray-700/50 rounded-lg px-4 py-2 transition-all duration-300 focus:border-blue-500/50"
                value={doc.type}
                onChange={(e) =>
                  handleDocumentUpdate({ ...doc, type: e.target.value as Document['type'] })
                }
              >
                {Object.entries(documentTypes).map(([value, label]) => (
                  <option key={value} value={value} className="bg-gray-900">
                    {label}
                  </option>
                ))}
              </select>
              <textarea
                className="w-full min-h-[100px] bg-white/5 border border-gray-700/50 rounded-lg px-4 py-2 resize-y transition-all duration-300 focus:border-blue-500/50"
                value={localDocuments[doc.id]?.description ?? doc.description}
                onChange={(e) => setLocalDocuments(prev => ({
                  ...prev,
                  [doc.id]: { ...prev[doc.id], description: e.target.value }
                }))}
                onBlur={() => {
                  const localDoc = localDocuments[doc.id];
                  if (localDoc && localDoc.description !== doc.description) {
                    handleDocumentUpdate({ ...doc, description: localDoc.description });
                  }
                }}
              />
              <div className="text-sm text-gray-400 space-y-1">
                <div>הועלה: {format(doc.uploadDate, 'dd/MM/yyyy')}</div>
                <div>עודכן: {format(doc.lastModified, 'dd/MM/yyyy')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentGrid;
