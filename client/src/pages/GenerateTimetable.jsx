import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Calendar, 
  Zap, 
  ArrowLeft,
  ArrowRight,
  Play,
  RefreshCw,
  Settings,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Building2,
  BookOpen,
  Activity,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  generateTimetable, 
  getTimetableProgress, 
  validateData, 
  getAlgorithms, 
  getConstraints,
  getOptimizationGoals,
  validateAlgorithmParameters
} from '../services/api';

const GenerateTimetable = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [currentTimetableId, setCurrentTimetableId] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [algorithmsData, setAlgorithmsData] = useState([]);
  const [constraintsData, setConstraintsData] = useState([]);
  const [optimizationGoalsData, setOptimizationGoalsData] = useState([]);
  
  const [generationSettings, setGenerationSettings] = useState({
    algorithm: 'genetic',
    maxIterations: 1000,
    populationSize: 100,
    crossoverRate: 0.8,
    mutationRate: 0.1,
    optimizationGoals: ['minimize_conflicts', 'balanced_schedule', 'teacher_preferences'],
    allowBackToBack: true,
    enforceBreaks: true,
    balanceWorkload: true,
    prioritizePreferences: false
  });

  const [dataValidation, setDataValidation] = useState({
    teachers: { status: 'unknown', count: 0, issues: [] },
    classrooms: { status: 'unknown', count: 0, issues: [] },
    programs: { status: 'unknown', count: 0, issues: [] },
    courses: { status: 'unknown', count: 0, issues: [] },
    policies: { status: 'unknown', count: 0, issues: [] },
    calendar: { status: 'unknown', count: 0, issues: [] },
    overall: { status: 'unknown', ready: false }
  });

  const [timetableData, setTimetableData] = useState({
    name: `Timetable ${new Date().getFullYear()}`,
    academicYear: '2024-2025',
    semester: 1,
    department: 'Computer Science',
    year: 1
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [algorithmsData, constraintsData, goalsData, validationData] = await Promise.all([
        getAlgorithms(),
        getConstraints(),
        getOptimizationGoals(),
        validateData()
      ]);

      setAlgorithmsData(algorithmsData.algorithms || []);
      setConstraintsData(constraintsData.constraints || []);
      setOptimizationGoalsData(goalsData.goals || []);
      setDataValidation(validationData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const generationSteps = [
    { id: 1, name: 'Data Validation', description: 'Validating input data and constraints' },
    { id: 2, name: 'Conflict Detection', description: 'Identifying potential scheduling conflicts' },
    { id: 3, name: 'Algorithm Initialization', description: 'Setting up optimization algorithm' },
    { id: 4, name: 'Schedule Generation', description: 'Generating optimal timetable' },
    { id: 5, name: 'Constraint Verification', description: 'Verifying all constraints are met' },
    { id: 6, name: 'Optimization', description: 'Fine-tuning the schedule' },
    { id: 7, name: 'Final Validation', description: 'Performing final quality checks' }
  ];

  const algorithms = [
    { 
      id: 'genetic', 
      name: 'Genetic Algorithm', 
      description: 'Best for complex schedules with many constraints',
      pros: ['Handles complex constraints', 'Good optimization', 'Scalable'],
      cons: ['Longer generation time', 'May need parameter tuning']
    },
    { 
      id: 'backtracking', 
      name: 'Backtracking', 
      description: 'Fast and reliable for smaller datasets',
      pros: ['Fast generation', 'Guaranteed solution', 'Simple'],
      cons: ['May struggle with large datasets', 'Less optimization']
    },
    { 
      id: 'simulated_annealing', 
      name: 'Simulated Annealing', 
      description: 'Good balance between speed and optimization',
      pros: ['Good optimization', 'Handles local minima', 'Flexible'],
      cons: ['Requires parameter tuning', 'Variable results']
    }
  ];

  const optimizationGoals = [
    { id: 'minimize_conflicts', name: 'Minimize Conflicts', description: 'Reduce scheduling conflicts' },
    { id: 'balanced_schedule', name: 'Balanced Schedule', description: 'Distribute classes evenly' },
    { id: 'teacher_preferences', name: 'Teacher Preferences', description: 'Respect teacher availability' },
    { id: 'resource_optimization', name: 'Resource Optimization', description: 'Optimize room utilization' },
    { id: 'student_convenience', name: 'Student Convenience', description: 'Minimize gaps for students' }
  ];

  const handleBack = () => {
    navigate('/infrastructure-data');
  };

  const handleStartGeneration = async () => {
    try {
      if (!dataValidation.overall.ready) {
        alert('Please ensure all data is valid before generating timetable');
        return;
      }

      setIsGenerating(true);
      setGenerationStep(0);
      setGenerationComplete(false);

      // Prepare generation data
      const generationData = {
        name: timetableData.name,
        academicYear: timetableData.academicYear,
        semester: timetableData.semester,
        department: timetableData.department,
        year: timetableData.year,
        settings: {
          algorithm: generationSettings.algorithm,
          populationSize: generationSettings.populationSize,
          maxGenerations: generationSettings.maxIterations,
          crossoverRate: generationSettings.crossoverRate,
          mutationRate: generationSettings.mutationRate,
          optimizationGoals: generationSettings.optimizationGoals,
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 60,
          breakSlots: ['12:00-13:00'],
          enforceBreaks: generationSettings.enforceBreaks,
          balanceWorkload: generationSettings.balanceWorkload
        }
      };

      // Start generation
      const response = await generateTimetable(generationData);
      setCurrentTimetableId(response.timetableId);

      // Start polling for progress
      pollProgress(response.timetableId);

    } catch (error) {
      console.error('Error starting generation:', error);
      alert('Failed to start timetable generation: ' + error.message);
      setIsGenerating(false);
    }
  };

  const pollProgress = async (timetableId) => {
    const pollInterval = setInterval(async () => {
      try {
        const progress = await getTimetableProgress(timetableId);
        setProgressData(progress);

        if (progress.progress) {
          setGenerationStep(Math.min(progress.progress.generation / 100, generationSteps.length));
        }

        if (progress.status === 'completed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGenerationComplete(true);
          setGenerationStep(generationSteps.length);
        } else if (progress.status === 'draft') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          alert('Timetable generation failed. Please try again.');
        }
      } catch (error) {
        console.error('Error polling progress:', error);
        clearInterval(pollInterval);
        setIsGenerating(false);
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleViewTimetable = () => {
    if (currentTimetableId) {
      navigate(`/view-timetable/${currentTimetableId}`);
    } else {
      navigate('/view-timetable');
    }
  };

  const handleRegenerateWithSettings = () => {
    setGenerationComplete(false);
    handleStartGeneration();
  };

  const handleOptimizationGoalToggle = (goalId) => {
    const currentGoals = generationSettings.optimizationGoals;
    if (currentGoals.includes(goalId)) {
      setGenerationSettings({
        ...generationSettings,
        optimizationGoals: currentGoals.filter(g => g !== goalId)
      });
    } else {
      setGenerationSettings({
        ...generationSettings,
        optimizationGoals: [...currentGoals, goalId]
      });
    }
  };

  const renderDataValidation = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Validation Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(dataValidation).map(([key, data]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                data.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'
              }`}>
                {data.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data.count} items • {data.issues} issues
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              data.status === 'completed' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {data.status}
            </span>
          </div>
        ))}
      </div>
      
      {Object.values(dataValidation).some(d => d.issues > 0) && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Minor Issues Detected</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Some minor issues were found in the course data. The timetable generation can proceed, 
                but you may want to review and fix these issues for optimal results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAlgorithmSelection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Algorithm Selection</h3>
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <Settings className="w-4 h-4" />
          <span>Advanced Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {algorithms.map((algorithm) => (
          <div 
            key={algorithm.id}
            onClick={() => setGenerationSettings({...generationSettings, algorithm: algorithm.id})}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              generationSettings.algorithm === algorithm.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{algorithm.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{algorithm.description}</p>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Advantages:</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {algorithm.pros.map((pro, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">Considerations:</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {algorithm.cons.map((con, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdvancedSettings && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Advanced Algorithm Parameters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Iterations
                </label>
                <input
                  type="number"
                  value={generationSettings.maxIterations}
                  onChange={(e) => setGenerationSettings({...generationSettings, maxIterations: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {generationSettings.algorithm === 'genetic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Population Size
                    </label>
                    <input
                      type="number"
                      value={generationSettings.populationSize}
                      onChange={(e) => setGenerationSettings({...generationSettings, populationSize: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Crossover Rate
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={generationSettings.crossoverRate}
                      onChange={(e) => setGenerationSettings({...generationSettings, crossoverRate: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mutation Rate
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={generationSettings.mutationRate}
                      onChange={(e) => setGenerationSettings({...generationSettings, mutationRate: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Optimization Goals</h5>
              <div className="space-y-2">
                {optimizationGoals.map((goal) => (
                  <label key={goal.id} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generationSettings.optimizationGoals.includes(goal.id)}
                      onChange={() => handleOptimizationGoalToggle(goal.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{goal.name}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{goal.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Options</h5>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generationSettings.allowBackToBack}
                    onChange={(e) => setGenerationSettings({...generationSettings, allowBackToBack: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Allow back-to-back classes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generationSettings.enforceBreaks}
                    onChange={(e) => setGenerationSettings({...generationSettings, enforceBreaks: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enforce break times</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generationSettings.balanceWorkload}
                    onChange={(e) => setGenerationSettings({...generationSettings, balanceWorkload: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Balance teacher workload</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGenerationProgress = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timetable Generation Progress</h3>
        <div className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
          <span className="text-sm text-blue-600 dark:text-blue-400">Generating...</span>
        </div>
      </div>

      <div className="space-y-4">
        {generationSteps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              index < generationStep 
                ? 'bg-green-500 text-white'
                : index === generationStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {index < generationStep ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : index === generationStep ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                index <= generationStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
            </div>
            {index < generationStep && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round((generationStep / generationSteps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(generationStep / generationSteps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const renderGenerationComplete = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Timetable Generated Successfully!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your timetable has been generated and optimized according to your preferences and constraints.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Teachers Scheduled</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">12/12</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rooms Utilized</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">23/25</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Conflicts Resolved</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">100%</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleViewTimetable}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Eye className="w-4 h-4" />
            <span>View Timetable</span>
          </button>
          <button
            onClick={() => navigate('/view-timetable')}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handleRegenerateWithSettings}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Regenerate</span>
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
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Generate Timetable</h1>
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Timetable Generation</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Generate optimized timetables using artificial intelligence algorithms
              </p>
            </div>
            <button 
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Infrastructure Data
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Data Validation */}
          {!isGenerating && !generationComplete && renderDataValidation()}

          {/* Algorithm Selection */}
          {!isGenerating && !generationComplete && renderAlgorithmSelection()}

          {/* Generation Progress */}
          {isGenerating && renderGenerationProgress()}

          {/* Generation Complete */}
          {generationComplete && renderGenerationComplete()}

          {/* Generation Controls */}
          {!isGenerating && !generationComplete && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Generate</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All data has been validated and algorithm settings are configured. 
                    Click "Generate Timetable" to start the process.
                  </p>
                </div>
                <button
                  onClick={handleStartGeneration}
                  disabled={Object.values(dataValidation).some(d => d.status !== 'completed')}
                  className="flex items-center space-x-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
                >
                  <Zap className="w-5 h-5" />
                  <span>Generate Timetable</span>
                </button>
              </div>
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
            Back
          </button>
          
          {generationComplete && (
            <button 
              onClick={handleViewTimetable}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View Generated Timetable
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateTimetable;
