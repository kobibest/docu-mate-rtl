
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
  console.log('File blob:', blob);
  console.log('File type:', blob.type);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      console.log('Base64 string length:', base64String.length);
      // נוודא שאנחנו מקבלים רק את החלק של ה-base64 בלי המטא-דאטה
      const base64Content = base64String.split(',')[1] || base64String;
      console.log('Extracted base64 length:', base64Content.length);
      resolve(base64Content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
};

export const analyzeDocument = async (document: Document): Promise<any> => {
  try {
    // קבלת תוכן הקובץ ב-base64
    const base64Content = await getFileContent(document.id);
    console.log('Sending document with name:', document.fileName);
    console.log('File ID:', document.id);
    
    const requestBody = {
      document: {
        file: {
          contents: base64Content,
          filename: document.fileName,
          contentType: document.fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
        }
      }
    };

    console.log('Request body structure:', {
      document: {
        file: {
          ...requestBody.document.file,
          contents: `${base64Content.substring(0, 100)}... (truncated)`,
          contentLength: base64Content.length
        }
      }
    });
    
    // העלאת המסמך
    const uploadResponse = await fetch(`${BASE_URL}/document`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('Upload error details:', errorData);
      console.error('Upload error status:', uploadResponse.status);
      console.error('Upload error statusText:', uploadResponse.statusText);
      throw new Error(`שגיאה בהעלאת המסמך: ${JSON.stringify(errorData)}`);
    }

    const { documentId, jobId } = await uploadResponse.json();
    console.log('Document uploaded successfully. Document ID:', documentId, 'Job ID:', jobId);

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
      console.log('Processing status:', status);
      
      if (status === 'error') {
        throw new Error('שגיאה בעיבוד המסמך');
      }
    }

    // סטנדרטיזציה של המסמך - ניסיון ראשון
    let standardizeResponse = await fetch(`${BASE_URL}/api/standardize`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        documentId: documentId,
        schemaId: 'bank_statements',  // שינוי ה-schema ל-bank_statements
        displayMode: 'auto',
        effortLevel: 'high'
      })
    });

    // אם הניסיון הראשון נכשל, ננסה נתיב חלופי
    if (!standardizeResponse.ok) {
      console.log('First standardization attempt failed, trying alternative endpoint...');
      standardizeResponse = await fetch(`${BASE_URL}/standardize`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          documentId: documentId,
          schemaId: 'bank_statements',  // שינוי ה-schema ל-bank_statements
          displayMode: 'auto',
          effortLevel: 'high'
        })
      });
    }

    if (!standardizeResponse.ok) {
      const errorData = await standardizeResponse.json();
      console.error('Standardization error details:', errorData);
      console.error('Standardization error status:', standardizeResponse.status);
      throw new Error(`שגיאה בסטנדרטיזציה של המסמך: ${JSON.stringify(errorData)}`);
    }

    const { standardizationId } = await standardizeResponse.json();
    console.log('Standardization successful. ID:', standardizationId);

    // קבלת תוצאות הניתוח
    const resultsResponse = await fetch(`${BASE_URL}/standardization/${standardizationId}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!resultsResponse.ok) {
      const errorData = await resultsResponse.json();
      console.error('Results error details:', errorData);
      throw new Error('שגיאה בקבלת תוצאות הניתוח');
    }

    return await resultsResponse.json();
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
};
