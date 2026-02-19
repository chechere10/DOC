import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FileText, Save, ArrowLeft, Search, User, Camera, X, Image, ZoomIn } from 'lucide-react';

export default function HistoriaForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    clienteId: searchParams.get('clienteId') || '',
    observaciones: '',
    valor: '',
    tipoPago: 'pago',
    referido: ''
  });
  const [clientes, setClientes] = useState([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examenes, setExamenes] = useState([]);         // Exámenes existentes (ya guardados)
  const [nuevosExamenes, setNuevosExamenes] = useState([]); // Nuevos exámenes (por guardar)
  const [previewImg, setPreviewImg] = useState(null);   // Imagen en zoom

  useEffect(() => {
    if (isEdit) {
      fetchHistoria();
    } else if (formData.clienteId) {
      fetchClienteById(formData.clienteId);
    }
  }, [id]);

  const fetchHistoria = async () => {
    try {
      const res = await api.get(`/historias/${id}`);
      setFormData({
        clienteId: res.data.clienteId,
        observaciones: res.data.observaciones,
        valor: res.data.valor || '',
        tipoPago: res.data.tipoPago || 'pago',
        referido: res.data.referido || ''
      });
      setSelectedCliente(res.data.cliente);
      if (res.data.examenes) {
        setExamenes(res.data.examenes);
      }
    } catch (error) {
      setError('Error al cargar historia');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.clienteId) {
      setError('Debe seleccionar un cliente');
      return;
    }

    setLoading(true);

    try {
      const data = {
        clienteId: parseInt(formData.clienteId),
        observaciones: formData.observaciones,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        tipoPago: formData.tipoPago,
        referido: formData.referido || null,
        examenes: nuevosExamenes.map(ex => ({
          nombre: ex.nombre,
          imagen: ex.imagen
        }))
      };

      if (isEdit) {
        await api.put(`/historias/${id}`, data);
      } else {
        await api.post('/historias', data);
      }

      navigate('/historias');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar historia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/historias')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-green-600" />
            {isEdit ? 'Editar Historia' : 'Nueva Historia'}
          </h1>
          <p className="text-gray-500">
            {isEdit ? 'Modifique los datos de la historia' : 'Complete los datos de la nueva historia'}
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

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones *
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            className="input-field min-h-[200px] resize-y"
            placeholder="Escriba las observaciones de la consulta..."
            required
          />
        </div>

        {/* Tipo de Pago y Valor */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de pago
            </label>
            <select
              value={formData.tipoPago}
              onChange={(e) => setFormData({ ...formData, tipoPago: e.target.value })}
              className="input-field"
            >
              <option value="pago">💰 Pagó</option>
              <option value="abono">📋 Abonó</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor ($)
            </label>
            <input
              type="number"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              className="input-field"
              placeholder="0"
              min="0"
              step="1000"
            />
          </div>
        </div>

        {/* Referido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👥 Referido por (opcional)
          </label>
          <input
            type="text"
            value={formData.referido}
            onChange={(e) => setFormData({ ...formData, referido: e.target.value })}
            className="input-field"
            placeholder="Nombre de quien lo refirió (familiar, amigo, paciente...)"
          />
          <p className="text-xs text-gray-500 mt-1">Si el paciente viene referido por alguien, escriba el nombre aquí para aplicar descuento</p>
        </div>

        {/* Exámenes / Fotos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📷 Exámenes / Fotos (opcional)
          </label>
          <p className="text-xs text-gray-500 mb-3">Suba fotos de exámenes externos que el paciente traiga de otra parte</p>

          {/* Exámenes ya guardados */}
          {examenes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-green-700 mb-2">✅ Exámenes guardados ({examenes.length}):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {examenes.map((examen) => (
                  <div key={examen.id} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={examen.imagen}
                      alt={examen.nombre}
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => setPreviewImg(examen.imagen)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setPreviewImg(examen.imagen)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-lg transition-opacity"
                      >
                        <ZoomIn size={16} className="text-gray-700" />
                      </button>
                    </div>
                    <div className="p-1 flex items-center justify-between">
                      <span className="text-xs text-gray-600 truncate">{examen.nombre}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('¿Eliminar este examen?')) {
                            try {
                              await api.delete(`/examenes/${examen.id}`);
                              setExamenes(examenes.filter(e => e.id !== examen.id));
                            } catch (err) {
                              alert('Error al eliminar examen');
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevos exámenes por subir */}
          {nuevosExamenes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-blue-700 mb-2">📤 Pendientes de guardar ({nuevosExamenes.length}):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {nuevosExamenes.map((examen, idx) => (
                  <div key={idx} className="relative group border-2 border-blue-300 border-dashed rounded-lg overflow-hidden bg-blue-50">
                    <img
                      src={examen.imagen}
                      alt={examen.nombre}
                      className="w-full h-32 object-cover cursor-pointer"
                      onClick={() => setPreviewImg(examen.imagen)}
                    />
                    <div className="p-1 flex items-center justify-between">
                      <input
                        type="text"
                        value={examen.nombre}
                        onChange={(e) => {
                          const updated = [...nuevosExamenes];
                          updated[idx].nombre = e.target.value;
                          setNuevosExamenes(updated);
                        }}
                        className="text-xs border-none bg-transparent w-full focus:outline-none"
                        placeholder="Nombre del examen"
                      />
                      <button
                        type="button"
                        onClick={() => setNuevosExamenes(nuevosExamenes.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón para subir fotos */}
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Camera size={20} className="text-gray-500" />
            <span className="text-sm text-gray-600">Tomar foto o seleccionar imagen</span>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    setNuevosExamenes(prev => [...prev, {
                      nombre: file.name.replace(/\.[^/.]+$/, '') || 'Examen',
                      imagen: ev.target.result
                    }]);
                  };
                  reader.readAsDataURL(file);
                });
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {/* Modal de zoom de imagen */}
        {previewImg && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImg(null)}
          >
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
              onClick={() => setPreviewImg(null)}
            >
              <X size={24} />
            </button>
            <img
              src={previewImg}
              alt="Examen ampliado"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/historias')}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-success flex-1 flex items-center justify-center gap-2"
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
