
// טיפוסים בסיסיים משותפים
export interface AnalysisResult<T> {
  documentId: string;
  type: DocumentType;
  data: T;
  confidence: number;
  analysisDate: Date;
}

export type DocumentType = 'bank_statement' | 'salary_slip' | 'id_card' | 'id_appendix' | 'property_record';

// תדפיס בנק
export interface BankStatementData {
  accountDetails: {
    bank: string;
    branch: string;
    accountNumber: string;
    owners: string[];
  };
  transactions: Transaction[];
  summary: {
    startingBalance: number;
    endingBalance: number;
    period: {
      start: Date;
      end: Date;
    };
  };
}

export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  balance: number;
  type: 'credit' | 'debit';
  category?: string;
}

// תלוש שכר
export interface SalarySlipData {
  employeeDetails: {
    name: string;
    id: string;
    position: string;
    employer: string;
  };
  period: {
    month: number;
    year: number;
  };
  salary: {
    gross: number;
    net: number;
    deductions: Deduction[];
    additions: Addition[];
  };
}

export interface Deduction {
  type: string;
  amount: number;
}

export interface Addition {
  type: string;
  amount: number;
}

// תעודת זהות
export interface IdCardData {
  personalInfo: {
    id: string;
    fullName: string;
    dateOfBirth: Date;
    placeOfBirth: string;
    nationality: string;
    dateIssued: Date;
  };
}

// ספח תעודת זהות
export interface IdAppendixData {
  personalInfo: {
    id: string;
    address: string;
    familyStatus: string;
    children?: {
      name: string;
      id: string;
      dateOfBirth: Date;
    }[];
  };
}

// נסח טאבו
export interface PropertyRecordData {
  propertyDetails: {
    blockNumber: string;
    parcelNumber: string;
    subParcelNumber?: string;
    address: string;
    area: number;
    type: string;
  };
  ownership: {
    owners: {
      name: string;
      id: string;
      share: string;
    }[];
    mortgages?: {
      bank: string;
      amount: number;
      date: Date;
    }[];
    liens?: {
      type: string;
      beneficiary: string;
      date: Date;
    }[];
  };
}

export interface CustomerProfile {
  personalInfo: {
    id: string;
    fullName: string;
    dateOfBirth?: Date;
    address?: string;
    familyStatus?: string;
  };
  financialInfo?: {
    bankAccounts: {
      bank: string;
      branch: string;
      accountNumber: string;
      lastKnownBalance?: number;
    }[];
    employmentHistory: {
      employer: string;
      position: string;
      lastKnownSalary?: {
        gross: number;
        net: number;
        date: Date;
      };
    }[];
  };
  assets?: {
    properties: {
      address: string;
      share: string;
      estimatedValue?: number;
      mortgages?: {
        bank: string;
        amount: number;
        date: Date;
      }[];
    }[];
  };
}
