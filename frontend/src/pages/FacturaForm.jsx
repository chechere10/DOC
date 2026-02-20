import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { 
  Receipt, 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search,
  User,
  Printer
} from 'lucide-react';
import ImprimirModal from '../components/ImprimirModal';

export default function FacturaForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [vencimiento, setVencimiento] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [items, setItems] = useState([{ cantidad: 1, descripcion: '', precioUnitario: '' }]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Búsqueda de clientes
  const [searchCliente, setSearchCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingClientes, setSearchingClientes] = useState(false);
  const dropdownRef = useRef(null);

  // Imprimir después de guardar
  const [facturaGuardada, setFacturaGuardada] = useState(null);

  useEffect(() => {
    if (isEdit) fetchFactura();
  }, [id]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar clientes con debounce
  useEffect(() => {
    if (searchCliente.length < 1) {
      setClientes([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingClientes(true);
      try {
        const res = await api.get(`/clientes?search=${searchCliente}`);
        setClientes(res.data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error buscando clientes:', error);
      } finally {
        setSearchingClientes(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchCliente]);

  const fetchFactura = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/facturas/${id}`);
      const f = res.data;
      setFecha(f.fecha ? f.fecha.split('T')[0] : '');
      setVencimiento(f.vencimiento ? f.vencimiento.split('T')[0] : '');
      setClienteId(f.clienteId);
      setClienteSeleccionado(f.cliente);
      setSearchCliente(f.cliente?.nombre || '');
      setItems(f.items.map(item => ({
        cantidad: item.cantidad,
        descripcion: item.descripcion,
        precioUnitario: item.precioUnitario
      })));
    } catch (error) {
      alert('Error al cargar factura');
      navigate('/facturas');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCliente = (cliente) => {
    setClienteId(cliente.id);
    setClienteSeleccionado(cliente);
    setSearchCliente(cliente.nombre);
    setShowDropdown(false);
  };

  const limpiarCliente = () => {
    setClienteId('');
    setClienteSeleccionado(null);
    setSearchCliente('');
  };

  const addItem = () => {
    setItems([...items, { cantidad: 1, descripcion: '', precioUnitario: '' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calcTotal = () => {
    return items.reduce((sum, item) => {
      const precio = parseFloat(item.precioUnitario) || 0;
      const cant = parseInt(item.cantidad) || 0;
      return sum + (precio * cant);
    }, 0);
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      alert('Debe seleccionar un cliente');
      return;
    }

    const itemsValidos = items.filter(i => i.descripcion && i.precioUnitario);
    if (itemsValidos.length === 0) {
      alert('Debe agregar al menos un ítem con descripción y precio');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clienteId: parseInt(clienteId),
        fecha,
        vencimiento: vencimiento || null,
        items: itemsValidos
      };

      let res;
      if (isEdit) {
        res = await api.put(`/facturas/${id}`, payload);
      } else {
        res = await api.post('/facturas', payload);
      }

      setFacturaGuardada(res.data);
    } catch (error) {
      alert('Error al guardar la factura: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Cargando factura...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/facturas')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-emerald-600" />
            {isEdit ? 'Editar Factura' : 'Nueva Factura'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fechas */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Datos de la Factura</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento (opcional)</label>
              <input
                type="date"
                value={vencimiento}
                onChange={(e) => setVencimiento(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Búsqueda de cliente */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            <User size={20} className="inline mr-2" />
            Facturar a
          </h2>
          
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchCliente}
                onChange={(e) => {
                  setSearchCliente(e.target.value);
                  if (clienteSeleccionado) limpiarCliente();
                }}
                placeholder="Buscar cliente por nombre o cédula..."
                className="input-field pl-10"
                autoComplete="off"
              />
              {searchingClientes && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                </div>
              )}
            </div>

            {/* Dropdown de resultados */}
            {showDropdown && clientes.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {clientes.map(cliente => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => seleccionarCliente(cliente)}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className="font-semibold text-gray-800">{cliente.nombre}</div>
                    <div className="text-sm text-gray-500">
                      C.C. {cliente.cedula}
                      {cliente.direccion && ` • ${cliente.direccion}`}
                      {cliente.telefono && ` • Tel: ${cliente.telefono}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showDropdown && clientes.length === 0 && searchCliente.length >= 1 && !searchingClientes && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                No se encontraron clientes
              </div>
            )}
          </div>

          {/* Datos del cliente seleccionado */}
          {clienteSeleccionado && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-emerald-800 text-lg">{clienteSeleccionado.nombre}</span>
                <button
                  type="button"
                  onClick={limpiarCliente}
                  className="text-sm text-red-500 hover:underline"
                >
                  Cambiar cliente
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                <div><strong>Cédula:</strong> {clienteSeleccionado.cedula}</div>
                <div><strong>Dirección:</strong> {clienteSeleccionado.direccion || 'N/A'}</div>
                <div><strong>Teléfono:</strong> {clienteSeleccionado.telefono || 'N/A'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Items de la factura */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Detalle de la Factura</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              <Plus size={16} />
              Agregar ítem
            </button>
          </div>

          {/* Header de la tabla */}
          <div className="hidden sm:grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-500">
            <div className="col-span-1 text-center">Cant.</div>
            <div className="col-span-5">Descripción</div>
            <div className="col-span-2 text-right">Precio Unit.</div>
            <div className="col-span-3 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {items.map((item, index) => {
            const itemTotal = (parseFloat(item.precioUnitario) || 0) * (parseInt(item.cantidad) || 0);
            return (
              <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-center">
                <div className="col-span-3 sm:col-span-1">
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                    className="input-field text-center"
                    placeholder="Cant."
                  />
                </div>
                <div className="col-span-9 sm:col-span-5">
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                    className="input-field"
                    placeholder="Descripción del servicio o producto"
                  />
                </div>
                <div className="col-span-5 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={item.precioUnitario}
                    onChange={(e) => updateItem(index, 'precioUnitario', e.target.value)}
                    className="input-field text-right"
                    placeholder="$0"
                  />
                </div>
                <div className="col-span-5 sm:col-span-3 text-right font-semibold text-gray-700 self-center">
                  {formatMoney(itemTotal)}
                </div>
                <div className="col-span-2 sm:col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={items.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="border-t-2 border-gray-200 pt-4 mt-4">
            <div className="flex justify-end">
              <div className="w-full sm:w-1/2 space-y-2">
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total:</span>
                  <span>{formatMoney(calcTotal())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-emerald-700">
                  <span>Saldo:</span>
                  <span>{formatMoney(calcTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/facturas')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEdit ? 'Actualizar' : 'Guardar'} Factura
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de impresión después de guardar */}
      {facturaGuardada && (
        <ImprimirModal
          tipo="factura"
          data={facturaGuardada}
          onClose={() => {
            setFacturaGuardada(null);
            navigate('/facturas');
          }}
        />
      )}
    </div>
  );
}
