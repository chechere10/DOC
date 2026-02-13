import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Pill,
  Printer,
  Eye
} from 'lucide-react';
import ImprimirModal from '../components/ImprimirModal';

export default function Formulas() {
  const [formulas, setFormulas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [imprimirData, setImprimirData] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFormulas();
  }, []);

  // Búsqueda automática cuando cambia el texto
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchFormulas(search);
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [search]);

  const fetchFormulas = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/formulas${searchTerm ? `?search=${searchTerm}` : ''}`);
      setFormulas(res.data);
    } catch (error) {
      console.error('Error al cargar fórmulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta fórmula?')) {
      try {
        await api.delete(`/formulas/${id}`);
        fetchFormulas(search);
      } catch (error) {
        alert('Error al eliminar fórmula');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="text-purple-600" />
            Fórmulas Médicas
          </h1>
          <p className="text-gray-500">Registro de recetas y fórmulas</p>
        </div>
        <Link to="/formulas/nueva" className="btn-primary bg-purple-600 hover:bg-purple-700 flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nueva Fórmula
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

      {/* Lista de fórmulas */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : formulas.length > 0 ? (
          formulas.map((formula) => (
            <div key={formula.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Link 
                      to={`/clientes/${formula.cliente?.id}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <User size={18} />
                      {formula.cliente?.nombre}
                    </Link>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(formula.fecha).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* Items de la fórmula */}
                  <div className="space-y-2">
                    {formula.items?.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg"
                      >
                        <Pill size={16} className="text-purple-600" />
                        <span className="flex-1 text-gray-700">{item.nombre}</span>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-sm font-medium">
                          Cant: {item.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 md:flex-col">
                  <button
                    onClick={() => setVistaPrevia(formula)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Vista previa"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => setImprimirData(formula)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Imprimir"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/formulas/${formula.id}/editar`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(formula.id)}
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
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron fórmulas</p>
            <Link to="/formulas/nueva" className="text-purple-600 hover:text-purple-800 mt-2 inline-block">
              Crear primera fórmula
            </Link>
          </div>
        )}
      </div>

      {/* Contador */}
      {!loading && formulas.length > 0 && (
        <p className="text-gray-500 text-sm text-right">
          Mostrando {formulas.length} fórmula(s)
        </p>
      )}

      {/* Modal de impresión */}
      {imprimirData && (
        <ImprimirModal
          tipo="formula"
          data={imprimirData}
          onClose={() => setImprimirData(null)}
        />
      )}

      {/* Modal de vista previa */}
      {vistaPrevia && (
        <ImprimirModal
          tipo="formula"
          data={vistaPrevia}
          onClose={() => setVistaPrevia(null)}
          soloVista={true}
        />
      )}
    </div>
  );
}
