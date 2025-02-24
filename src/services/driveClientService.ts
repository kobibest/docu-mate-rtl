
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@/types';

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
    folderId // שמירת מזהה התיקייה לשימוש בהמשך
  };
};
