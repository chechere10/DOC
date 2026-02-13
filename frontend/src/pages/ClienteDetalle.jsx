import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  User, 
  ArrowLeft, 
  Edit, 
  Phone, 
  MapPin, 
  CreditCard,
  FileText,
  ClipboardList,
  Plus,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('historias');

  useEffect(() => {
    fetchCliente();
  }, [id]);

  const fetchCliente = async () => {
    try {
      const res = await api.get(`/clientes/${id}`);
      setCliente(res.data);
    } catch (error) {
      console.error('Error al cargar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
        <Link to="/clientes" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Volver a clientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clientes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Detalle del Cliente</h1>
      </div>

      {/* Info del cliente */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Foto */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-gray-200">
              {cliente.foto ? (
                <img src={cliente.foto} alt={cliente.nombre} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Datos */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{cliente.nombre}</h2>
                <div className="mt-3 space-y-2 text-gray-600">
                  <p className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-400" />
                    {cliente.cedula}
                  </p>
                  {cliente.telefono && (
                    <p className="flex items-center gap-2">
                      <Phone size={18} className="text-gray-400" />
                      {cliente.telefono}
                    </p>
                  )}
                  {cliente.direccion && (
                    <p className="flex items-center gap-2">
                      <MapPin size={18} className="text-gray-400" />
                      {cliente.direccion}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/clientes/${id}/editar`)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit size={18} />
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('historias')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'historias'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText size={18} />
            Historias ({cliente.historias?.length || 0})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'formulas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <ClipboardList size={18} />
            Fórmulas ({cliente.formulas?.length || 0})
          </span>
        </button>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'historias' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link 
              to={`/historias/nueva?clienteId=${cliente.id}`}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Nueva Historia
            </Link>
          </div>

          {cliente.historias?.length > 0 ? (
            <div className="space-y-3">
              {cliente.historias.map((historia) => (
                <Link
                  key={historia.id}
                  to={`/historias/${historia.id}`}
                  className="card block hover:border-blue-200 border-2 border-transparent"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar size={14} />
                        {new Date(historia.fecha).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <p className="text-gray-700 line-clamp-2">{historia.observaciones}</p>
                    </div>
                    {historia.valor && (
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign size={16} />
                        {historia.valor.toLocaleString('es-CO')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No hay historias registradas</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'formulas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link 
              to={`/formulas/nueva?clienteId=${cliente.id}`}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Nueva Fórmula
            </Link>
          </div>

          {cliente.formulas?.length > 0 ? (
            <div className="space-y-3">
              {cliente.formulas.map((formula) => (
                <Link
                  key={formula.id}
                  to={`/formulas/${formula.id}`}
                  className="card block hover:border-purple-200 border-2 border-transparent"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar size={14} />
                    {new Date(formula.fecha).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formula.items?.map((item, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                      >
                        {item.nombre} x{item.cantidad}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No hay fórmulas registradas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
