
import { 
  AnalysisResult,
  DocumentType,
  BankStatementData,
  SalarySlipData,
  IdCardData,
  IdAppendixData,
  PropertyRecordData,
  CustomerProfile
} from '@/types/documentAnalysis';
import { Document } from '@/types';

export class DocumentAnalysisService {
  private customerProfiles: Map<string, CustomerProfile> = new Map();

  analyzeDocumentResult(document: Document, rawAnalysis: any): AnalysisResult<any> {
    const analysisResult = this.parseAnalysisResult(document.type, rawAnalysis);
    this.updateCustomerProfile(document.id, analysisResult);
    return analysisResult;
  }

  private parseAnalysisResult(documentType: DocumentType, rawAnalysis: any): AnalysisResult<any> {
    switch (documentType) {
      case 'bank_statement':
        return this.parseBankStatement(rawAnalysis);
      case 'salary_slip':
        return this.parseSalarySlip(rawAnalysis);
      case 'id_card':
        return this.parseIdCard(rawAnalysis);
      case 'id_appendix':
        return this.parseIdAppendix(rawAnalysis);
      case 'property_record':
        return this.parsePropertyRecord(rawAnalysis);
      default:
        throw new Error(`Unsupported document type: ${documentType}`);
    }
  }

  private parseBankStatement(rawData: any): AnalysisResult<BankStatementData> {
    // יש להתאים את הפרסור לפורמט הספציפי שמתקבל מ-DocuPanda
    return {
      documentId: rawData.documentId,
      type: 'bank_statement',
      data: {
        accountDetails: {
          bank: rawData.data.bank,
          branch: rawData.data.branch,
          accountNumber: rawData.data.accountNumber,
          owners: rawData.data.owners,
        },
        transactions: rawData.data.transactions.map((t: any) => ({
          date: new Date(t.date),
          description: t.description,
          amount: t.amount,
          balance: t.balance,
          type: t.type,
          category: t.category,
        })),
        summary: {
          startingBalance: rawData.data.startingBalance,
          endingBalance: rawData.data.endingBalance,
          period: {
            start: new Date(rawData.data.periodStart),
            end: new Date(rawData.data.periodEnd),
          },
        },
      },
      confidence: rawData.confidence,
      analysisDate: new Date(),
    };
  }

  private parseSalarySlip(rawData: any): AnalysisResult<SalarySlipData> {
    // יש להתאים את הפרסור לפורמט הספציפי שמתקבל מ-DocuPanda
    return {
      documentId: rawData.documentId,
      type: 'salary_slip',
      data: {
        employeeDetails: {
          name: rawData.data.employeeName,
          id: rawData.data.employeeId,
          position: rawData.data.position,
          employer: rawData.data.employer,
        },
        period: {
          month: rawData.data.month,
          year: rawData.data.year,
        },
        salary: {
          gross: rawData.data.grossSalary,
          net: rawData.data.netSalary,
          deductions: rawData.data.deductions,
          additions: rawData.data.additions,
        },
      },
      confidence: rawData.confidence,
      analysisDate: new Date(),
    };
  }

  private parseIdCard(rawData: any): AnalysisResult<IdCardData> {
    // יש להתאים את הפרסור לפורמט הספציפי שמתקבל מ-DocuPanda
    return {
      documentId: rawData.documentId,
      type: 'id_card',
      data: {
        personalInfo: {
          id: rawData.data.id,
          fullName: rawData.data.fullName,
          dateOfBirth: new Date(rawData.data.dateOfBirth),
          placeOfBirth: rawData.data.placeOfBirth,
          nationality: rawData.data.nationality,
          dateIssued: new Date(rawData.data.dateIssued),
        },
      },
      confidence: rawData.confidence,
      analysisDate: new Date(),
    };
  }

  private parseIdAppendix(rawData: any): AnalysisResult<IdAppendixData> {
    // יש להתאים את הפרסור לפורמט הספציפי שמתקבל מ-DocuPanda
    return {
      documentId: rawData.documentId,
      type: 'id_appendix',
      data: {
        personalInfo: {
          id: rawData.data.id,
          address: rawData.data.address,
          familyStatus: rawData.data.familyStatus,
          children: rawData.data.children?.map((child: any) => ({
            name: child.name,
            id: child.id,
            dateOfBirth: new Date(child.dateOfBirth),
          })),
        },
      },
      confidence: rawData.confidence,
      analysisDate: new Date(),
    };
  }

  private parsePropertyRecord(rawData: any): AnalysisResult<PropertyRecordData> {
    // יש להתאים את הפרסור לפורמט הספציפי שמתקבל מ-DocuPanda
    return {
      documentId: rawData.documentId,
      type: 'property_record',
      data: {
        propertyDetails: {
          blockNumber: rawData.data.blockNumber,
          parcelNumber: rawData.data.parcelNumber,
          subParcelNumber: rawData.data.subParcelNumber,
          address: rawData.data.address,
          area: rawData.data.area,
          type: rawData.data.propertyType,
        },
        ownership: {
          owners: rawData.data.owners.map((owner: any) => ({
            name: owner.name,
            id: owner.id,
            share: owner.share,
          })),
          mortgages: rawData.data.mortgages?.map((mortgage: any) => ({
            bank: mortgage.bank,
            amount: mortgage.amount,
            date: new Date(mortgage.date),
          })),
          liens: rawData.data.liens?.map((lien: any) => ({
            type: lien.type,
            beneficiary: lien.beneficiary,
            date: new Date(lien.date),
          })),
        },
      },
      confidence: rawData.confidence,
      analysisDate: new Date(),
    };
  }

  private updateCustomerProfile(documentId: string, analysis: AnalysisResult<any>) {
    // זיהוי הלקוח מהמסמך
    let customerId: string | undefined;
    
    switch (analysis.type) {
      case 'id_card':
        customerId = (analysis.data as IdCardData).personalInfo.id;
        break;
      case 'salary_slip':
        customerId = (analysis.data as SalarySlipData).employeeDetails.id;
        break;
      // הוסף זיהוי עבור סוגי מסמכים נוספים
    }

    if (!customerId) return;

    // יצירה או עדכון של פרופיל הלקוח
    let profile = this.customerProfiles.get(customerId) || {
      personalInfo: { id: customerId, fullName: '' },
    };

    // עדכון הפרופיל בהתאם לסוג המסמך
    switch (analysis.type) {
      case 'id_card':
        this.updateProfileFromIdCard(profile, analysis.data as IdCardData);
        break;
      case 'salary_slip':
        this.updateProfileFromSalarySlip(profile, analysis.data as SalarySlipData);
        break;
      case 'bank_statement':
        this.updateProfileFromBankStatement(profile, analysis.data as BankStatementData);
        break;
      case 'property_record':
        this.updateProfileFromPropertyRecord(profile, analysis.data as PropertyRecordData);
        break;
      // הוסף עדכונים עבור סוגי מסמכים נוספים
    }

    this.customerProfiles.set(customerId, profile);
  }

  private updateProfileFromIdCard(profile: CustomerProfile, data: IdCardData) {
    profile.personalInfo = {
      ...profile.personalInfo,
      ...data.personalInfo,
    };
  }

  private updateProfileFromSalarySlip(profile: CustomerProfile, data: SalarySlipData) {
    if (!profile.financialInfo) {
      profile.financialInfo = {
        bankAccounts: [],
        employmentHistory: [],
      };
    }

    // עדכון או הוספת מידע תעסוקתי
    const existingEmployer = profile.financialInfo.employmentHistory.find(
      emp => emp.employer === data.employeeDetails.employer
    );

    if (existingEmployer) {
      existingEmployer.position = data.employeeDetails.position;
      existingEmployer.lastKnownSalary = {
        gross: data.salary.gross,
        net: data.salary.net,
        date: new Date(),
      };
    } else {
      profile.financialInfo.employmentHistory.push({
        employer: data.employeeDetails.employer,
        position: data.employeeDetails.position,
        lastKnownSalary: {
          gross: data.salary.gross,
          net: data.salary.net,
          date: new Date(),
        },
      });
    }
  }

  private updateProfileFromBankStatement(profile: CustomerProfile, data: BankStatementData) {
    if (!profile.financialInfo) {
      profile.financialInfo = {
        bankAccounts: [],
        employmentHistory: [],
      };
    }

    // עדכון או הוספת חשבון בנק
    const existingAccount = profile.financialInfo.bankAccounts.find(
      acc => acc.accountNumber === data.accountDetails.accountNumber
    );

    if (existingAccount) {
      existingAccount.lastKnownBalance = data.summary.endingBalance;
    } else {
      profile.financialInfo.bankAccounts.push({
        bank: data.accountDetails.bank,
        branch: data.accountDetails.branch,
        accountNumber: data.accountDetails.accountNumber,
        lastKnownBalance: data.summary.endingBalance,
      });
    }
  }

  private updateProfileFromPropertyRecord(profile: CustomerProfile, data: PropertyRecordData) {
    if (!profile.assets) {
      profile.assets = {
        properties: [],
      };
    }

    // הוספת נכס לרשימת הנכסים
    const property = {
      address: data.propertyDetails.address,
      share: data.ownership.owners.find(owner => owner.id === profile.personalInfo.id)?.share || '0',
      mortgages: data.ownership.mortgages,
    };

    profile.assets.properties.push(property);
  }

  getCustomerProfile(customerId: string): CustomerProfile | undefined {
    return this.customerProfiles.get(customerId);
  }

  getAllCustomerProfiles(): CustomerProfile[] {
    return Array.from(this.customerProfiles.values());
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
