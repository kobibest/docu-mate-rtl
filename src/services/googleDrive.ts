
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
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: 'brokerApp',
        mimeType: 'application/vnd.google-apps.folder',
        fields: 'id,name',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from Google Drive:', errorData);
      throw new Error(`Failed to create root folder: ${response.status} ${response.statusText}`);
    }

    const folder = await response.json();
    console.log('Created root folder:', folder);
    return folder;
  } catch (error) {
    console.error('Error creating root folder:', error);
    throw error;
  }
};

export const searchFolder = async (accessToken: string, folderName: string) => {
  try {
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from Google Drive:', errorData);
      throw new Error(`Failed to search for folder: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Search folder response:', data);
    return data.files?.[0] || null;
  } catch (error) {
    console.error('Error searching for folder:', error);
    throw error;
  }
};
