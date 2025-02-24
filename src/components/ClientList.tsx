
import { Client } from '@/types';
import { cn } from '@/lib/utils';

interface ClientListProps {
  clients: Client[];
  selectedClient?: string;
  onClientSelect: (clientId: string) => void;
}

const ClientList = ({ clients, selectedClient, onClientSelect }: ClientListProps) => {
  return (
    <div className="w-64 h-full overflow-y-auto bg-white shadow-lg rounded-l-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-right">לקוחות</h2>
      <div className="space-y-2">
        {clients.map((client) => (
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
        ))}
      </div>
    </div>
  );
};

export default ClientList;
