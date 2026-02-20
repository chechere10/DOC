import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Receipt, 
  Plus, 
  Edit, 
  Trash2,
  Calendar,
  Search,
  Printer,
  Eye,
  DollarSign
} from 'lucide-react';
import ImprimirModal from '../components/ImprimirModal';

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [imprimirData, setImprimirData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFacturas();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchFacturas();
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [search]);

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      let url = '/facturas';
      if (search) url += `?search=${search}`;
      const res = await api.get(url);
      setFacturas(res.data);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta factura?')) {
      try {
        await api.delete(`/facturas/${id}`);
        fetchFacturas();
      } catch (error) {
        alert('Error al eliminar factura');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-emerald-600" />
            Facturas
          </h1>
          <p className="text-gray-500">Gestión de facturas</p>
        </div>
        <Link to="/facturas/nueva" className="btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nueva Factura
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
            placeholder="Buscar por cliente, cédula o número de factura..."
            className="input-field pr-12"
          />
        </div>
      </div>

      {/* Lista de facturas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando facturas...</p>
        </div>
      ) : facturas.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron facturas</p>
          <Link to="/facturas/nueva" className="text-emerald-600 hover:underline mt-2 inline-block">
            Crear primera factura
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {facturas.map(factura => (
            <div key={factura.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                      #{factura.numero}
                    </span>
                    <h3 className="font-semibold text-gray-800">{factura.cliente?.nombre}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(factura.fecha)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      Total: {formatMoney(factura.total)}
                    </span>
                    <span className="text-gray-400">
                      {factura.items?.length || 0} ítem(s)
                    </span>
                    {factura.vencimiento && (
                      <span className="text-gray-400">
                        Vence: {formatDate(factura.vencimiento)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setImprimirData(factura)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Imprimir"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => navigate(`/facturas/${factura.id}/editar`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(factura.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de impresión */}
      {imprimirData && (
        <ImprimirModal
          tipo="factura"
          data={imprimirData}
          onClose={() => setImprimirData(null)}
        />
      )}
    </div>
  );
}
