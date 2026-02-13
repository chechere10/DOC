import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { StickyNote, Save, ArrowLeft, Calendar, Clock } from 'lucide-react';

export default function NotaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    contenido: '',
    estado: 'abierta'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchNota();
    }
  }, [id]);

  const fetchNota = async () => {
    try {
      const res = await api.get(`/notas/${id}`);
      setFormData({
        fecha: new Date(res.data.fecha).toISOString().split('T')[0],
        hora: res.data.hora,
        contenido: res.data.contenido,
        estado: res.data.estado
      });
    } catch (error) {
      setError('Error al cargar nota');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        fecha: new Date(formData.fecha).toISOString(),
        hora: formData.hora,
        contenido: formData.contenido,
        estado: formData.estado
      };

      if (isEdit) {
        await api.put(`/notas/${id}`, data);
      } else {
        await api.post('/notas', data);
      }

      navigate('/notas');
    } catch (error) {
      setError(error.response?.data?.error || 'Error al guardar nota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/notas')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <StickyNote className="text-orange-500" />
            {isEdit ? 'Editar Nota' : 'Nueva Nota'}
          </h1>
          <p className="text-gray-500">
            {isEdit ? 'Modifique los datos de la nota' : 'Complete los datos de la nueva nota'}
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

        {/* Fecha y hora */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                Fecha *
              </span>
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Clock size={16} />
                Hora *
              </span>
            </label>
            <input
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nota *
          </label>
          <textarea
            value={formData.contenido}
            onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
            className="input-field min-h-[200px] resize-y"
            placeholder="Escriba el contenido de la nota..."
            required
          />
        </div>

        {/* Estado (solo en edición) */}
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="input-field"
            >
              <option value="abierta">Abierta</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/notas')}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary bg-orange-500 hover:bg-orange-600 flex-1 flex items-center justify-center gap-2"
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
