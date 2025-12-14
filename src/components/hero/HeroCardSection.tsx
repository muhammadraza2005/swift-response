import HeroCard from './HeroCard';

interface Card {
  title: string;
  icon: string;
}

interface HeroCardSectionProps {
  cards: Card[];
  pageTitle: string;
  subtitle?: string;
}

export default function HeroCardSection({ cards, pageTitle, subtitle }: HeroCardSectionProps) {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-br from-[#008C5A] to-[#006B47] text-white overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-[#FFD700] opacity-10 rounded-full blur-3xl animate-float hidden md:block"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#00A366] opacity-10 rounded-full blur-3xl hidden md:block" style={{animation: 'float 5s ease-in-out infinite'}}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            {pageTitle}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg opacity-95 max-w-2xl mx-auto animate-fade-in-up px-4" style={{animationDelay: '100ms'}}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map((card, index) => (
            <HeroCard
              key={index}
              title={card.title}
              icon={card.icon}
              delay={200 + index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
