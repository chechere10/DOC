import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Calendar,
  User,
  DollarSign,
  Printer,
  Eye
} from 'lucide-react';
import ImprimirModal from '../components/ImprimirModal';

export default function Historias() {
  const [historias, setHistorias] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [imprimirData, setImprimirData] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistorias();
  }, []);

  // Búsqueda automática cuando cambia el texto
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchHistorias(search);
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [search]);

  const fetchHistorias = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/historias${searchTerm ? `?search=${searchTerm}` : ''}`);
      setHistorias(res.data);
    } catch (error) {
      console.error('Error al cargar historias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta historia?')) {
      try {
        await api.delete(`/historias/${id}`);
        fetchHistorias(search);
      } catch (error) {
        alert('Error al eliminar historia');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-green-600" />
            Historias Clínicas
          </h1>
          <p className="text-gray-500">Registro de historias de pacientes</p>
        </div>
        <Link to="/historias/nueva" className="btn-success flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nueva Historia
        </Link>
      </div>

      {/* Buscador */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de paciente..."
            className="input-field pr-12"
          />
        </div>
      </div>

      {/* Lista de historias */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : historias.length > 0 ? (
          historias.map((historia) => (
            <div key={historia.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Link 
                      to={`/clientes/${historia.cliente?.id}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <User size={18} />
                      {historia.cliente?.nombre}
                    </Link>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(historia.fecha).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{historia.observaciones}</p>
                  {historia.valor && (
                    <div className="mt-3 flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign size={16} />
                      {historia.valor.toLocaleString('es-CO')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 md:flex-col">
                  <button
                    onClick={() => setVistaPrevia(historia)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Vista previa"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => setImprimirData(historia)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Imprimir"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/historias/${historia.id}/editar`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(historia.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron historias</p>
            <Link to="/historias/nueva" className="text-green-600 hover:text-green-800 mt-2 inline-block">
              Crear primera historia
            </Link>
          </div>
        )}
      </div>

      {/* Contador */}
      {!loading && historias.length > 0 && (
        <p className="text-gray-500 text-sm text-right">
          Mostrando {historias.length} historia(s)
        </p>
      )}

      {/* Modal de impresión */}
      {imprimirData && (
        <ImprimirModal
          tipo="historia"
          data={imprimirData}
          onClose={() => setImprimirData(null)}
        />
      )}

      {/* Modal de vista previa */}
      {vistaPrevia && (
        <ImprimirModal
          tipo="historia"
          data={vistaPrevia}
          onClose={() => setVistaPrevia(null)}
          soloVista={true}
        />
      )}
    </div>
  );
}
