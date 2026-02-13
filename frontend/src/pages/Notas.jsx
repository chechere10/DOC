import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  StickyNote, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Printer,
  Search
} from 'lucide-react';
import ImprimirModal from '../components/ImprimirModal';

export default function Notas() {
  const [notas, setNotas] = useState([]);
  const [filtro, setFiltro] = useState('abierta');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [imprimirData, setImprimirData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotas();
  }, [filtro]);

  // Búsqueda automática cuando cambia el texto
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchNotas();
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [search]);

  const fetchNotas = async () => {
    try {
      setLoading(true);
      let url = '/notas?';
      if (filtro) url += `estado=${filtro}&`;
      if (search) url += `search=${search}`;
      const res = await api.get(url);
      setNotas(res.data);
    } catch (error) {
      console.error('Error al cargar notas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta nota?')) {
      try {
        await api.delete(`/notas/${id}`);
        fetchNotas();
      } catch (error) {
        alert('Error al eliminar nota');
      }
    }
  };

  const toggleEstado = async (nota) => {
    try {
      const nuevoEstado = nota.estado === 'abierta' ? 'cerrada' : 'abierta';
      await api.put(`/notas/${nota.id}`, { ...nota, estado: nuevoEstado });
      fetchNotas();
    } catch (error) {
      alert('Error al actualizar nota');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <StickyNote className="text-orange-500" />
            Notas y Recordatorios
          </h1>
          <p className="text-gray-500">Gestión de notas pendientes</p>
        </div>
        <Link to="/notas/nueva" className="btn-primary bg-orange-500 hover:bg-orange-600 flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nueva Nota
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
            placeholder="Buscar en el contenido de las notas..."
            className="input-field pr-12"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('abierta')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'abierta'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Notas Abiertas
        </button>
        <button
          onClick={() => setFiltro('cerrada')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === 'cerrada'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Notas Cerradas
        </button>
        <button
          onClick={() => setFiltro('')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtro === ''
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Lista de notas */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : notas.length > 0 ? (
          notas.map((nota) => (
            <div 
              key={nota.id} 
              className={`card hover:shadow-lg transition-shadow border-l-4 ${
                nota.estado === 'abierta' ? 'border-l-orange-500' : 'border-l-green-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Toggle estado */}
                <button
                  onClick={() => toggleEstado(nota)}
                  className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                    nota.estado === 'abierta'
                      ? 'text-orange-500 hover:bg-orange-50'
                      : 'text-green-500 hover:bg-green-50'
                  }`}
                  title={nota.estado === 'abierta' ? 'Marcar como cerrada' : 'Marcar como abierta'}
                >
                  {nota.estado === 'abierta' ? (
                    <Circle size={28} />
                  ) : (
                    <CheckCircle size={28} />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(nota.fecha).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      {nota.hora}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      nota.estado === 'abierta'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {nota.estado}
                    </span>
                  </div>
                  <p className={`whitespace-pre-wrap ${
                    nota.estado === 'cerrada' ? 'text-gray-500 line-through' : 'text-gray-700'
                  }`}>
                    {nota.contenido}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 md:flex-col">
                  <button
                    onClick={() => setImprimirData(nota)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Imprimir"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/notas/${nota.id}/editar`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(nota.id)}
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
            <StickyNote size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {filtro === 'abierta' 
                ? 'No hay notas pendientes 🎉' 
                : filtro === 'cerrada'
                ? 'No hay notas cerradas'
                : 'No hay notas registradas'}
            </p>
            <Link to="/notas/nueva" className="text-orange-500 hover:text-orange-600 mt-2 inline-block">
              Crear nueva nota
            </Link>
          </div>
        )}
      </div>

      {/* Contador */}
      {!loading && notas.length > 0 && (
        <p className="text-gray-500 text-sm text-right">
          Mostrando {notas.length} nota(s)
        </p>
      )}

      {/* Modal de impresión */}
      {imprimirData && (
        <ImprimirModal
          tipo="nota"
          data={imprimirData}
          onClose={() => setImprimirData(null)}
        />
      )}
    </div>
  );
}
