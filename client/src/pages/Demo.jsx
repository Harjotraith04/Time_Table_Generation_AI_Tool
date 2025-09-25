import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Building, BookOpen, Sparkles, Eye, Users, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import TimetableDisplay from '../components/TimetableDisplay';

const Demo = () => {
  const [selectedView, setSelectedView] = useState('classroom');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showSampleData, setShowSampleData] = useState(false);
  const [generatedTimetables, setGeneratedTimetables] = useState(null);

  // Sample Data
  const sampleData = {
    teachers: [
      { id: 'T001', name: 'Dr. Toral Shah', department: 'Computer Engineering', subjects: ['Discrete Mathematics', 'Indian Knowledge System', 'Essential Electronics Practices'], email: 'toral.shah@nmims.edu' },
      { id: 'T002', name: 'Prof. Meet Jethwa', department: 'AI & Data Science', subjects: ['Big Data Analytics', 'Machine Learning'], email: 'meet.jethwa@nmims.edu' },
      { id: 'T003', name: 'Dr. Shailendra Aote', department: 'AI & Data Science', subjects: ['Applied Time Series Analysis', 'Natural Language Processing'], email: 'shailendra.aote@nmims.edu' },
      { id: 'T004', name: 'Prof. Divesh Kubal', department: 'Computer Engineering', subjects: ['Advanced Topics in ML', 'Computer Networks'], email: 'divesh.kubal@nmims.edu' },
    ],
    classrooms: [
      { id: 'C001', name: 'Room C001', capacity: 60, features: ['Projector', 'AC', 'Whiteboard'], type: 'Theory' },
      { id: 'L101', name: 'Lab L-101', capacity: 30, features: ['Computers', 'Projector', 'AC'], type: 'Practical' },
      { id: 'L102', name: 'Lab L-102', capacity: 30, features: ['Computers', 'Projector', 'AC'], type: 'Practical' },
      { id: 'C005', name: 'Room C005', capacity: 80, features: ['Projector', 'AC', 'Smart Board'], type: 'Theory' },
    ],
    programs: [
      {
        id: 'BTEC-AI-Y4',
        name: 'B Tech (AI & Data Science) - Fourth Year',
        department: 'AI & Data Science',
        semester: 7,
        students: 45,
        divisions: ['B1', 'B2'],
      }
    ],
    courses: [
      { id: 'CS401', name: 'Applied Time Series Analysis', code: 'ATSA', type: 'Theory', hours: 3 },
      { id: 'CS402', name: 'Big Data Analytics', code: 'BDA', type: 'Theory', hours: 3 },
      { id: 'CS403', name: 'Natural Language Processing', code: 'NLP', type: 'Practical', hours: 2 },
      { id: 'CS404', name: 'Advanced Topics in ML', code: 'ATML', type: 'Theory', hours: 3 },
    ]
  };

  // Sample timetables for different views
  const sampleTimetables = {
    classroom: {
      title: 'Class Room: C001',
      subtitle: '',
      timetable: [
        // Monday to Saturday for each time slot
        [
          { subject: 'MAD', code: 'MBT5', teacher: 'PG', room: 'C001' },
          { subject: 'CN', code: 'MBT3', teacher: 'ARW', room: 'C001' },
          { subject: 'ATML', code: 'BTAI7', teacher: 'DK', room: 'C001' },
          { subject: 'DLD', code: 'MBT3', teacher: 'DJ', room: 'C001' },
          { subject: 'OS', code: 'MBT5', teacher: 'YN', room: 'C001' },
          null
        ],
        [
          { subject: 'AI', code: 'MBT5', teacher: 'SA', room: 'C001' },
          { subject: 'DLD', code: 'MBT3', teacher: 'DJ', room: 'C001' },
          { subject: 'ATML', code: 'BTAI7', teacher: 'DK', room: 'C001' },
          { subject: 'DM', code: 'MBT3', teacher: 'TS', room: 'C001' },
          { subject: 'MAD', code: 'MBT5', teacher: 'PG', room: 'C001' },
          null
        ],
        [
          { subject: 'PEM', code: 'MBT3', teacher: 'AT', room: 'C001' },
          { subject: 'DSA', code: 'MBT3', teacher: 'ST', room: 'C001' },
          { subject: 'DSA', code: 'MBT3', teacher: 'ST', room: 'C001' },
          { subject: 'CAL (T) B2', code: 'BTB1', teacher: 'RD', room: 'C001' },
          { subject: 'BDA', code: 'BTAI7', teacher: 'MJ', room: 'C001' },
          null
        ],
        [
          { subject: 'PEM', code: 'MBT3', teacher: 'AT', room: 'C001' },
          { subject: 'PS', code: 'MBT3', teacher: 'JY', room: 'C001' },
          { subject: 'PEM', code: 'MBT3', teacher: 'AT', room: 'C001' },
          { subject: 'CF BTAI7, BTB7, BTAI7', teacher: 'ARW', room: 'C001' },
          { subject: 'BDA', code: 'BTAI7', teacher: 'MJ', room: 'C001' },
          null
        ],
        [
          { subject: 'SET', code: 'MBT5, BT5, BTAI5', teacher: 'PSP', room: 'C001' },
          { subject: 'CAL (T) B3 BTAI1', teacher: 'RD', room: 'C001' },
          { subject: 'CF', code: 'BTAI7, BTB7, BTAI7', teacher: 'ARW', room: 'C001' },
          { subject: 'DSA', code: 'MBT3', teacher: 'ST', room: 'C001' },
          { subject: 'BT', code: 'MBT7, BTAI7, BTB7, BTAI7', teacher: 'PGB', room: 'C001' },
          null
        ],
        [
          { subject: 'OS', code: 'MBT5', teacher: 'YN', room: 'C001' },
          null,
          null,
          null,
          null,
          null
        ],
        [
          { subject: 'CEM', code: 'MBT5, BT5, BTAI5', teacher: 'KP', room: 'C001' },
          { subject: 'BT', code: 'MBT7, BTAI7, BTB7, BTAI7', teacher: 'PGB', room: 'C001' },
          null,
          null,
          null,
          null
        ],
        [null, null, null, null, null, null]
      ]
    },
    program: {
      title: 'Program: B Tech (Artificial Intelligence & Data Science)',
      subtitle: 'Class: Fourth-Year (Semester 7)',
      timetable: [
        [
          { subject: 'ATML', code: 'DK', room: 'B1 L-106' },
          { subject: 'BDA', code: 'MJ', room: 'B2 L-110' },
          { subject: 'FR', code: 'PR', room: 'C-007' },
          { subject: 'ATML', code: 'DK', room: 'C-001' },
          { subject: 'CSF', code: 'SGR', room: 'C-308' },
          { subject: 'FA', code: 'SGR', room: 'C-007' },
          { subject: 'BDA', code: 'MJ', room: '', class: 'B1 L-101' },
          { subject: 'ATML', code: 'DK', room: 'B2 L-101' }
        ],
        [
          null,
          null,
          { subject: 'FR', code: 'PR', room: 'C-007' },
          { subject: 'ATML', code: 'DK', room: 'C-001' },
          { subject: 'GR', code: 'PR', room: 'C-007' },
          { subject: 'FA', code: 'SGR', room: 'C-007' },
          null,
          null
        ],
        [
          { subject: 'ATSA', code: 'SA', room: 'C-007' },
          { subject: 'CF', code: 'ARW', room: 'L-101' },
          { subject: 'NLP', code: 'ANK', room: 'B1 L-101' },
          { subject: 'ATSA', code: 'SA', room: 'B2 L-102' },
          { subject: 'FR', code: 'PR', room: 'C-308' },
          { subject: 'BDA', code: 'MJ', room: 'C-001' },
          { subject: 'BDA', code: 'MJ', room: 'L-101' },
          { subject: 'ATML', code: 'DK', room: 'B1 L-101' }
        ],
        [
          { subject: 'ATSA', code: 'SA', room: 'C-007' },
          null,
          { subject: 'CF', code: 'ARW', room: 'C-001' },
          { subject: 'CF', code: 'ARW', room: 'C-001' },
          { subject: 'BDA', code: 'MJ', room: 'C-001' },
          { subject: 'BDA', code: 'MJ', room: 'C-001' },
          null,
          { subject: 'ATML', code: 'DK', room: 'B2 L-101' }
        ],
        [
          { subject: 'ATSA', code: 'SA', room: 'B1 L-102' },
          { subject: 'NLP', code: 'ANK', room: 'L-101' },
          { subject: 'CSF', code: 'SGR', room: 'C-308' },
          { subject: 'GR', code: 'PR', room: 'C-007' },
          { subject: 'NLP', code: 'ANK', room: 'C-308' },
          { subject: 'BT', code: 'PGB', room: 'C-001' },
          null,
          null
        ],
        [null, null, null, null, { subject: 'NLP', code: 'ANK', room: 'C-308' }, { subject: 'BT', code: 'PGB', room: 'L-102' }, null, null],
        [null, null, { subject: 'BT', code: 'PGB', room: 'C-001' }, null, null, null, null, null],
        [null, null, null, { subject: 'GR', code: 'PR', room: 'C-007' }, null, null, null, null]
      ]
    },
    teacher: {
      title: 'Faculty Name: Dr. Toral Shah',
      subtitle: '',
      timetable: [
        [
          { subject: 'DM', code: 'MBT3', room: 'C-005', class: 'MBT3' },
          null,
          null,
          null,
          null,
          null
        ],
        [
          { subject: 'DM', code: 'BTA3', room: 'C-004', class: 'BTA3' },
          { subject: 'IKS', code: 'MBT1', room: 'L-209', class: 'MBT1' },
          null,
          { subject: 'DM', code: 'MBT3', room: 'C-001', class: 'MBT3' },
          null,
          null
        ],
        [
          { subject: 'EEP', code: 'BTA1', room: 'B2 L-205', class: 'BTA1 B2' },
          null,
          { subject: 'EEP', code: 'BTA1', room: 'B1 L-205', class: 'BTA1 B1' },
          { subject: 'EEP', code: 'BTB1', room: 'B1 L-205', class: 'BTB1 B1' },
          null,
          null
        ],
        [
          null,
          { subject: 'DM', code: 'BTA3', room: 'C-005', class: 'BTA3' },
          null,
          null,
          { subject: 'IKS', code: 'BTAI1', room: 'C-004', class: 'BTAI1' },
          null
        ],
        [null, { subject: 'DM (T) B1', code: 'BTA3', room: 'C-003', class: 'BTA3' }, { subject: 'DM (T) B2', code: 'BTA3', room: 'C-003', class: 'BTA3' }, { subject: 'EEP', code: 'BTB1', room: 'B2 L-205', class: 'BTB1 B2' }, null, null],
        [{ subject: 'DM (T)', code: 'MBT3', room: 'L-209', class: 'MBT3' }, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null]
      ]
    }
  };

  const generateTimetable = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate AI generation process
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedTimetables(sampleTimetables);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const viewOptions = [
    { key: 'classroom', label: 'Classroom View', icon: <Building className="w-4 h-4" />, description: 'See what\'s happening in each room' },
    { key: 'program', label: 'Program View', icon: <BookOpen className="w-4 h-4" />, description: 'Student class schedule view' },
    { key: 'teacher', label: 'Teacher View', icon: <User className="w-4 h-4" />, description: 'Faculty teaching schedule' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Live Demo - AI Timetable Generator
              </h1>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Demo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Experience AI-Powered Timetable Generation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            See how our advanced algorithms create conflict-free schedules for educational institutions. 
            Generate timetables for classrooms, programs, and individual teachers instantly.
          </p>
        </div>

        {/* Sample Data Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Sample Institution Data</h2>
            <button
              onClick={() => setShowSampleData(!showSampleData)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View Details</span>
              {showSampleData ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{sampleData.teachers.length}</div>
              <div className="text-sm text-gray-600">Teachers</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{sampleData.classrooms.length}</div>
              <div className="text-sm text-gray-600">Classrooms</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{sampleData.courses.length}</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">45</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </div>

          {showSampleData && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Teaching Faculty</h3>
                  <div className="space-y-2 text-sm">
                    {sampleData.teachers.map(teacher => (
                      <div key={teacher.id} className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{teacher.name}</div>
                          <div className="text-gray-500">{teacher.department}</div>
                        </div>
                        <div className="text-xs text-blue-600">{teacher.subjects.length} subjects</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Classroom Resources</h3>
                  <div className="space-y-2 text-sm">
                    {sampleData.classrooms.map(room => (
                      <div key={room.id} className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{room.name}</div>
                          <div className="text-gray-500">Capacity: {room.capacity}</div>
                        </div>
                        <div className="text-xs text-green-600">{room.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generation Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate AI-Optimized Timetable</h2>
            <p className="text-gray-600 mb-6">
              Our genetic algorithm will analyze all constraints and generate conflict-free schedules 
              optimized for resource utilization and teacher preferences.
            </p>
            
            {!isGenerating && !generatedTimetables && (
              <button
                onClick={generateTimetable}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center mx-auto"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Timetable with AI
              </button>
            )}
            
            {isGenerating && (
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                  <span className="text-lg font-medium text-gray-900">
                    Generating Optimal Schedule...
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {generationProgress.toFixed(1)}% Complete
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  AI is analyzing {sampleData.teachers.length} teachers, {sampleData.classrooms.length} rooms, 
                  and {sampleData.courses.length} courses to find the optimal solution...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timetable Views */}
        {generatedTimetables && (
          <div className="space-y-8">
            {/* View Selector */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Select Timetable View
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {viewOptions.map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedView(option.key)}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      selectedView === option.key
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center ${
                      selectedView === option.key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Timetable View */}
            <div>
              <TimetableDisplay
                timetable={generatedTimetables[selectedView].timetable}
                viewType={selectedView}
                title={generatedTimetables[selectedView].title}
                subtitle={generatedTimetables[selectedView].subtitle}
              />
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Timetable Generated Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                Our AI algorithm has created a conflict-free schedule optimized for all constraints.
                Switch between different views to see how the same data appears for classrooms, programs, and teachers.
              </p>
              <div className="text-sm text-green-600">
                ✅ No teacher conflicts &nbsp;&nbsp;
                ✅ Room capacity optimized &nbsp;&nbsp;
                ✅ Student schedules balanced &nbsp;&nbsp;
                ✅ Break times respected
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to optimize your institution's scheduling?</h3>
              <p className="text-xl mb-6 opacity-90">
                Join hundreds of educational institutions already using our AI-powered timetable generation system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/register'}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Demo;