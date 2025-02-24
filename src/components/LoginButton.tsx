
import { useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { createRootFolder } from '@/services/googleDrive';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from './ui/use-toast';

interface LoginButtonProps {
  onRootFolderCreated: (folderId: string) => void;
}

const LoginButton = ({ onRootFolderCreated }: LoginButtonProps) => {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        localStorage.setItem('google_access_token', response.access_token);
        
        // קבלת פרטי המשתמש
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });
        const userData = await userResponse.json();
        localStorage.setItem('user_email', userData.email);

        // יצירת תיקיית שורש
        const folder = await createRootFolder(response.access_token);
        localStorage.setItem('root_folder_id', folder.id);
        onRootFolderCreated(folder.id);

        toast({
          title: 'התחברות בוצעה בהצלחה',
          description: 'התחברת בהצלחה למערכת',
        });
      } catch (error) {
        console.error('Error in login process:', error);
        toast({
          title: 'שגיאה בהתחברות',
          description: 'אירעה שגיאה בתהליך ההתחברות',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast({
        title: 'שגיאה בהתחברות',
        description: 'אירעה שגיאה בתהליך ההתחברות',
        variant: 'destructive',
      });
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/userinfo.email',
  });

  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    const folderId = localStorage.getItem('root_folder_id');
    
    if (token && folderId) {
      onRootFolderCreated(folderId);
    }
  }, [onRootFolderCreated]);

  return (
    <div className="flex justify-center p-4">
      <Button
        onClick={() => login()}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        התחבר עם Google
      </Button>
    </div>
  );
};

export default LoginButton;
