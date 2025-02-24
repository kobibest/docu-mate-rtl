import { v4 as uuidv4 } from 'uuid';
import { Client, Document } from '@/types';
import { listFolderContents, setFolderPermissions } from './googleDrive';

export const createClientFolder = async (accessToken: string, parentFolderId: string, clientName: string): Promise<string> => {
  try {
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: clientName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId]
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create client folder: ${response.statusText}`);
    }

    const data = await response.json();
    
    // הגדרת הרשאות לתיקיית הלקוח
    await setFolderPermissions(accessToken, data.id);
    
    return data.id;
  } catch (error) {
    console.error('Error creating client folder:', error);
    throw error;
  }
};

export const loadExistingClients = async (accessToken: string, parentFolderId: string): Promise<Client[]> => {
  try {
    const files = await listFolderContents(accessToken, parentFolderId);
    console.log('Files before filtering:', files);
    
    // נסנן רק תיקיות
    const folders = files.filter(file => file.mimeType === 'application/vnd.google-apps.folder');
    console.log('Folders after filtering:', folders);
    
    // לכל תיקייה, נטען את מספר המסמכים בה
    const clientsWithDocuments = await Promise.all(folders.map(async folder => {
      const folderContents = await listFolderContents(accessToken, folder.id);
      const documentCount = folderContents.filter(file => file.mimeType !== 'application/vnd.google-apps.folder').length;
      
      return {
        id: uuidv4(),
        name: folder.name,
        documentCount,
        folderId: folder.id
      };
    }));

    return clientsWithDocuments;
  } catch (error) {
    console.error('Error loading existing clients:', error);
    throw error;
  }
};

export const updateDocumentInDrive = async (accessToken: string, document: Document): Promise<void> => {
  try {
    // מכין את המידע שיישמר בתיאור הקובץ
    const documentMetadata = {
      description: document.description,
      type: document.type,
      // אפשר להוסיף כאן שדות נוספים בעתיד
    };

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${document.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: JSON.stringify(documentMetadata)
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    console.log('Document metadata updated successfully');
  } catch (error) {
    console.error('Error updating document metadata:', error);
    throw error;
  }
};

export const loadClientDocuments = async (accessToken: string, folderId: string): Promise<Document[]> => {
  try {
    console.log('Loading documents from folder:', folderId);
    const files = await listFolderContents(accessToken, folderId);
    console.log('Documents from API:', files);

    // נסנן רק קבצים (לא תיקיות) ונמפה אותם למבנה הנדרש
    return files
      .filter(file => file.mimeType !== 'application/vnd.google-apps.folder')
      .map(file => {
        let description = '';
        let type: Document['type'] = 'bank_statement'; // ברירת מחדל
        
        // מנסה לפענח את המטא-דאטה מהתיאור
        if (file.description) {
          try {
            const metadata = JSON.parse(file.description);
            description = metadata.description || '';
            type = metadata.type || 'bank_statement';
          } catch (e) {
            console.warn('Could not parse document metadata:', e);
            // אם יש שגיאה בפענוח, נשתמש בתיאור המקורי
            description = file.description;
          }
        }

        return {
          id: file.id,
          fileName: file.name,
          description,
          type,
          thumbnail: file.thumbnailLink || file.iconLink || '/placeholder.svg',
          uploadDate: new Date(file.createdTime),
          lastModified: new Date(file.modifiedTime)
        };
      });
  } catch (error) {
    console.error('Error loading client documents:', error);
    throw error;
  }
};

export const createNewClient = async (
  accessToken: string, 
  parentFolderId: string, 
  clientName: string
): Promise<Client> => {
  const folderId = await createClientFolder(accessToken, parentFolderId, clientName);
  return {
    id: uuidv4(),
    name: clientName,
    documentCount: 0,
    folderId
  };
};
