import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from '../services/api';
import { 
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
  Wifi,
  Volume2,
  Projector,
  Camera,
  Thermometer,
  Lightbulb,
  Shield,
  Loader
} from 'lucide-react';

const ClassroomsData = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch classrooms from API on component mount
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClassrooms();
      setClassrooms(response.data || response.classrooms || []);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError('Failed to load classrooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [roomForm, setRoomForm] = useState({
    id: '',
    name: '',
    building: '',
    floor: '',
    type: '',
    capacity: '',
    features: [],
    status: 'available',
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    }
  });

  const buildings = ['Main Building', 'Technology Building', 'Science Building', 'Engineering Building', 'Library Building'];
  const floors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
  const roomTypes = ['Lecture Hall', 'Tutorial Room', 'Computer Lab', 'Science Lab', 'Seminar Hall', 'Workshop'];
  const availableFeatures = [
    'Projector', 'Sound System', 'Air Conditioning', 'WiFi', 'Whiteboard',
    'Smart Board', 'Computers', 'Lab Equipment', 'Safety Equipment',
    'Ventilation', 'Storage', 'Stage', 'Microphone System'
  ];
  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

  const featureIcons = {
    'Projector': Projector,
    'Sound System': Volume2,
    'Air Conditioning': Thermometer,
    'WiFi': Wifi,
    'Whiteboard': Lightbulb,
    'Smart Board': Monitor,
    'Computers': Monitor,
    'Lab Equipment': Shield,
    'Safety Equipment': Shield,
    'Ventilation': Thermometer,
    'Storage': Building2,
    'Stage': Building2,
    'Microphone System': Volume2
  };

  const handleBack = () => {
    navigate('/teachers-data');
  };

  const handleNext = () => {
    navigate('/programs-data');
  };

  const handleAddRoom = async () => {
    try {
      setLoading(true);
      
      // Client-side validation
      if (!roomForm.id || !roomForm.name || !roomForm.building || !roomForm.floor || !roomForm.type || !roomForm.capacity) {
        alert('Please fill in all required fields: ID, Name, Building, Floor, Type, and Capacity');
        return;
      }

      console.log('Sending classroom data:', JSON.stringify(roomForm, null, 2));
      const response = await createClassroom(roomForm);
      await fetchClassrooms(); // Reload classrooms from API
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding classroom:', err);
      console.error('Failed data:', JSON.stringify(roomForm, null, 2));
      
      // Show detailed error message from server if available
      const errorMessage = err.response?.data?.errors 
        ? err.response.data.errors.map(e => e.msg).join(', ')
        : err.response?.data?.message || 'Failed to add classroom. Please try again.';
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room) => {
    setRoomForm(room);
    setEditingRoom(room._id || room.id);
    setShowAddForm(true);
  };

  const handleUpdateRoom = async () => {
    try {
      setLoading(true);
      await updateClassroom(editingRoom, roomForm);
      await fetchClassrooms(); // Reload classrooms from API
      resetForm();
      setShowAddForm(false);
      setEditingRoom(null);
    } catch (err) {
      console.error('Error updating classroom:', err);
      alert('Failed to update classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;
    
    try {
      setLoading(true);
      await deleteClassroom(roomId);
      await fetchClassrooms(); // Reload classrooms from API
    } catch (err) {
      console.error('Error deleting classroom:', err);
      alert('Failed to delete classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRoomForm({
      id: '',
      name: '',
      building: '',
      floor: '',
      type: '',
      capacity: '',
      features: [],
      status: 'available',
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: []
      }
    });
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

  const handleAvailabilityToggle = (day, timeSlot) => {
    const currentSlots = roomForm.availability[day] || [];
    if (currentSlots.includes(timeSlot)) {
      setRoomForm({
        ...roomForm,
        availability: {
          ...roomForm.availability,
          [day]: currentSlots.filter(slot => slot !== timeSlot)
        }
      });
    } else {
      setRoomForm({
        ...roomForm,
        availability: {
          ...roomForm.availability,
          [day]: [...currentSlots, timeSlot]
        }
      });
    }
  };

  const renderRoomForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </h3>
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingRoom(null);
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room ID</label>
                <input
                  type="text"
                  value={roomForm.id}
                  onChange={(e) => setRoomForm({...roomForm, id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="R101"
                  disabled={editingRoom} // Disable ID editing when updating
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Room 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Building</label>
                <select
                  value={roomForm.building}
                  onChange={(e) => setRoomForm({...roomForm, building: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Floor</option>
                  {floors.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Type</label>
                <select
                  value={roomForm.type}
                  onChange={(e) => setRoomForm({...roomForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Type</option>
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                <input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({...roomForm, capacity: parseInt(e.target.value) || ''})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="60"
                  min="1"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({...roomForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="reserved">Reserved</option>
                  <option value="out_of_order">Out of Order</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availableFeatures.map(feature => {
                const IconComponent = featureIcons[feature] || Shield;
                return (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={roomForm.features?.includes(feature) || false}
                      onChange={() => handleFeatureToggle(feature)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Room Availability</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Day
                    </th>
                    {timeSlots.map(slot => (
                      <th key={slot} className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.keys(roomForm.availability).map(day => (
                    <tr key={day}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {day}
                      </td>
                      {timeSlots.map(slot => (
                        <td key={`${day}-${slot}`} className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={roomForm.availability[day]?.includes(slot) || false}
                            onChange={() => handleAvailabilityToggle(day, slot)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingRoom(null);
              resetForm();
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={editingRoom ? handleUpdateRoom : handleAddRoom}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingRoom ? 'Update' : 'Add'} Room</span>
          </button>
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
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Classrooms & Labs</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Classrooms & Laboratories</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage room details, capacity, and availability for optimal space utilization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {classrooms.reduce((sum, room) => sum + room.capacity, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Buildings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(classrooms.map(room => room.building)).size}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Labs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {classrooms.filter(room => room.type.includes('Lab')).length}
                </p>
              </div>
              <Monitor className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rooms & Laboratories</h3>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add Room</span>
              </button>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && classrooms.length === 0 && (
            <div className="p-12 text-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading classrooms...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchClassrooms}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && classrooms.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No classrooms found. Add your first classroom to get started.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Classroom
              </button>
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && classrooms.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Room Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type & Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {classrooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{room.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{room.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{room.building}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{room.floor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{room.type}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{room.capacity} students</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {room.features.slice(0, 3).map((feature, index) => {
                          const IconComponent = featureIcons[feature] || Shield;
                          return (
                            <span key={index} className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                              <IconComponent className="w-3 h-3" />
                              <span>{feature}</span>
                            </span>
                          );
                        })}
                        {room.features.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                            +{room.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        room.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : room.status === 'Maintenance'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room._id || room.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back: Teachers Data
          </button>
          
          <button 
            onClick={handleNext}
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

export default ClassroomsData;
