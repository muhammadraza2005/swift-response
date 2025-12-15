import { IEmergencyRequest } from '@/types/models';
import { EmergencyRequestFSM, EmergencyRequestState } from '@/utils/automata/stateMachine';
import { useState } from 'react';

interface RequestCardProps {
  request: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RequestCard({ request: req, onEdit, onDelete }: RequestCardProps) {
  const [showFSM, setShowFSM] = useState(false);
  
  // Initialize FSM with current state
  const fsm = new EmergencyRequestFSM(req.status as EmergencyRequestState);
  const fsmInfo = fsm.getStateInfo();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.type === 'Medical' ? 'bg-red-100 text-red-700' :
                req.type === 'Fire' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
              }`}>
              {req.type}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                req.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
              }`}>
              {req.status}
            </span>
            {fsmInfo.isAccepting && <span className="text-green-500 text-xs">✓ Complete</span>}
            {fsmInfo.isRejecting && <span className="text-red-500 text-xs">✗ Cancelled</span>}
            <button
              onClick={() => setShowFSM(!showFSM)}
              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
              title="Show state machine"
            >
              🔄 FSM
            </button>
          </div>
          <p className="text-gray-800 font-medium mb-1 text-lg">{req.description}</p>
          <p className="text-gray-500 text-sm">📍 {(req.location as any).address}</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          {new Date(req.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* FSM State Machine Visualization */}
      {showFSM && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="text-xs font-bold text-gray-700 mb-2">🤖 Finite State Machine (Automaton)</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600">Current State:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">{fsmInfo.state}</span>
              {fsmInfo.isTerminal && (
                <span className="text-gray-500">(Terminal State)</span>
              )}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Valid Transitions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {fsmInfo.validActions.length > 0 ? (
                  fsmInfo.validActions.map(action => (
                    <span key={action} className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-mono">
                      {action}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No transitions (terminal)</span>
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200 text-gray-600">
              <span className="font-semibold">State Flow:</span>
              <div className="mt-1 font-mono text-xs">
                pending → assigned → in_progress → resolved
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteers Section */}
      <div className="mt-6 pt-4 border-t border-gray-50">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span>🤝 Volunteers ({req.volunteer_registrations?.length || 0})</span>
          {req.volunteer_registrations?.length > 0 && <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse"></span>}
        </h4>
        
        {req.volunteer_registrations?.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No volunteers yet.</p>
        ) : (
          <div className="space-y-3">
            {req.volunteer_registrations.map((vol: any) => (
              <div key={vol.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800">{vol.volunteer?.full_name || 'Volunteer'}</span>
                  <span className="text-xs text-gray-500">{new Date(vol.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="text-gray-600 mb-1">📞 {vol.contact_info}</div>

                {vol.message && (
                  <div className="bg-white p-2 rounded border border-gray-100 text-gray-700 italic mt-2">
                    "{vol.message}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Actions Section */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 justify-end">
        <button
          onClick={() => onEdit(req.id)}
          className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(req.id)}
          className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
