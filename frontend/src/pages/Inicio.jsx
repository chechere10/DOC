import { useAuth } from '../context/AuthContext';
import { Heart, Shield, Users, Sparkles } from 'lucide-react';

export default function Inicio() {
  const { usuario } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const features = [
    {
      icon: Heart,
      title: 'Atención Integral',
      description: 'Cuidado completo para mujeres y familias'
    },
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Información protegida y confidencial'
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Apoyo continuo a quienes más lo necesitan'
    },
    {
      icon: Sparkles,
      title: 'Compromiso',
      description: 'Dedicación en cada paso del proceso'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
        {/* Logo Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-2xl border border-purple-500/20">
            <img 
              src="/logoo.png" 
              alt="FUNDAMUFA Logo" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            {getGreeting()}, {usuario?.nombre}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            Bienvenido al Sistema de Gestión
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></span>
            <span className="text-sm uppercase tracking-widest">Fundación Huésped Mujer y Familia</span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl w-full mb-10">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Decorative Quote */}
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 p-6 rounded-2xl border border-purple-100">
          <p className="text-gray-600 italic text-lg">
            "Transformando vidas a través del amor, el cuidado y el compromiso con cada familia que servimos"
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-100">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-purple-400"></div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            FUNDAMUFA
          </span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-purple-400"></div>
        </div>
        <p className="text-gray-400 text-sm">
          Sistema de Información Corporativo © 2026
        </p>
      </div>
    </div>
  );
}
