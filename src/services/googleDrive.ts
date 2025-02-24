
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

    if (response.status === 401) {
      localStorage.removeItem('google_access_token');
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      throw new Error(`Failed to create folder: ${response.statusText}`);
    }

    const folder = await response.json();
    console.log('Created root folder:', folder);

    // הגדרת הרשאות לתיקייה החדשה
    await setFolderPermissions(accessToken, folder.id);

    return folder;
  } catch (error) {
    console.error('Error in createRootFolder:', error);
    throw error;
  }
};

export const setFolderPermissions = async (accessToken: string, folderId: string) => {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'writer',
        type: 'user',
        emailAddress: localStorage.getItem('user_email'),
      }),
    });

    if (response.status === 401) {
      localStorage.removeItem('google_access_token');
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      throw new Error(`Failed to set folder permissions: ${response.statusText}`);
    }

    console.log('Successfully set folder permissions');
    return await response.json();
  } catch (error) {
    console.error('Error setting folder permissions:', error);
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

    if (response.status === 401) {
      localStorage.removeItem('google_access_token');
      throw new Error('UNAUTHORIZED');
    }

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
    if (!folderId) {
      console.log('No folder ID provided');
      return [];
    }

    const query = `'${folderId}' in parents and trashed=false`;
    
    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.append('q', query);
    url.searchParams.append('fields', '*');
    url.searchParams.append('pageSize', '1000');
    url.searchParams.append('includeItemsFromAllDrives', 'true');
    url.searchParams.append('supportsAllDrives', 'true');
    url.searchParams.append('corpora', 'user');
    url.searchParams.append('spaces', 'drive');
    
    console.log('Fetching from URL:', url.toString());
    console.log('Using folder ID:', folderId);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('root_folder_id');
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Failed to list folder contents: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response Status:', response.status);
    console.log('Full API response:', JSON.stringify(data, null, 2));
    
    if (!data.files || !Array.isArray(data.files)) {
      console.error('Invalid response format - expected files array:', data);
      return [];
    }

    return data.files;
  } catch (error) {
    console.error('Error listing folder contents:', error);
    throw error;
  }
};

export const uploadFile = async (accessToken: string, folderId: string, file: File) => {
  try {
    console.log('Starting file upload to folder:', folderId);
    
    // Step 1: Get upload URL
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        parents: [folderId]
      }),
    });

    if (response.status === 401) {
      localStorage.removeItem('google_access_token');
      throw new Error('UNAUTHORIZED');
    }

    if (!response.ok) {
      console.error('Failed to get upload URL:', response.statusText);
      throw new Error('Failed to initiate upload');
    }

    const uploadUrl = response.headers.get('Location');
    if (!uploadUrl) {
      console.error('No upload URL received in response headers');
      throw new Error('No upload URL received');
    }

    console.log('Got upload URL:', uploadUrl);

    // Step 2: Upload the file
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      console.error('Failed to upload file:', uploadResponse.statusText);
      throw new Error('Failed to upload file');
    }

    const result = await uploadResponse.json();
    console.log('File uploaded successfully:', result);
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
