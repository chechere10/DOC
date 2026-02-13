import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { ClipboardList, Save, ArrowLeft, Search, User, Plus, Trash2 } from 'lucide-react';

export default function FormulaForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    clienteId: searchParams.get('clienteId') || '',
    items: [{ nombre: '', cantidad: 1 }]
  });
  const [clientes, setClientes] = useState([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchFormula();
    } else if (formData.clienteId) {
      fetchClienteById(formData.clienteId);
    }
  }, [id]);

  const fetchFormula = async () => {
    try {
      const res = await api.get(`/formulas/${id}`);
      setFormData({
        clienteId: res.data.clienteId,
        items: res.data.items?.length > 0 
          ? res.data.items.map(i => ({ nombre: i.nombre, cantidad: i.cantidad }))
          : [{ nombre: '', cantidad: 1 }]
      });
      setSelectedCliente(res.data.cliente);
    } catch (error) {
      setError('Error al cargar fórmula');
    }
  };

  const fetchClienteById = async (clienteId) => {
    try {
      const res = await api.get(`/clientes/${clienteId}`);
      setSelectedCliente(res.data);
    } catch (error) {
      console.error('Error al cargar cliente:', error);
    }
  };

  const searchClientes = async (term) => {
    if (term.length < 2) {
      setClientes([]);
      return;
    }
    try {
      const res = await api.get(`/clientes?search=${term}`);
      setClientes(res.data);
      setShowClienteDropdown(true);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    }
  };

  const handleClienteSearch = (e) => {
    const value = e.target.value;
    setClienteSearch(value);
    searchClientes(value);
  };

  const selectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({ ...formData, clienteId: cliente.id });
    setClienteSearch('');
    setShowClienteDropdown(false);
  };

  const addItem = () => {
    if (formData.items.length < 10) {
      setFormData({
        ...formData,
        items: [...formData.items, { nombre: '', cantidad: 1 }]
      });
    }
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'cantidad' ? parseInt(value) || 1 : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.clienteId) {
      setError('Debe seleccionar un cliente');
      return;
    }

    const validItems = formData.items.filter(item => item.nombre.trim() !== '');
    if (validItems.length === 0) {
      setError('Debe agregar al menos un ítem');
      return;
    }

    setLoading(true);

    try {
      const data = {
        clienteId: parseInt(formData.clienteId),
        items: validItems
      };

      if (isEdit) {
        await api.put(`/formulas/${id}`, data);
      } else {
        await api.post('/formulas', data);
      }

      navigate('/formulas');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar fórmula');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/formulas')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="text-purple-600" />
            {isEdit ? 'Editar Fórmula' : 'Nueva Fórmula'}
          </h1>
          <p className="text-gray-500">
            {isEdit ? 'Modifique los datos de la fórmula' : 'Complete los datos de la nueva fórmula'}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Selector de cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paciente *
          </label>
          {selectedCliente ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <User className="text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">{selectedCliente.nombre}</p>
                  <p className="text-sm text-gray-500">CC: {selectedCliente.cedula}</p>
                </div>
              </div>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCliente(null);
                    setFormData({ ...formData, clienteId: '' });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Cambiar
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={clienteSearch}
                onChange={handleClienteSearch}
                onFocus={() => clienteSearch.length >= 2 && setShowClienteDropdown(true)}
                className="input-field pl-10"
                placeholder="Buscar paciente por nombre o cédula..."
              />
              {showClienteDropdown && clientes.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {clientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => selectCliente(cliente)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-gray-800">{cliente.nombre}</p>
                      <p className="text-sm text-gray-500">CC: {cliente.cedula}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items de la fórmula */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medicamentos / Ítems *
          </label>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.nombre}
                    onChange={(e) => updateItem(index, 'nombre', e.target.value)}
                    className="input-field"
                    placeholder={`Ítem ${index + 1}: Nombre del medicamento`}
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                    className="input-field text-center"
                    placeholder="Cant."
                    min="1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          
          {formData.items.length < 10 && (
            <button
              type="button"
              onClick={addItem}
              className="mt-3 flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
            >
              <Plus size={18} />
              Agregar otro ítem
            </button>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/formulas')}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary bg-purple-600 hover:bg-purple-700 flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEdit ? 'Actualizar' : 'Guardar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
