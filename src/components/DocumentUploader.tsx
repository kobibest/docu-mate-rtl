
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadFile } from '@/services/googleDrive';
import { useToast } from "@/components/ui/use-toast";

interface DocumentUploaderProps {
  folderId: string;
  onUploadComplete: () => void;
}

const DocumentUploader = ({ folderId, onUploadComplete }: DocumentUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) {
      toast({
        title: "שגיאה",
        description: "לא נמצא טוקן גישה. אנא התחבר מחדש.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFile(accessToken, folderId, files[i]);
      }
      
      toast({
        title: "הקבצים הועלו בהצלחה",
        description: `${files.length} קבצים הועלו לתיקייה`,
      });
      
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "שגיאה בהעלאת קבצים",
        description: "אירעה שגיאה בהעלאת הקבצים. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="flex justify-center my-4">
      <label className={`
        flex items-center gap-2 px-4 py-2 
        bg-blue-600 text-white rounded-md 
        hover:bg-blue-700 transition-colors cursor-pointer
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <Upload className="w-5 h-5" />
        <span>העלה קבצים</span>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
      </label>
    </div>
  );
};

export default DocumentUploader;
