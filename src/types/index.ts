
export interface Client {
  id: string;
  name: string;
  documentCount: number;
  folderId: string;
}

export interface Document {
  id: string;
  fileName: string;
  description: string;
  type: 'bank_statement' | 'salary_slip' | 'id_card' | 'id_appendix' | 'property_record';
  thumbnail: string;
  uploadDate: Date;
  lastModified: Date;
  base64Content?: string;
  analysisResults?: any;
  folderId: string;  // הוספנו את שדה ה-folderId
}
