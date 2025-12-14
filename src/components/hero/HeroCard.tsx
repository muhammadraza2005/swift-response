interface HeroCardProps {
  title: string;
  icon: string;
  delay: number;
}

export default function HeroCard({ title, icon, delay }: HeroCardProps) {
  return (
    <div 
      className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="text-4xl">{icon}</div>
        <p className="text-white font-semibold text-base sm:text-lg">{title}</p>
      </div>
    </div>
  );
}
