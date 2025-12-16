'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { IIncident } from '@/types/models';
import { AlertCircle, MapPin, Phone, Radio, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function LiveIncidentsSection() {
    const [incidents, setIncidents] = useState<IIncident[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingAction, setProcessingAction] = useState<{ id: string; action: 'acknowledge' | 'resolve' } | null>(null);

    const fetchIncidents = async () => {
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .in('status', ['pending', 'acknowledged'])
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching incidents:', error);
        } else {
            setIncidents(data as IIncident[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchIncidents();

        // Optional: Poll every 30 seconds
        const interval = setInterval(fetchIncidents, 30000);
        return () => clearInterval(interval);
    }, []);

    const acknowledgeIncident = async (id: string) => {
        setProcessingAction({ id, action: 'acknowledge' });

        try {
            const response = await fetch('/api/incident/update-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: 'acknowledged' }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || 'Failed to acknowledge incident');
            }

            // Show success feedback
            const incident = incidents.find(i => i.id === id);
            if (incident?.phone_number) {
                alert(`✓ Incident acknowledged for ${incident.phone_number}`);
            }
            fetchIncidents();
        } catch (error) {
            console.error('Error acknowledging incident:', error);
            alert('Failed to acknowledge incident. Please try again.');
        }

        setProcessingAction(null);
    };

    const resolveIncident = async (id: string) => {
        const incident = incidents.find(i => i.id === id);
        const confirmMessage = incident?.phone_number
            ? `Mark incident from ${incident.phone_number} as resolved?`
            : 'Mark this incident as resolved?';

        if (!confirm(confirmMessage + '\n\nThis will remove it from active incidents.')) {
            return;
        }

        setProcessingAction({ id, action: 'resolve' });

        try {
            const response = await fetch('/api/incident/update-status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: 'resolved' }),
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || 'Failed to resolve incident');
            }

            alert('Incident resolved successfully!');
            fetchIncidents();
        } catch (error) {
            console.error('Error resolving incident:', error);
            alert('Failed to resolve incident. Please try again.');
        }

        setProcessingAction(null);
    };

    if (loading) return null; // Or a skeleton
    if (incidents.length === 0) return null; // Don't show if empty

    return (
        <section className="mb-8 animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-red-50 border-2 border-red-500 rounded-2xl overflow-hidden shadow-lg shadow-red-100">
                <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></span>
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-wide">
                            LIVE INCIDENTS (PANIC MODE)
                        </h2>
                    </div>
                    <span className="bg-red-800 text-white text-xs font-bold px-3 py-1 rounded-full border border-red-400">
                        {incidents.length} ACTIVE
                    </span>
                </div>

                <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {incidents.map((incident) => (
                        <div
                            key={incident.id}
                            className={`relative bg-white p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md ${incident.status === 'pending' ? 'border-l-red-500' : 'border-l-yellow-500'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    {incident.source_channel === 'call' && <Phone className="w-4 h-4 text-gray-500" />}
                                    {incident.source_channel === 'sms' && <Radio className="w-4 h-4 text-gray-500" />}
                                    {incident.source_channel === 'data' && <Radio className="w-4 h-4 text-blue-500" />}
                                    <span className="text-xs font-mono text-gray-400 uppercase">
                                        {incident.source_channel}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                                </span>
                            </div>

                            <div className="mb-2">
                                <h3 className="font-bold text-gray-900 truncate" title={incident.device_emergency_id}>
                                    {incident.phone_number || 'Unknown Device'}
                                </h3>
                                <p className="text-xs text-gray-400 truncate">ID: {incident.device_emergency_id.slice(0, 8)}...</p>
                            </div>

                            <div className="flex items-start gap-2 mb-4 bg-gray-50 p-2 rounded text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                <div>
                                    <p className="font-medium">
                                        {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
                                    </p>
                                    <p className="text-xs text-gray-400 capitalize">Accuracy: {incident.location_confidence}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                                {incident.status === 'pending' && (
                                    <button
                                        onClick={() => acknowledgeIncident(incident.id)}
                                        disabled={processingAction?.id === incident.id}
                                        className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                        {processingAction?.id === incident.id && processingAction?.action === 'acknowledge' ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                PROCESSING...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-3 h-3" />
                                                ACKNOWLEDGE
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => resolveIncident(incident.id)}
                                    disabled={processingAction?.id === incident.id}
                                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                >
                                    {processingAction?.id === incident.id && processingAction?.action === 'resolve' ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            PROCESSING...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-3 h-3" />
                                            RESOLVE
                                        </>
                                    )}
                                </button>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded flex items-center justify-center transition-colors"
                                    title="View on Map"
                                >
                                    <MapPin className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
