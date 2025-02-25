
import { Document } from '@/types';
import { 
  AnalysisResult,
  DocumentType,
} from '@/types/documentAnalysis';

const ANALYSIS_FILE_NAME = 'document_analysis.json';

export class DocumentAnalysisService {
  async saveAnalysisResult(
    accessToken: string, 
    clientFolderId: string, 
    document: Document, 
    analysisResult: any
  ) {
    try {
      // קודם נבדוק אם כבר קיים קובץ ניתוח
      const existingFile = await this.findAnalysisFile(accessToken, clientFolderId);
      let currentAnalysis = {};
      
      if (existingFile) {
        // אם קיים קובץ, נקרא אותו
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.ok) {
          currentAnalysis = await response.json();
        }
      }

      // נוסיף את התוצאה החדשה
      const updatedAnalysis = {
        ...currentAnalysis,
        [document.id]: {
          documentId: document.id,
          fileName: document.fileName,
          type: document.type,
          analysisDate: new Date().toISOString(),
          results: analysisResult
        }
      };

      const metadata = {
        name: ANALYSIS_FILE_NAME,
        mimeType: 'application/json',
        parents: existingFile ? undefined : [clientFolderId],
      };

      if (existingFile) {
        // עדכון הקובץ הקיים
        await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedAnalysis),
          }
        );
      } else {
        // יצירת קובץ חדש
        const createResponse = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/related; boundary=boundary',
            },
            body: this.createMultipartBody(metadata, updatedAnalysis),
          }
        );

        if (!createResponse.ok) {
          throw new Error('Failed to create analysis file');
        }
      }

      return updatedAnalysis[document.id];
    } catch (error) {
      console.error('Error saving analysis result:', error);
      throw error;
    }
  }

  private createMultipartBody(metadata: any, data: any): string {
    const boundary = 'boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = 
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata);

    const dataPart = 
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(data);

    return delimiter + metadataPart + delimiter + dataPart + closeDelimiter;
  }

  private async findAnalysisFile(accessToken: string, folderId: string) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          `name='${ANALYSIS_FILE_NAME}' and '${folderId}' in parents and trashed=false`
        )}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search for analysis file');
      }

      const data = await response.json();
      return data.files?.[0];
    } catch (error) {
      console.error('Error finding analysis file:', error);
      throw error;
    }
  }

  async loadAnalysisResults(accessToken: string, clientFolderId: string) {
    try {
      const file = await this.findAnalysisFile(accessToken, clientFolderId);
      if (!file) return {};

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load analysis results');
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading analysis results:', error);
      throw error;
    }
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
