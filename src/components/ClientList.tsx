
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
    <div className="w-full h-full overflow-y-auto glass">
      <div className="sticky top-0 glass border-b border-gray-700/50 p-4 z-10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            לקוחות
          </h2>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:scale-105"
            title="הוסף לקוח חדש"
          >
            <PlusCircle className="w-6 h-6 text-blue-400" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        {clients.length === 0 ? (
          <div className="text-center text-gray-400 py-4 glass rounded-lg">
            אין לקוחות עדיין
          </div>
        ) : (
          clients.map((client) => (
            <button
              key={client.id}
              onClick={() => onClientSelect(client.id)}
              className={cn(
                "w-full p-4 rounded-xl transition-all duration-300 border border-transparent",
                "hover:border-blue-500/30 hover:bg-white/5",
                selectedClient === client.id
                  ? "bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
                  : "glass"
              )}
            >
              <div className="font-medium text-lg">{client.name}</div>
              <div className="text-sm text-gray-400">
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
