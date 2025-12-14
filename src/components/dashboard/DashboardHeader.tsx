interface DashboardHeaderProps {
  userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex justify-center items-center w-full py-6">
      <h1 className="text-3xl font-bold text-primary">My Dashboard</h1>
    </div>
  );
}
