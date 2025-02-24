
import { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { createRootFolder } from '@/services/googleDrive';

interface LoginButtonProps {
  onRootFolderCreated: (folderId: string) => void;
}

const LoginButton = ({ onRootFolderCreated }: LoginButtonProps) => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkExistingToken = async () => {
      const accessToken = localStorage.getItem('google_access_token');
      const rootFolderId = localStorage.getItem('root_folder_id');
      
      if (accessToken && rootFolderId) {
        console.log('Found existing session, using stored folder ID:', rootFolderId);
        setIsLoggedIn(true);
        onRootFolderCreated(rootFolderId);
      }
    };

    checkExistingToken();
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Login Success, getting root folder...');
      
      try {
        const folder = await createRootFolder(tokenResponse.access_token);
        
        localStorage.setItem('google_access_token', tokenResponse.access_token);
        localStorage.setItem('root_folder_id', folder.id);
        
        console.log('Setting up new session with folder:', folder.id);
        setIsLoggedIn(true);
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

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('root_folder_id');
    setIsLoggedIn(false);
    // רענון הדף כדי לאפס את המצב של האפליקציה
    window.location.reload();
    
    toast({
      title: "התנתקות הצליחה",
      description: "התנתקת בהצלחה מחשבון Google",
    });
  };

  return (
    <div className="flex justify-center items-center gap-4 p-4">
      {!isLoggedIn ? (
        <Button onClick={() => login()} variant="default">
          <LogIn className="ml-2" />
          התחבר עם Google
        </Button>
      ) : (
        <Button onClick={handleLogout} variant="destructive">
          <LogOut className="ml-2" />
          התנתק מ-Google
        </Button>
      )}
    </div>
  );
};

export default LoginButton;
