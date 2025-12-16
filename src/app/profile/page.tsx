'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { User, Shield, Activity, FileText, HandHelping, Users, Clock } from 'lucide-react';
import Loader from '@/components/Loader';
import { useEffect } from 'react';

// Define explicit types
interface UserData {
    id: string;
    email: string | undefined;
    user_metadata: {
        full_name: string;
        role: string;
    };
    created_at: string;
}

interface ProfileStats {
    requestsMade: number;
    requestsResolved: number;
    volunteeredCount: number;
    totalUsers: number;
    totalRequests: number;
    totalVolunteers: number;
}

// Fetch user function
const fetchUser = async (): Promise<UserData | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
        id: user.id,
        email: user.email,
        user_metadata: {
            full_name: user.user_metadata.full_name,
            role: user.user_metadata.role,
        },
        created_at: user.created_at,
    };
};

// Fetch stats function
const fetchStats = async (user: UserData | null): Promise<ProfileStats> => {
    const initialStats: ProfileStats = {
        requestsMade: 0,
        requestsResolved: 0,
        volunteeredCount: 0,
        totalUsers: 0,
        totalRequests: 0,
        totalVolunteers: 0
    };

    if (!user) return initialStats;

    const role = user.user_metadata.role;

    if (role === 'citizen') {
        const { count: requestsCount } = await supabase
            .from('emergency_requests')
            .select('*', { count: 'exact', head: true })
            .eq('requester_id', user.id);

        const { count: resolvedCount } = await supabase
            .from('emergency_requests')
            .select('*', { count: 'exact', head: true })
            .eq('requester_id', user.id)
            .eq('status', 'resolved');

        return { ...initialStats, requestsMade: requestsCount || 0, requestsResolved: resolvedCount || 0 };
    }
    else if (role === 'volunteer') {
        const { count: volunteeredCount } = await supabase
            .from('volunteer_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('volunteer_id', user.id);

        return { ...initialStats, volunteeredCount: volunteeredCount || 0 };
    }
    else if (role === 'ngo_admin') {
        // Queries can be run in parallel
        const [usersRes, requestsRes, volunteersRes] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('emergency_requests').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'volunteer')
        ]);

        return {
            ...initialStats,
            totalUsers: usersRes.count || 0,
            totalRequests: requestsRes.count || 0,
            totalVolunteers: volunteersRes.count || 0
        };
    }

    return initialStats;
};

export default function ProfilePage() {
    const router = useRouter();

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['profileStats', user?.id],
        queryFn: () => fetchStats(user!),
        enabled: !!user, // Only fetch stats when user is available
    });

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || isStatsLoading) {
        return <Loader text="Loading Profile..." />;
    }

    if (!user || !stats) return null; // Should handle by redirect, but for safety

    const role = user.user_metadata.role;
    const displayRole = role.replace('_', ' ');

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#008C5A] to-[#00A366] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {user.user_metadata.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.user_metadata.full_name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${role === 'ngo_admin' ? 'bg-purple-100 text-purple-700' :
                                    role === 'volunteer' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                {displayRole}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> Joined {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {role === 'citizen' && (
                        <>
                            <StatCard
                                icon={<FileText className="w-8 h-8 text-blue-600" />}
                                label="Emergency Requests"
                                value={stats.requestsMade}
                                color="blue"
                            />
                            <StatCard
                                icon={<Shield className="w-8 h-8 text-green-600" />}
                                label="Resolved Cases"
                                value={stats.requestsResolved}
                                color="green"
                            />
                        </>
                    )}

                    {role === 'volunteer' && (
                        <>
                            <StatCard
                                icon={<HandHelping className="w-8 h-8 text-orange-600" />}
                                label="Emergencies Attended"
                                value={stats.volunteeredCount}
                                color="orange"
                            />
                            <StatCard
                                icon={<Activity className="w-8 h-8 text-purple-600" />}
                                label="Active Status"
                                value="Available"
                                color="purple"
                                isText
                            />
                        </>
                    )}

                    {role === 'ngo_admin' && (
                        <>
                            <StatCard
                                icon={<Users className="w-8 h-8 text-indigo-600" />}
                                label="Total Users"
                                value={stats.totalUsers}
                                color="indigo"
                            />
                            <StatCard
                                icon={<FileText className="w-8 h-8 text-red-600" />}
                                label="Total Requests"
                                value={stats.totalRequests}
                                color="red"
                            />
                            <StatCard
                                icon={<HandHelping className="w-8 h-8 text-green-600" />}
                                label="Active Volunteers"
                                value={stats.totalVolunteers}
                                color="green"
                            />
                        </>
                    )}
                </div>

                {/* Account Details / Actions (Placeholder) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-gray-500" />
                        Account Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Email Address</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                   
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, isText = false }: { icon: React.ReactNode, label: string, value: string | number, color: string, isText?: boolean }) {
    const bgColors: { [key: string]: string } = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        orange: 'bg-orange-50',
        purple: 'bg-purple-50',
        indigo: 'bg-indigo-50',
        red: 'bg-red-50',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 ${bgColors[color] || 'bg-gray-50'} rounded-xl flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <p className="text-gray-500 font-medium mb-1">{label}</p>
            <p className={`text-3xl font-bold ${isText ? 'text-gray-800' : 'text-gray-900'}`}>
                {value}
            </p>
        </div>
    );
}
