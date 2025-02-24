
import { toast } from '@/hooks/use-toast';
import { Document } from '@/types';

const BASE_URL = 'https://app.docupanda.io';
const API_KEY = 'uqQPr9Id1rW4x3JkMRwyp3rk5gL2';

const getFileContent = async (fileId: string): Promise<string> => {
  const accessToken = localStorage.getItem('google_access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  // קבלת הקובץ מ-Google Drive
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch file content');
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string)?.split(',')[1] || '';
      resolve(base64data);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
};

export const analyzeDocument = async (document: Document): Promise<any> => {
  try {
    // קבלת תוכן הקובץ ב-base64
    const base64Content = await getFileContent(document.id);
    
    // העלאת המסמך
    const uploadResponse = await fetch(`${BASE_URL}/document`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        content: base64Content,
        filename: document.fileName
      })
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      console.error('Upload error details:', errorData);
      throw new Error('שגיאה בהעלאת המסמך');
    }

    const { documentId, jobId } = await uploadResponse.json();

    // המתנה לסיום עיבוד המסמך
    let status = 'processing';
    while (status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // המתנה של 2 שניות
      
      const statusResponse = await fetch(`${BASE_URL}/job/${jobId}`, {
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('שגיאה בבדיקת סטטוס העיבוד');
      }
      
      const statusData = await statusResponse.json();
      status = statusData.status;
      
      if (status === 'error') {
        throw new Error('שגיאה בעיבוד המסמך');
      }
    }

    // סטנדרטיזציה של המסמך
    const standardizeResponse = await fetch(`${BASE_URL}/v2/standardize/batch`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        documentIds: [documentId],
        schemaId: 'mortgage_documents',
        displayMode: 'auto',
        effortLevel: 'high'
      })
    });

    if (!standardizeResponse.ok) {
      throw new Error('שגיאה בסטנדרטיזציה של המסמך');
    }

    const { standardizationIds } = await standardizeResponse.json();

    // קבלת תוצאות הניתוח
    const resultsResponse = await fetch(`${BASE_URL}/standardization/${standardizationIds[0]}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!resultsResponse.ok) {
      throw new Error('שגיאה בקבלת תוצאות הניתוח');
    }

    return await resultsResponse.json();
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
};
