
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface NewClientDialogProps {
  onCreateClient: (name: string) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewClientDialog = ({ onCreateClient, isOpen, onOpenChange }: NewClientDialogProps) => {
  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setIsLoading(true);
    try {
      await onCreateClient(clientName);
      setClientName("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>הוספת לקוח חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="שם הלקוח"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !clientName.trim()}>
              {isLoading ? 'יוצר לקוח...' : 'צור לקוח'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewClientDialog;
