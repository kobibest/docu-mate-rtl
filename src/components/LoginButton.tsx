
import { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useToast } from "@/components/ui/use-toast";
import { createRootFolder } from '@/services/googleDrive';

interface LoginButtonProps {
  onRootFolderCreated: (folderId: string) => void;
}

const LoginButton = ({ onRootFolderCreated }: LoginButtonProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // בדיקה אם יש כבר טוקן שמור
    const checkExistingToken = async () => {
      const accessToken = localStorage.getItem('google_access_token');
      const rootFolderId = localStorage.getItem('root_folder_id');
      
      if (accessToken && rootFolderId) {
        onRootFolderCreated(rootFolderId);
      }
    };

    checkExistingToken();
  }, [onRootFolderCreated]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      
      try {
        const folder = await createRootFolder(tokenResponse.access_token);
        
        localStorage.setItem('google_access_token', tokenResponse.access_token);
        localStorage.setItem('root_folder_id', folder.id);
        onRootFolderCreated(folder.id);
        
        toast({
          title: "התחברות הצליחה",
          description: "התחברת בהצלחה עם חשבון Google",
        });
      } catch (error) {
        console.error('Error in login process:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בתהליך ההתחברות",
          variant: "destructive",
        });
      }
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
    onError: () => {
      toast({
        title: "שגיאה בהתחברות",
        description: "אירעה שגיאה בתהליך ההתחברות. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="flex justify-center items-center p-4">
      <button 
        onClick={() => login()} 
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        התחבר עם Google
      </button>
    </div>
  );
};

export default LoginButton;
