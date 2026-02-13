import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  X, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Key, 
  Save,
  Users,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

export default function ConfiguracionUsuarios({ onClose }) {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lista'); // lista, nuevo, editar, password
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    password: '',
    confirmarPassword: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/auth/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoUsuario = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    try {
      await api.post('/auth/register', {
        usuario: formData.usuario,
        nombre: formData.nombre,
        password: formData.password
      });
      setSuccess('Usuario creado correctamente');
      setFormData({ usuario: '', nombre: '', password: '', confirmarPassword: '' });
      fetchUsuarios();
      setTimeout(() => {
        setActiveTab('lista');
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleEditarUsuario = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.put(`/auth/usuarios/${selectedUser.id}`, {
        usuario: formData.usuario,
        nombre: formData.nombre
      });
      setSuccess('Usuario actualizado correctamente');
      fetchUsuarios();
      setTimeout(() => {
        setActiveTab('lista');
        setSuccess('');
        setSelectedUser(null);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al actualizar usuario');
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.passwordNueva !== passwordForm.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.passwordNueva.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    try {
      const data = {
        passwordNueva: passwordForm.passwordNueva
      };
      
      // Si es el usuario actual, requerir contraseña actual
      if (selectedUser.id === usuarioActual.id) {
        data.passwordActual = passwordForm.passwordActual;
      }

      await api.put(`/auth/usuarios/${selectedUser.id}/password`, data);
      setSuccess('Contraseña cambiada correctamente');
      setPasswordForm({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
      setTimeout(() => {
        setActiveTab('lista');
        setSuccess('');
        setSelectedUser(null);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (id === usuarioActual.id) {
      setError('No puedes eliminar tu propio usuario');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      await api.delete(`/auth/usuarios/${id}`);
      setSuccess('Usuario eliminado correctamente');
      fetchUsuarios();
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const openEditMode = (user) => {
    setSelectedUser(user);
    setFormData({
      usuario: user.usuario,
      nombre: user.nombre,
      password: '',
      confirmarPassword: ''
    });
    setActiveTab('editar');
    setError('');
    setSuccess('');
  };

  const openPasswordMode = (user) => {
    setSelectedUser(user);
    setPasswordForm({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
    setActiveTab('password');
    setError('');
    setSuccess('');
  };

  const openNuevoMode = () => {
    setFormData({ usuario: '', nombre: '', password: '', confirmarPassword: '' });
    setActiveTab('nuevo');
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={28} />
              <h2 className="text-2xl font-bold">Configuración de Usuarios</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              ✓ {success}
            </div>
          )}

          {/* Tabs */}
          {activeTab === 'lista' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">Usuarios del Sistema</h3>
                <button
                  onClick={openNuevoMode}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <UserPlus size={20} />
                  Nuevo Usuario
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {usuarios.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{user.nombre}</p>
                        <p className="text-sm text-gray-500">@{user.usuario}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditMode(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openPasswordMode(user)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Key size={18} />
                        </button>
                        {user.id !== usuarioActual.id && (
                          <button
                            onClick={() => handleEliminarUsuario(user.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Nuevo Usuario Form */}
          {activeTab === 'nuevo' && (
            <form onSubmit={handleNuevoUsuario} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  type="button"
                  onClick={() => setActiveTab('lista')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Volver
                </button>
                <h3 className="text-lg font-semibold text-gray-700">Crear Nuevo Usuario</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="input-field"
                  placeholder="Ej: Jorge Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario de ingreso
                </label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({...formData, usuario: e.target.value.toLowerCase()})}
                  className="input-field"
                  placeholder="Ej: jorge"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field pr-10"
                    placeholder="Mínimo 4 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmarPassword}
                  onChange={(e) => setFormData({...formData, confirmarPassword: e.target.value})}
                  className="input-field"
                  placeholder="Repetir contraseña"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <Save size={20} />
                Crear Usuario
              </button>
            </form>
          )}

          {/* Editar Usuario Form */}
          {activeTab === 'editar' && selectedUser && (
            <form onSubmit={handleEditarUsuario} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  type="button"
                  onClick={() => { setActiveTab('lista'); setSelectedUser(null); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Volver
                </button>
                <h3 className="text-lg font-semibold text-gray-700">Editar Usuario</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario de ingreso
                </label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({...formData, usuario: e.target.value.toLowerCase()})}
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <Save size={20} />
                Guardar Cambios
              </button>
            </form>
          )}

          {/* Cambiar Contraseña Form */}
          {activeTab === 'password' && selectedUser && (
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  type="button"
                  onClick={() => { setActiveTab('lista'); setSelectedUser(null); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Volver
                </button>
                <h3 className="text-lg font-semibold text-gray-700">
                  Cambiar Contraseña - {selectedUser.nombre}
                </h3>
              </div>

              {selectedUser.id === usuarioActual.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.passwordActual}
                    onChange={(e) => setPasswordForm({...passwordForm, passwordActual: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.passwordNueva}
                    onChange={(e) => setPasswordForm({...passwordForm, passwordNueva: e.target.value})}
                    className="input-field pr-10"
                    placeholder="Mínimo 4 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirmarPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmarPassword: e.target.value})}
                  className="input-field"
                  placeholder="Repetir contraseña"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <Key size={20} />
                Cambiar Contraseña
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
