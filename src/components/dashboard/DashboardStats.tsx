interface DashboardStatsProps {
  userName: string;
  userRole: string;
}

export default function DashboardStats({ userName, userRole }: DashboardStatsProps) {
  return (
    <div className="w-full p-6 bg-blue-50 rounded-xl border border-blue-100">
      <h2 className="text-xl font-bold text-blue-800 mb-2">Welcome, {userName}!</h2>
      <p className="text-blue-600">
        You are logged in as a <strong>{userRole}</strong>.
      </p>
    </div>
  );
}
