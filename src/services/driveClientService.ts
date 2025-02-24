
import { v4 as uuidv4 } from 'uuid';
import { Client, Document } from '@/types';
import { listFolderContents } from './googleDrive';

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
    
    // נשנה את הסינון כך שנקבל רק תיקיות
    const folders = files.filter(file => file.mimeType === 'application/vnd.google-apps.folder');
    console.log('Folders after filtering:', folders);
    
    return folders.map(folder => ({
      id: uuidv4(),
      name: folder.name,
      documentCount: 0,
      folderId: folder.id
    }));
  } catch (error) {
    console.error('Error loading existing clients:', error);
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

export const loadClientDocuments = async (accessToken: string, folderId: string): Promise<Document[]> => {
  try {
    console.log('Loading documents from folder:', folderId);
    const files = await listFolderContents(accessToken, folderId);
    console.log('Documents from API:', files);

    return files
      .filter(file => file.mimeType !== 'application/vnd.google-apps.folder')
      .map(file => ({
        id: file.id,
        fileName: file.name,
        description: file.description || '',
        type: 'bank_statement', // ברירת מחדל
        thumbnail: file.thumbnailLink || file.iconLink || '/placeholder.svg',
        uploadDate: new Date(file.createdTime),
        lastModified: new Date(file.modifiedTime)
      }));
  } catch (error) {
    console.error('Error loading client documents:', error);
    throw error;
  }
};
