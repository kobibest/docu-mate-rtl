
import { toast } from '@/hooks/use-toast';
import { Document } from '@/types';

const BASE_URL = 'https://app.docupanda.io';
const API_KEY = 'YOUR_API_KEY'; // TODO: להחליף במפתח אמיתי

export const analyzeDocument = async (document: Document): Promise<any> => {
  try {
    // העלאת המסמך
    const uploadResponse = await fetch(`${BASE_URL}/document`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        content: document.base64Content, // נצטרך להוסיף את זה למודל
        filename: document.fileName
      })
    });

    if (!uploadResponse.ok) {
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
        schemaId: 'mortgage_documents', // להתאים לסכמה הנכונה
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
