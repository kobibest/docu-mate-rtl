
import { Client, Document } from '@/types';

export const clients: Client[] = [
  {
    id: '1',
    name: 'ישראל ישראלי',
    documentCount: 3,
    folderId: 'mock-folder-1'
  },
  {
    id: '2',
    name: 'חיים כהן',
    documentCount: 2,
    folderId: 'mock-folder-2'
  },
  {
    id: '3',
    name: 'שרה לוי',
    documentCount: 4,
    folderId: 'mock-folder-3'
  },
];

export const documents: { [key: string]: Document[] } = {
  '1': [
    {
      id: '1',
      fileName: 'תדפיס חשבון ינואר',
      description: 'תדפיס עו"ש לחודש ינואר 2024',
      type: 'bank_statement',
      thumbnail: '/placeholder.svg',
      uploadDate: new Date('2024-01-10'),
      lastModified: new Date('2024-01-15'),
      folderId: 'mock-folder-1'  // הוספנו את שדה ה-folderId
    },
    {
      id: '2',
      fileName: 'תלוש משכורת דצמבר',
      description: 'תלוש משכורת לחודש דצמבר 2023',
      type: 'salary_slip',
      thumbnail: '/placeholder.svg',
      uploadDate: new Date('2023-12-31'),
      lastModified: new Date('2024-01-01'),
      folderId: 'mock-folder-1'  // הוספנו את שדה ה-folderId
    },
  ],
};

export const documentTypes = {
  bank_statement: 'תדפיס עו"ש',
  salary_slip: 'תלוש שכר',
  id_card: 'תעודת זהות',
  id_appendix: 'ספח תעודת זהות',
  property_record: 'נסח טאבו',
};
