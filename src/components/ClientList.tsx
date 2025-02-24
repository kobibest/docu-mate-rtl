
import { useState } from 'react';
import { Client } from '@/types';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import NewClientDialog from './NewClientDialog';

interface ClientListProps {
  clients: Client[];
  selectedClient?: string;
  onClientSelect: (clientId: string) => void;
  onCreateClient: (name: string) => Promise<void>;
}

const ClientList = ({ clients, selectedClient, onClientSelect, onCreateClient }: ClientListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="w-full h-full overflow-y-auto bg-white shadow-lg">
      <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">לקוחות</h2>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="p-1 hover:bg-blue-50 rounded-full transition-colors"
            title="הוסף לקוח חדש"
          >
            <PlusCircle className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        {clients.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            אין לקוחות עדיין
          </div>
        ) : (
          clients.map((client) => (
            <button
              key={client.id}
              onClick={() => onClientSelect(client.id)}
              className={cn(
                "w-full p-3 text-right rounded-lg transition-all duration-200",
                "hover:bg-blue-50",
                selectedClient === client.id
                  ? "bg-blue-100 shadow-sm"
                  : "bg-transparent"
              )}
            >
              <div className="font-medium">{client.name}</div>
              <div className="text-sm text-gray-600">
                {client.documentCount} מסמכים
              </div>
            </button>
          ))
        )}
      </div>
      
      <NewClientDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateClient={onCreateClient}
      />
    </div>
  );
};

export default ClientList;
