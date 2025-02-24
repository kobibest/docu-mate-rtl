
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from "@/components/ui/use-toast";
import { createRootFolder } from '@/services/googleDrive';

const LoginButton = () => {
  const { toast } = useToast();

  const handleSuccess = async (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);
    
    try {
      // יצירת תיקיית השורש
      const folder = await createRootFolder(credentialResponse.access_token);
      
      toast({
        title: "התחברות הצליחה",
        description: "התחברת בהצלחה עם חשבון Google ונוצרה תיקיית brokerApp",
      });
    } catch (error) {
      console.error('Error in login process:', error);
      toast({
        title: "שגיאה ביצירת התיקייה",
        description: "ההתחברות הצליחה אך הייתה בעיה ביצירת תיקיית brokerApp",
        variant: "destructive",
      });
    }
  };

  const handleError = () => {
    toast({
      title: "שגיאה בהתחברות",
      description: "אירעה שגיאה בתהליך ההתחברות. אנא נסה שוב.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex justify-center items-center p-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="continue_with"
        useOneTap
      />
    </div>
  );
};

export default LoginButton;
