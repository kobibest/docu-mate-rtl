
import { Client, Document } from '@/types';

export const clients: Client[] = [
  {
    id: '1',
    name: 'ישראל ישראלי',
    documentCount: 3,
  },
  {
    id: '2',
    name: 'חיים כהן',
    documentCount: 2,
  },
  {
    id: '3',
    name: 'שרה לוי',
    documentCount: 4,
  },
];

export const documents: { [key: string]: Document[] } = {
  '1': [
    {
      id: '1',
      fileName: 'תדפיס חשבון ינואר',
      description: 'תדפיס עו"ש לחודש ינואר 2024',
      type: 'bank_statement',
      lastModified: new Date('2024-01-15'),
    },
    {
      id: '2',
      fileName: 'תלוש משכורת דצמבר',
      description: 'תלוש משכורת לחודש דצמבר 2023',
      type: 'salary_slip',
      lastModified: new Date('2024-01-01'),
    },
  ],
};

export const documentTypes = {
  bank_statement: 'תדפיס עו"ש',
  salary_slip: 'תלוש משכורת',
  property_record: 'נסח טאבו',
};
