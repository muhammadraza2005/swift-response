import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Full Viewport Height */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#008C5A] to-[#006B47] text-white overflow-hidden">
        {/* Decorative floating elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#FFD700] opacity-10 rounded-full blur-3xl animate-float hidden md:block"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#00A366] opacity-10 rounded-full blur-3xl" style={{animation: 'float 5s ease-in-out infinite'}}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10 text-center py-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
            Swift Response
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-12 opacity-95 animate-fade-in-up max-w-3xl mx-auto px-4" style={{animationDelay: '100ms'}}>
            Connecting communities during emergencies
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up px-4" style={{animationDelay: '200ms'}}>
            <Link 
              href="/requests/create"
              className="group bg-[#DC3545] text-white hover:bg-red-700 font-bold py-4 px-8 sm:px-10 rounded-lg shadow-lg transition-all duration-300 text-base sm:text-lg hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            >
              <span className="inline-block group-hover:scale-105 transition-transform">Report Emergency</span>
            </Link>
            <Link 
              href="/volunteer"
              className="group bg-[#FFD700] text-[#333333] hover:bg-[#F4B942] font-bold py-4 px-8 sm:px-10 rounded-lg shadow-lg transition-all duration-300 text-base sm:text-lg hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            >
              <span className="inline-block group-hover:scale-105 transition-transform">Become a Volunteer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats Bar - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#333333] mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              { value: '500+', label: 'Volunteers Joined' },
              { value: '1000+', label: 'Lives Saved' },
              { value: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="glass text-center p-6 sm:p-8 rounded-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-xl active:scale-95 cursor-pointer"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-3">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center py-16 sm:py-24 bg-gradient-to-b from-white to-[#F8F9FA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#333333] mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 sm:mb-16 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Our streamlined process ensures rapid response during emergencies
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto">
            {[
              { step: 1, title: 'Report Emergency', desc: 'Quickly provide details and location of the emergency to alert the community' },
              { step: 2, title: 'Get Verified Help', desc: 'Our system validates requests and connects you with nearby resources' },
              { step: 3, title: 'Help Arrives', desc: 'Volunteers and first responders coordinate to provide immediate support' }
            ].map((item, index) => (
              <div 
                key={item.step}
                className="text-center group"
                style={{animationDelay: `${index * 150}ms`}}
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#008C5A] to-[#00A366] text-white rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 active:scale-95">
                    {item.step}
                  </div>
                  <div className="absolute -inset-2 bg-[#008C5A] opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#333333] mb-4">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Categories Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#333333] mb-4">Emergency Categories</h2>
          <p className="text-center text-gray-600 mb-12 sm:mb-16 text-base sm:text-lg max-w-2xl mx-auto px-4">
            We provide assistance across all types of emergencies
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Floods', icon: '🌊', color: 'from-blue-500 to-cyan-500' },
              { name: 'Earthquakes', icon: '🏚️', color: 'from-amber-500 to-orange-500' },
              { name: 'Fires', icon: '🔥', color: 'from-red-500 to-rose-500' },
              { name: 'Medical', icon: '🏥', color: 'from-green-500 to-emerald-500' },
              { name: 'Accidents', icon: '🚨', color: 'from-purple-500 to-pink-500' },
              { name: 'Supplies', icon: '📦', color: 'from-indigo-500 to-blue-500' },
              { name: 'Rescue', icon: '🆘', color: 'from-yellow-500 to-amber-500' },
              { name: 'Other', icon: '⚠️', color: 'from-gray-500 to-slate-500' }
            ].map((cat, index) => (
              <div 
                key={cat.name}
                className="group relative p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-[#F8F9FA] rounded-2xl text-center border-2 border-[#E9ECEF] hover:border-[#008C5A] hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden active:scale-95"
                style={{animationDelay: `${index * 50}ms`}}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 group-hover:scale-125 transition-transform duration-300">{cat.icon}</div>
                  <span className="text-sm sm:text-base font-semibold text-[#333333] group-hover:text-[#008C5A] transition-colors">{cat.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center py-16 sm:py-24 bg-gradient-to-b from-[#F8F9FA] to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] opacity-5 rounded-full blur-3xl hidden lg:block"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#333333] mb-4">Key Features</h2>
          <p className="text-center text-gray-600 mb-12 sm:mb-16 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Powerful tools to ensure effective emergency response
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 max-w-6xl mx-auto">
            {[
              { icon: '📢', title: 'Real-time Alerts', desc: 'Get instant notifications about emergencies in your area with verified updates' },
              { icon: '🗺️', title: 'Interactive Map', desc: 'Find nearby shelters, hospitals, and resources on our community map' },
              { icon: '🤝', title: 'Verified Volunteers', desc: 'Connect with registered volunteers and NGOs ready to assist' }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="glass p-6 sm:p-8 md:p-10 rounded-3xl hover:-translate-y-3 hover:shadow-2xl transition-all duration-300 group active:scale-95 cursor-pointer"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#008C5A] to-[#00A366] bg-opacity-10 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#333333] mb-3 sm:mb-4 group-hover:text-[#008C5A] transition-colors">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Full Viewport */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#008C5A] via-[#00A366] to-[#006B47] text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#FFD700] opacity-10 rounded-full blur-3xl animate-float hidden md:block"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl" style={{animation: 'float 4s ease-in-out infinite'}}></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-95 px-4">
            Join our community today and help save lives during emergencies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Link 
              href="/requests/create"
              className="group bg-white text-[#008C5A] hover:bg-gray-100 font-bold py-4 sm:py-5 px-8 sm:px-12 rounded-xl shadow-2xl transition-all duration-300 text-base sm:text-lg hover:-translate-y-1 hover:shadow-3xl active:scale-95"
            >
              <span className="inline-block group-hover:scale-105 transition-transform">Report Emergency</span>
            </Link>
            <Link 
              href="/volunteer"
              className="group bg-transparent border-2 sm:border-3 border-white text-white hover:bg-white hover:text-[#008C5A] font-bold py-4 sm:py-5 px-8 sm:px-12 rounded-xl transition-all duration-300 text-base sm:text-lg hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            >
              <span className="inline-block group-hover:scale-105 transition-transform">Become a Volunteer</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
