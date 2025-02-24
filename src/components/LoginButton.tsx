
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from "@/components/ui/use-toast";

const LoginButton = () => {
  const { toast } = useToast();

  const handleSuccess = (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);
    toast({
      title: "התחברות הצליחה",
      description: "התחברת בהצלחה עם חשבון Google",
    });
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
