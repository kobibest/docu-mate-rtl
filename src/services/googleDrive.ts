
export const createRootFolder = async (accessToken: string) => {
  try {
    // בדיקה האם התיקייה כבר קיימת
    const existingFolder = await searchFolder(accessToken, 'brokerApp');
    if (existingFolder) {
      console.log('Root folder already exists:', existingFolder);
      return existingFolder;
    }

    // יצירת תיקייה חדשה
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'brokerApp',
        mimeType: 'application/vnd.google-apps.folder'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create folder: ${response.statusText}`);
    }

    const folder = await response.json();
    console.log('Created root folder:', folder);
    return folder;
  } catch (error) {
    console.error('Error in createRootFolder:', error);
    throw error;
  }
};

export const searchFolder = async (accessToken: string, folderName: string) => {
  try {
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search for folder: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files?.[0] || null;
  } catch (error) {
    console.error('Error in searchFolder:', error);
    throw error;
  }
};

export const listFolderContents = async (accessToken: string, folderId: string) => {
  try {
    const query = `'${folderId}' in parents and trashed=false`;
    const fields = 'files(id,name,description,mimeType,thumbnailLink,createdTime,modifiedTime)';
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list folder contents: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Folder contents:', data); // נוסיף לוג לבדיקה
    return data.files || [];
  } catch (error) {
    console.error('Error listing folder contents:', error);
    throw error;
  }
};
