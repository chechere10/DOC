import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText, 
  ClipboardList,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  // Búsqueda automática cuando cambia el texto
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchClientes(search);
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [search]);

  const fetchClientes = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/clientes${searchTerm ? `?search=${searchTerm}` : ''}`);
      setClientes(res.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Está seguro de eliminar al cliente "${nombre}"? Esta acción eliminará también todas sus historias y fórmulas.`)) {
      try {
        await api.delete(`/clientes/${id}`);
        fetchClientes(search);
      } catch (error) {
        alert('Error al eliminar cliente');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            Clientes
          </h1>
          <p className="text-gray-500">Gestión de pacientes registrados</p>
        </div>
        <Link to="/clientes/nuevo" className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nuevo Cliente
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
            placeholder="Buscar por nombre o cédula..."
            className="input-field pr-12"
          />
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : clientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Cédula</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Teléfono</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Dirección</th>
                  <th className="px-4 py-3 text-center">Historias</th>
                  <th className="px-4 py-3 text-center">Fórmulas</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="table-row">
                    <td className="px-4 py-3">
                      <Link 
                        to={`/clientes/${cliente.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {cliente.nombre}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1">
                        <CreditCard size={14} />
                        {cliente.cedula}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {cliente.telefono ? (
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {cliente.telefono}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {cliente.direccion ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span className="truncate max-w-[200px]">{cliente.direccion}</span>
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <FileText size={14} />
                        {cliente._count?.historias || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <ClipboardList size={14} />
                        {cliente._count?.formulas || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id, cliente.nombre)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron clientes</p>
            <Link to="/clientes/nuevo" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              Agregar primer cliente
            </Link>
          </div>
        )}
      </div>

      {/* Contador */}
      {!loading && clientes.length > 0 && (
        <p className="text-gray-500 text-sm text-right">
          Mostrando {clientes.length} cliente(s)
        </p>
      )}
    </div>
  );
}
