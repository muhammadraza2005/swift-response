import RequestCard from './RequestCard';

interface DashboardRequestsSectionProps {
  requests: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DashboardRequestsSection({ requests, onEdit, onDelete }: DashboardRequestsSectionProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
        <a href="/requests/create" className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          + New Request
        </a>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 mb-4">You haven't made any requests yet.</p>
          <a href="/requests/create" className="text-primary font-bold hover:underline">Request Help Now</a>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req: any) => (
            <RequestCard
              key={req.id}
              request={req}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
