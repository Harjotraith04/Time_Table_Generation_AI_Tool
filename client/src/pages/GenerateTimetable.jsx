import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import AdminSidebar from '../components/AdminSidebar';
import Chatbot from '../components/Chatbot';
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
  CheckCircle2,
  LogOut,
  Bell
} from 'lucide-react';
import { 
  generateTimetable, 
  getTimetableProgress, 
  validateData, 
  getAlgorithms, 
  getConstraints,
  getOptimizationGoals,
  validateAlgorithmParameters,
  getAllTimetableData
} from '../services/api';

const GenerateTimetable = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
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
    algorithm: 'hybrid', // Changed from 'greedy' to 'hybrid' for better results
    maxIterations: 200, // Reduced from 1000 for faster generation
    populationSize: 50, // Reduced from 100 for faster generation
    crossoverRate: 0.8,
    mutationRate: 0.15, // Increased from 0.1 for better exploration
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
      const [algorithmsResponse, constraintsResponse, goalsResponse, allDataResponse] = await Promise.all([
        getAlgorithms(),
        getConstraints(),
        getOptimizationGoals(),
        getAllTimetableData()
      ]);

      setAlgorithmsData(algorithmsResponse.data?.algorithms || []);
      setConstraintsData(constraintsResponse.data || {});
      setOptimizationGoalsData(goalsResponse.data || []);
      
      // Use the consolidated endpoint data to populate validation status
      if (allDataResponse.success) {
        const data = allDataResponse.data;
        const stats = allDataResponse.statistics;
        
        setDataValidation({
          teachers: { 
            status: stats.totalTeachers > 0 ? 'completed' : 'warning', 
            count: stats.totalTeachers, 
            issues: 0 
          },
          classrooms: { 
            status: stats.totalClassrooms > 0 ? 'completed' : 'warning', 
            count: stats.totalClassrooms, 
            issues: 0 
          },
          courses: { 
            status: stats.totalCourses > 0 ? 'completed' : 'warning', 
            count: stats.totalCourses, 
            issues: 0 
          },
          programs: { 
            status: stats.totalPrograms > 0 ? 'completed' : 'warning', 
            count: stats.totalPrograms, 
            issues: 0 
          },
          divisions: { 
            status: stats.totalDivisions > 0 ? 'completed' : 'warning', 
            count: stats.totalDivisions, 
            issues: 0 
          },
          policies: { 
            status: stats.configExists ? 'completed' : 'warning', 
            count: stats.configExists ? 1 : 0, 
            issues: 0 
          },
          calendar: { 
            status: stats.totalHolidays > 0 ? 'completed' : 'warning', 
            count: stats.totalHolidays, 
            issues: 0 
          },
          overall: { 
            status: allDataResponse.validationStatus.readyForGeneration ? 'completed' : 'warning', 
            ready: allDataResponse.validationStatus.readyForGeneration 
          }
        });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Set default data structure if API fails
      setDataValidation({
        teachers: { status: 'unknown', count: 0, issues: 0 },
        classrooms: { status: 'unknown', count: 0, issues: 0 },
        courses: { status: 'unknown', count: 0, issues: 0 },
        overall: { status: 'unknown', ready: false }
      });
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

  // Use algorithmsData and optimizationGoalsData from API
  const algorithms = algorithmsData.length > 0 ? algorithmsData : [
    { 
      id: 'greedy', 
      name: 'Greedy Scheduler (Fast)', 
      description: 'Quick scheduling with simple heuristics - Recommended for testing',
      pros: ['Very fast (< 1 second)', 'Simple', 'Good for small to medium schedules'],
      cons: ['May not find optimal solution', 'Limited optimization']
    },
    { 
      id: 'genetic', 
      name: 'Genetic Algorithm', 
      description: 'Best for complex schedules with many constraints',
      pros: ['Handles complex constraints', 'Good optimization', 'Scalable'],
      cons: ['Longer generation time', 'May need parameter tuning']
    },
    { 
      id: 'csp', 
      name: 'CSP Solver', 
      description: 'Fast and reliable constraint satisfaction',
      pros: ['Fast generation', 'Guaranteed solution', 'Handles constraints well'],
      cons: ['May struggle with optimization', 'Less flexible']
    },
    { 
      id: 'hybrid', 
      name: 'Hybrid CSP-GA', 
      description: 'Best of both worlds - feasibility and optimization',
      pros: ['High quality solutions', 'Robust performance', 'Adaptive'],
      cons: ['More complex', 'Higher computation time']
    }
  ];

  const optimizationGoals = optimizationGoalsData.length > 0 ? optimizationGoalsData : [
    { id: 'minimize_conflicts', name: 'Minimize Conflicts', description: 'Reduce scheduling conflicts' },
    { id: 'balanced_schedule', name: 'Balanced Schedule', description: 'Distribute classes evenly' },
    { id: 'teacher_preferences', name: 'Teacher Preferences', description: 'Respect teacher availability' },
    { id: 'resource_optimization', name: 'Resource Optimization', description: 'Optimize room utilization' },
    { id: 'student_convenience', name: 'Student Convenience', description: 'Minimize gaps for students' }
  ];

  const handleBack = () => {
    navigate('/infrastructure-data');
  };

  const handleTestAPI = async () => {
    try {
      console.clear(); // Clear console for better readability
      console.log('====================================');
      console.log('🧪 TESTING API ENDPOINT');
      console.log('====================================');
      console.log('Endpoint: GET /api/data/all-timetable-data');
      console.log('');
      
      const response = await getAllTimetableData();
      
      console.log('✅ API TEST SUCCESSFUL!');
      console.log('');
      console.log('📊 FULL RESPONSE:');
      console.log(response);
      console.log('');
      console.log('====================================');
      
      alert('API test successful! Check the console (F12) for detailed response.');
    } catch (error) {
      console.error('====================================');
      console.error('❌ API TEST FAILED');
      console.error('Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('====================================');
      alert('API test failed! Check the console (F12) for error details.');
    }
  };

  const handleStartGeneration = async () => {
    try {
      console.log('====================================');
      console.log('🚀 TIMETABLE GENERATION STARTED');
      console.log('====================================');

      if (!dataValidation.overall.ready) {
        alert('Please ensure all data is valid before generating timetable');
        return;
      }

      setIsGenerating(true);
      setGenerationStep(0);
      setGenerationComplete(false);

      console.log('📡 Fetching all timetable data from API...');
      
      // Fetch all timetable data from the new consolidated endpoint
      const allDataResponse = await getAllTimetableData();
      
      console.log('✅ API Response Received:');
      console.log('📊 Full Response Object:', allDataResponse);
      console.log('');
      
      // Log statistics
      console.log('📈 STATISTICS:');
      console.table(allDataResponse.statistics);
      console.log('');
      
      // Log data counts
      console.log('📦 DATA SUMMARY:');
      console.log(`  👨‍🎓 Students: ${allDataResponse.data.students?.length || 0}`);
      console.log(`  👨‍🏫 Teachers: ${allDataResponse.data.teachers?.length || 0}`);
      console.log(`  🏫 Classrooms: ${allDataResponse.data.classrooms?.length || 0}`);
      console.log(`  📚 Programs: ${allDataResponse.data.programs?.length || 0}`);
      console.log(`  📋 Divisions: ${allDataResponse.data.divisions?.length || 0}`);
      console.log(`  📖 Courses: ${allDataResponse.data.courses?.length || 0}`);
      console.log(`  🗓️ Holidays: ${allDataResponse.data.holidays?.length || 0}`);
      console.log(`  ⚙️ System Config: ${allDataResponse.data.systemConfig ? '✓ Exists' : '✗ Missing'}`);
      console.log('');
      
      // Log detailed data
      console.log('📄 DETAILED DATA:');
      console.log('Students Data:', allDataResponse.data.students);
      console.log('Teachers Data:', allDataResponse.data.teachers);
      console.log('Classrooms Data:', allDataResponse.data.classrooms);
      // Log each classroom's status field
      if (allDataResponse.data.classrooms && allDataResponse.data.classrooms.length > 0) {
        console.log('🏫 CLASSROOM STATUS DETAILS:');
        allDataResponse.data.classrooms.forEach((classroom, index) => {
          console.log(`  Classroom ${index + 1}: ${classroom.name} (${classroom.id}) - Status: "${classroom.status}"`);
        });
      }
      console.log('Programs Data:', allDataResponse.data.programs);
      console.log('Divisions Data:', allDataResponse.data.divisions);
      console.log('Courses Data:', allDataResponse.data.courses);
      console.log('Holidays Data:', allDataResponse.data.holidays);
      console.log('System Config:', allDataResponse.data.systemConfig);
      console.log('');
      
      // Check if data fetch was successful
      if (!allDataResponse.success) {
        console.error('❌ Failed to fetch timetable data');
        throw new Error('Failed to fetch timetable data');
      }

      // Log validation status
      console.log('✔️ VALIDATION STATUS:');
      console.log(`  Ready for Generation: ${allDataResponse.validationStatus.readyForGeneration ? '✅ YES' : '❌ NO'}`);
      console.log(`  Errors: ${allDataResponse.validationStatus.errors.length}`);
      console.log(`  Warnings: ${allDataResponse.validationStatus.warnings.length}`);
      
      if (allDataResponse.validationStatus.errors.length > 0) {
        console.error('❌ ERRORS:', allDataResponse.validationStatus.errors);
      }
      
      if (allDataResponse.validationStatus.warnings.length > 0) {
        console.warn('⚠️ WARNINGS:', allDataResponse.validationStatus.warnings);
      }
      console.log('');

      // Check validation status
      if (!allDataResponse.validationStatus.readyForGeneration) {
        const errors = allDataResponse.validationStatus.errors.join('\n');
        console.error('🛑 Cannot proceed with generation. Errors:', errors);
        alert(`Cannot generate timetable:\n${errors}`);
        setIsGenerating(false);
        return;
      }

      // Show warnings if any
      if (allDataResponse.validationStatus.warnings.length > 0) {
        const warnings = allDataResponse.validationStatus.warnings.join('\n');
        console.warn('⚠️ Timetable generation warnings:', warnings);
      }

      // Prepare generation data with all the fetched data
      const generationData = {
        name: timetableData.name,
        academicYear: timetableData.academicYear,
        semester: timetableData.semester,
        department: timetableData.department,
        year: timetableData.year,
        // Include all fetched data
        allData: allDataResponse.data,
        statistics: allDataResponse.statistics,
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

      console.log('🔧 GENERATION DATA PREPARED:');
      console.log('Generation Settings:', generationData.settings);
      console.log('Full Generation Data:', generationData);
      console.log('');

      // Start generation
      console.log('🎯 Starting timetable generation...');
      const response = await generateTimetable(generationData);
      console.log('✅ Generation Response:', response);
      console.log('====================================');
      setCurrentTimetableId(response.timetableId);

      // Start polling for progress
      pollProgress(response.timetableId);

    } catch (error) {
      console.error('====================================');
      console.error('❌ ERROR OCCURRED:');
      console.error('Error Object:', error);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('====================================');
      alert('Failed to start timetable generation: ' + error.message);
      setIsGenerating(false);
    }
  };

  const pollProgress = async (timetableId) => {
    console.log('[POLLING] Starting progress polling for timetableId:', timetableId);
    let pollCount = 0;
    
    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`[POLLING #${pollCount}] Fetching progress for timetableId:`, timetableId);
        
        const response = await getTimetableProgress(timetableId);
        const progress = response.data || response;
        
        console.log(`[POLLING #${pollCount}] Progress received:`, {
          status: progress.status,
          percentage: progress.progress?.percentage,
          currentStep: progress.progress?.currentStep,
          fullResponse: progress
        });
        
        setProgressData(progress);

        if (progress.progress) {
          const percentage = progress.progress.percentage || 0;
          setGenerationStep(Math.min((percentage / 100) * generationSteps.length, generationSteps.length));
          console.log(`[POLLING #${pollCount}] Updated UI step to:`, Math.min((percentage / 100) * generationSteps.length, generationSteps.length));
        }

        if (progress.status === 'completed') {
          console.log('[POLLING] ✅ Generation COMPLETED!');
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGenerationComplete(true);
          setGenerationStep(generationSteps.length);
        } else if (progress.status === 'draft' || progress.status === 'failed') {
          console.log('[POLLING] ❌ Generation FAILED:', progress.status);
          clearInterval(pollInterval);
          setIsGenerating(false);
          alert('Timetable generation failed. Please try again.');
        } else {
          console.log(`[POLLING #${pollCount}] Still generating... status: ${progress.status}, step: ${progress.progress?.currentStep}`);
        }
      } catch (error) {
        console.error(`[POLLING #${pollCount}] ❌ Error polling progress:`, error);
        clearInterval(pollInterval);
        setIsGenerating(false);
        alert('Error checking generation progress. Please try again.');
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
        {Object.entries(dataValidation).filter(([key]) => key !== 'overall').map(([key, data]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                data.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 
                data.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {data.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : data.status === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {data.count || 0} items • {data.issues || 0} issues
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              data.status === 'completed' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : data.status === 'warning'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {data.status || 'Unknown'}
            </span>
          </div>
        ))}
      </div>
      
      {Object.values(dataValidation).some(d => (d.issues || 0) > 0) && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Minor Issues Detected</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Some minor issues were found in the data. The timetable generation can proceed, 
                but you may want to review and fix these issues for optimal results.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {dataValidation.overall?.ready && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Ready for Generation</h4>
              <p className="text-green-700 dark:text-green-300 text-sm">
                All required data is validated and ready for timetable generation.
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b shadow-sm ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Generate Timetable
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create optimized schedules automatically
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <Bell className="w-5 h-5" />
              </button>
              <button className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}>
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Timetable Generation</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Generate optimized timetables using artificial intelligence algorithms
              </p>
            </div>
            <button 
              onClick={handleTestAPI}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Test API Endpoint
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
                  disabled={!dataValidation.overall?.ready}
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
        </main>
      </div>

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
};

export default GenerateTimetable;
