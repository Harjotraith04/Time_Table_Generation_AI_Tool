import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Calendar, 
  Building2, 
  ArrowLeft,
  ArrowRight,
  Plus,
  Upload,
  Download,
  Edit2,
  Trash2,
  Save,
  X,
  MapPin,
  Users,
  Monitor,
  Beaker,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Layers,
  Home
} from 'lucide-react';
import { 
  getClassrooms, 
  createClassroom, 
  updateClassroom, 
  deleteClassroom,
  uploadCSV,
  exportData 
} from '../services/api';

const ClassroomsData = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  
  const [roomForm, setRoomForm] = useState({
    id: '',
    name: '',
    building: '',
    floor: '',
    capacity: '',
    type: '',
    features: [],
    availability: {
      monday: { available: true, startTime: '08:00', endTime: '18:00' },
      tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
      wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
      thursday: { available: true, startTime: '08:00', endTime: '18:00' },
      friday: { available: true, startTime: '08:00', endTime: '18:00' },
      saturday: { available: true, startTime: '08:00', endTime: '13:00' },
      sunday: { available: false, startTime: '08:00', endTime: '13:00' }
    },
    priority: 'medium',
    status: 'available'
  });

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildings = ['Engineering Block', 'CS Building', 'Science Block', 'Main Building', 'Arts Building'];
  const floors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
  const roomTypes = ['Lecture Hall', 'Tutorial Room', 'Computer Lab', 'Science Lab', 'Seminar Hall', 'Workshop'];
  const featuresList = [
    'Projector', 'Sound System', 'Air Conditioning', 'WiFi', 'Whiteboard', 
    'Smart Board', 'Computers', 'Lab Equipment', 'Safety Equipment', 
    'Ventilation', 'Storage', 'Stage', 'Microphone System'
  ];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Load classrooms data on component mount
  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const response = await getClassrooms();
      setClassrooms(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading classrooms:', err);
      setError('Failed to load classrooms data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/teachers-data');
  };

  const handleAddRoom = () => {
    setShowAddForm(true);
    setEditingRoom(null);
    setRoomForm({
      id: `R${String(classrooms.length + 1).padStart(3, '0')}`,
      name: '',
      building: '',
      floor: '',
      capacity: '',
      type: '',
      features: [],
      availability: {
        monday: { available: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
        thursday: { available: true, startTime: '08:00', endTime: '18:00' },
        friday: { available: true, startTime: '08:00', endTime: '18:00' },
        saturday: { available: true, startTime: '08:00', endTime: '13:00' },
        sunday: { available: false, startTime: '08:00', endTime: '13:00' }
      },
      priority: 'medium',
      status: 'available'
    });
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room.id);
    setRoomForm(room);
    setShowAddForm(true);
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await deleteClassroom(roomId);
      // Reload classrooms after deletion
      loadClassrooms();
    } catch (err) {
      console.error('Error deleting classroom:', err);
      alert('Failed to delete classroom: ' + err.message);
    }
  };

  const handleSaveRoom = async () => {
    try {
      console.log('Saving classroom data:', JSON.stringify(roomForm, null, 2));
      
      if (editingRoom) {
        await updateClassroom(editingRoom, roomForm);
      } else {
        await createClassroom(roomForm);
      }
      // Reload classrooms after save
      loadClassrooms();
      setShowAddForm(false);
      setEditingRoom(null);
    } catch (err) {
      console.error('Error saving classroom:', err);
      console.error('Failed data:', JSON.stringify(roomForm, null, 2));
      alert('Failed to save classroom: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = roomForm.features || [];
    if (currentFeatures.includes(feature)) {
      setRoomForm({
        ...roomForm,
        features: currentFeatures.filter(f => f !== feature)
      });
    } else {
      setRoomForm({
        ...roomForm,
        features: [...currentFeatures, feature]
      });
    }
  };

  const handleAvailabilityChange = (day, field, value) => {
    setRoomForm({
      ...roomForm,
      availability: {
        ...roomForm.availability,
        [day]: {
          ...roomForm.availability[day],
          [field]: value
        }
      }
    });
  };

  const getRoomTypeIcon = (type) => {
    switch (type) {
      case 'Computer Lab':
        return Monitor;
      case 'Science Lab':
        return Beaker;
      case 'Lecture Hall':
      case 'Seminar Hall':
        return GraduationCap;
      default:
        return Building2;
    }
  };

  const renderRoomForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room ID</label>
                <input
                  type="text"
                  value={roomForm.id}
                  onChange={(e) => setRoomForm({...roomForm, id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="R101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Lecture Hall A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Building</label>
                <select
                  value={roomForm.building}
                  onChange={(e) => setRoomForm({...roomForm, building: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Building</option>
                  {buildings.map(building => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Floor</label>
                <select
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Floor</option>
                  {floors.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                <input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="30"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Type</label>
                <select
                  value={roomForm.type}
                  onChange={(e) => setRoomForm({...roomForm, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <select
                  value={roomForm.priority}
                  onChange={(e) => setRoomForm({...roomForm, priority: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({...roomForm, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {featuresList.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomForm.features?.includes(feature) || false}
                    onChange={() => handleFeatureToggle(feature)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Schedule */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Availability</h4>
            <div className="space-y-3">
              {daysOfWeek.map(day => (
                <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-20">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {day}
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={roomForm.availability[day]?.available || false}
                      onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                  </label>
                  {roomForm.availability[day]?.available && (
                    <>
                      <input
                        type="time"
                        value={roomForm.availability[day]?.startTime || '08:00'}
                        onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      />
                      <span className="text-gray-500 dark:text-gray-400">to</span>
                      <input
                        type="time"
                        value={roomForm.availability[day]?.endTime || '18:00'}
                        onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => setShowAddForm(false)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveRoom}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingRoom ? 'Update' : 'Save'} Room</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRoomsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-100">Error Loading Classrooms</h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <button 
                onClick={loadClassrooms}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classrooms.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Available Rooms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {classrooms.filter(r => r.status === 'available').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Buildings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {[...new Set(classrooms.map(r => r.building))].length}
              </p>
            </div>
            <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {classrooms.reduce((sum, room) => sum + parseInt(room.capacity || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Classrooms & Labs</h3>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button 
                onClick={handleAddRoom}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type & Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {classrooms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Classrooms Found</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first classroom.</p>
                      <button 
                        onClick={handleAddRoom}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Room
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                classrooms.map((room) => {
                  const RoomIcon = getRoomTypeIcon(room.type);
                  return (
                    <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <RoomIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{room.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{room.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{room.building}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{room.floor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{room.type}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Capacity: {room.capacity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {room.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {feature}
                          </span>
                        ))}
                        {room.features.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
                            +{room.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        room.priority === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : room.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {room.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        room.status === 'available'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : room.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEditRoom(room)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Classrooms & Labs Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.name}</span>
              <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Classrooms & Labs</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage room details, capacity, and availability for timetable generation
              </p>
            </div>
            <button 
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teachers Data
            </button>
          </div>
        </div>

        <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Room Configuration</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Configure all classrooms, labs, and lecture halls with their capacity, features, and availability. 
                Ensure room information is accurate for optimal timetable scheduling.
              </p>
            </div>
          </div>
        </div>

        {renderRoomsList()}

        <div className="mt-8 flex justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button 
            onClick={() => navigate('/programs-data')}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Next: Programs & Courses
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && renderRoomForm()}
    </div>
  );
};
}

export default ClassroomsData;

