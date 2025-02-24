
export const createRootFolder = async (accessToken: string) => {
  try {
    // בדיקה האם התיקייה כבר קיימת
    const existingFolder = await searchFolder(accessToken, 'brokerApp');
    if (existingFolder) {
      console.log('Root folder already exists:', existingFolder);
      return existingFolder;
    }

    // מדפיס את ה-token לצורך דיבוג (רק את התחלה וסוף)
    const tokenStart = accessToken.substring(0, 10);
    const tokenEnd = accessToken.substring(accessToken.length - 10);
    console.log(`Using token: ${tokenStart}...${tokenEnd}`);

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

    const responseText = await response.text(); // קודם נקרא את התוכן כטקסט
    console.log('Full response:', responseText);

    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let errorMessage = `Failed to create folder (Status: ${response.status})`;
      try {
        const errorData = JSON.parse(responseText);
        console.error('Parsed error data:', errorData);
        if (errorData.error && errorData.error.message) {
          errorMessage += `: ${errorData.error.message}`;
        }
      } catch (e) {
        console.error('Could not parse error response as JSON:', e);
      }
      
      throw new Error(errorMessage);
    }

    const folder = JSON.parse(responseText);
    console.log('Created root folder:', folder);
    return folder;
  } catch (error) {
    console.error('Detailed error in createRootFolder:', error);
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

    const responseText = await response.text();
    console.log('Search response text:', responseText);

    if (!response.ok) {
      console.error('Search response status:', response.status);
      console.error('Search response status text:', response.statusText);
      let errorMessage = `Failed to search for folder (Status: ${response.status})`;
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error && errorData.error.message) {
          errorMessage += `: ${errorData.error.message}`;
        }
      } catch (e) {
        console.error('Could not parse search error response as JSON:', e);
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    console.log('Search folder response:', data);
    return data.files?.[0] || null;
  } catch (error) {
    console.error('Detailed error in searchFolder:', error);
    throw error;
  }
};
