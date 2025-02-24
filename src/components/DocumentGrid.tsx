
import { Document } from '@/types';
import { documentTypes } from '@/data/mockData';
import { format } from 'date-fns';
import DocumentUploader from './DocumentUploader';
import { updateDocumentInDrive } from '@/services/driveClientService';
import { useToast } from "./ui/use-toast";
import { useState } from 'react';

interface DocumentGridProps {
  documents: Document[];
  onDocumentUpdate: (document: Document) => void;
  selectedClientFolderId: string;
  onUploadComplete: () => void;
}

const DocumentGrid = ({ documents, onDocumentUpdate, selectedClientFolderId, onUploadComplete }: DocumentGridProps) => {
  const { toast } = useToast();
  const [localDocuments, setLocalDocuments] = useState<{ [key: string]: { description: string } }>({});
  
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

  const handleTypeChange = (doc: Document, newType: Document['type']) => {
    handleDocumentUpdate({ ...doc, type: newType });
  };

  const handleDescriptionChange = (doc: Document, newDescription: string) => {
    // עדכון מקומי של התיאור
    setLocalDocuments(prev => ({
      ...prev,
      [doc.id]: { ...prev[doc.id], description: newDescription }
    }));
  };

  const handleDescriptionBlur = (doc: Document) => {
    // שליחה לשרת רק כשהמשתמש מסיים להקליד (עוזב את השדה)
    const localDoc = localDocuments[doc.id];
    if (localDoc && localDoc.description !== doc.description) {
      handleDocumentUpdate({ ...doc, description: localDoc.description });
    }
  };

  return (
    <div>
      <DocumentUploader 
        folderId={selectedClientFolderId} 
        onUploadComplete={onUploadComplete}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg shadow-md p-4 transition-all duration-200 hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-start space-x-4 space-x-reverse">
                <img
                  src={doc.thumbnail}
                  alt={doc.fileName}
                  className="w-16 h-16 object-cover rounded border border-gray-200"
                />
                <div className="flex-1">
                  <input
                    className="w-full text-lg font-medium bg-transparent border-0 focus:ring-2 focus:ring-blue-500 rounded p-1"
                    value={doc.fileName}
                    onChange={(e) =>
                      handleDocumentUpdate({ ...doc, fileName: e.target.value })
                    }
                  />
                </div>
              </div>
              <select
                className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
                value={doc.type}
                onChange={(e) =>
                  handleTypeChange(doc, e.target.value as Document['type'])
                }
              >
                {Object.entries(documentTypes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <textarea
                className="w-full min-h-[80px] bg-gray-50 border border-gray-300 rounded-md px-3 py-2"
                value={localDocuments[doc.id]?.description ?? doc.description}
                onChange={(e) => handleDescriptionChange(doc, e.target.value)}
                onBlur={() => handleDescriptionBlur(doc)}
              />
              <div className="text-sm text-gray-600 space-y-1 text-right">
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
