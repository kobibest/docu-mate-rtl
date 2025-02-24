
import { Client } from '@/types';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  selectedClient?: string;
  onClientSelect: (clientId: string) => void;
}

const ClientList = ({ clients, selectedClient, onClientSelect }: ClientListProps) => {
  return (
    <div className="w-64 h-full overflow-y-auto bg-white shadow-lg rounded-l-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">לקוחות</h2>
        <button
          className="p-1 hover:bg-blue-50 rounded-full transition-colors"
          title="הוסף לקוח חדש"
        >
          <PlusCircle className="w-6 h-6 text-blue-600" />
        </button>
      </div>
      <div className="space-y-2">
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
    </div>
  );
};

export default ClientList;
