const { GoogleGenerativeAI } = require('@google/generative-ai');
const Teacher = require('../models/Teacher');
const Timetable = require('../models/Timetable');
const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Program = require('../models/Program');

/**
 * AI-Powered Chatbot Service with Google Gemini Integration
 * Provides intelligent responses to user queries about timetables, teachers, students, rooms, etc.
 */
class AIChatbotService {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.useAI = !!this.geminiApiKey;
    
    if (this.useAI) {
      try {
        this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
        // Use gemini-1.5-flash for faster responses, or gemini-1.5-pro for better quality
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('✅ Gemini AI initialized successfully with gemini-1.5-flash');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error.message);
        this.useAI = false;
      }
    } else {
      console.warn('⚠️ Gemini API key not found. Chatbot will use rule-based responses.');
    }
  }

  /**
   * Main message processing function
   */
  async processMessage(message, userRole, userId) {
    const lowerMessage = message.toLowerCase().trim();

    try {
      // Gather context data from database
      const context = await this.gatherContext(lowerMessage);

      // If Gemini AI is available, use it for intelligent responses
      if (this.useAI) {
        return await this.generateAIResponse(message, context, userRole, userId);
      }

      // Fallback to rule-based system
      const intent = this.detectIntent(lowerMessage);
      const response = await this.generateResponse(intent, lowerMessage, context, userRole, userId);
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return "I apologize, but I encountered an error. Please try again or rephrase your question.";
    }
  }

  /**
   * Generate AI-powered response using Gemini
   */
  async generateAIResponse(message, context, userRole, userId) {
    try {
      // Build comprehensive context for AI
      const systemPrompt = this.buildSystemPrompt(context, userRole);
      const fullPrompt = `${systemPrompt}\n\nUser Query: ${message}\n\nProvide a helpful, accurate response based on the data above. Use emojis and format nicely.`;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      return text || this.getFallbackResponse(message, context, userRole, userId);
    } catch (error) {
      console.error('Gemini AI error:', error.message || error);
      // Always fallback to rule-based system if AI fails
      return this.getFallbackResponse(message, context, userRole, userId);
    }
  }

  /**
   * Fallback to rule-based response system
   */
  async getFallbackResponse(message, context, userRole, userId) {
    const lowerMessage = message.toLowerCase();
    const intent = this.detectIntent(lowerMessage);
    return await this.generateResponse(intent, lowerMessage, context, userRole, userId);
  }

  /**
   * Build comprehensive system prompt with all available data
   */
  buildSystemPrompt(context, userRole) {
    let prompt = `You are an intelligent AI assistant for a College Timetable Management System. You help ${userRole}s with their queries.\n\n`;
    
    prompt += `=== SYSTEM INFORMATION ===\n`;
    prompt += `Current Date & Time: ${new Date().toLocaleString()}\n`;
    prompt += `Current Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]}\n\n`;

    // Add counts
    if (context.counts) {
      prompt += `=== DATABASE STATISTICS ===\n`;
      prompt += `Total Teachers: ${context.counts.teachers}\n`;
      prompt += `Total Students: ${context.counts.students}\n`;
      prompt += `Total Classrooms: ${context.counts.classrooms}\n`;
      prompt += `Total Courses: ${context.counts.courses}\n\n`;
    }

    // Add teacher data
    if (context.teachers && context.teachers.length > 0) {
      prompt += `=== TEACHERS (${context.teachers.length} total) ===\n`;
      context.teachers.forEach((teacher, idx) => {
        prompt += `${idx + 1}. ${teacher.name} (${teacher.designation})\n`;
        prompt += `   Email: ${teacher.email}\n`;
        prompt += `   Department: ${teacher.department}\n`;
        if (teacher.subjects && teacher.subjects.length > 0) {
          prompt += `   Subjects: ${teacher.subjects.join(', ')}\n`;
        }
      });
      prompt += '\n';
    }

    // Add student data
    if (context.students && context.students.length > 0) {
      prompt += `=== STUDENTS (${context.students.length} total) ===\n`;
      context.students.forEach((student, idx) => {
        prompt += `${idx + 1}. ${student.name}\n`;
        prompt += `   Email: ${student.email}\n`;
        prompt += `   Roll No: ${student.rollNumber || 'N/A'}\n`;
        prompt += `   Division: ${student.division || 'N/A'}\n`;
        prompt += `   Program: ${student.program || 'N/A'}\n`;
      });
      prompt += '\n';
    }

    // Add classroom data
    if (context.classrooms && context.classrooms.length > 0) {
      prompt += `=== CLASSROOMS (${context.classrooms.length} total) ===\n`;
      context.classrooms.forEach((room, idx) => {
        prompt += `${idx + 1}. Room ${room.roomNumber} (${room.building})\n`;
        prompt += `   Capacity: ${room.capacity} students\n`;
        if (room.features && room.features.length > 0) {
          prompt += `   Features: ${room.features.join(', ')}\n`;
        }
      });
      prompt += '\n';
    }

    // Add course data
    if (context.courses && context.courses.length > 0) {
      prompt += `=== COURSES (${context.courses.length} total) ===\n`;
      context.courses.forEach((course, idx) => {
        prompt += `${idx + 1}. ${course.code}: ${course.name}\n`;
        prompt += `   Department: ${course.department || 'N/A'}\n`;
        prompt += `   Credits: ${course.credits || 'N/A'}, Type: ${course.type || 'N/A'}\n`;
      });
      prompt += '\n';
    }

    // Add timetable data
    if (context.timetable) {
      prompt += `=== ACTIVE TIMETABLE ===\n`;
      prompt += `Name: ${context.timetable.name}\n`;
      prompt += `Semester: ${context.timetable.semester}\n`;
      prompt += `Academic Year: ${context.timetable.academicYear}\n`;
      prompt += `Total Classes: ${context.timetable.schedule.length}\n`;
      prompt += `Status: ${context.timetable.status}\n\n`;

      // Add today's schedule if available
      const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
      const todayClasses = context.timetable.schedule.filter(s => s.day.toLowerCase() === today);
      
      if (todayClasses.length > 0) {
        prompt += `=== TODAY'S SCHEDULE (${today.toUpperCase()}) ===\n`;
        todayClasses.forEach((cls, idx) => {
          prompt += `${idx + 1}. ${cls.startTime}-${cls.endTime}: ${cls.course}\n`;
          prompt += `   Teacher: ${cls.teacher?.name || 'TBA'}\n`;
          prompt += `   Room: ${cls.classroom?.roomNumber || 'TBA'}\n`;
          prompt += `   Division: ${cls.division}\n`;
        });
        prompt += '\n';
      }
    }

    prompt += `=== YOUR CAPABILITIES ===\n`;
    prompt += `You can help with:\n`;
    prompt += `1. Finding teacher locations in real-time\n`;
    prompt += `2. Listing all teachers, students, courses, and classrooms\n`;
    prompt += `3. Checking room availability\n`;
    prompt += `4. Showing schedules and timetables\n`;
    prompt += `5. Providing timetable optimization guidance\n`;
    prompt += `6. Answering questions about the system\n\n`;

    prompt += `=== RESPONSE GUIDELINES ===\n`;
    prompt += `1. Be helpful, friendly, and concise\n`;
    prompt += `2. Use emojis to make responses engaging (👨‍🏫 📚 🏫 📅 etc.)\n`;
    prompt += `3. Format lists with numbers or bullets\n`;
    prompt += `4. If asked about location, check the timetable schedule for current time\n`;
    prompt += `5. If data is missing, politely inform the user\n`;
    prompt += `6. For "show all" queries, display complete lists from the data above\n`;
    prompt += `7. Be specific and accurate - use the exact data provided\n\n`;

    return prompt;
  }

  /**
   * Detect user intent from message
   */
  detectIntent(message) {
    const intents = {
      greeting: /\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\b/i,
      thanks: /\b(thank|thanks|appreciate|grateful)\b/i,
      teacherLocation: /\b(where is|where's|find|locate|location of)\b.*\b(teacher|professor|dr\.|mr\.|ms\.|faculty)\b/i,
      teacherList: /\b(show|list|display|all|get|view)\b.*\b(teacher|faculty|professor|instructor)s?\b/i,
      studentList: /\b(show|list|display|all|get|view)\b.*\b(student)s?\b/i,
      roomAvailability: /\b(room|classroom|lab|hall|available|free|vacant|empty)\b/i,
      schedule: /\b(schedule|timetable|class|today|tomorrow|when|time)\b/i,
      courseList: /\b(course|subject|class|curriculum|program)s?\b/i,
      optimization: /\b(optimi[sz]e|algorithm|genetic|improve|better|efficiency)\b/i,
      timetableInfo: /\b(timetable|active|current|semester)\b/i,
    };

    for (const [intentName, pattern] of Object.entries(intents)) {
      if (pattern.test(message)) {
        return intentName;
      }
    }

    return 'general';
  }

  /**
   * Gather relevant context data based on message
   */
  async gatherContext(message) {
    const context = {};

    try {
      // Always fetch basic counts
      const [teacherCount, studentCount, classroomCount, courseCount] = await Promise.all([
        Teacher.countDocuments({ status: 'active' }),
        Student.countDocuments({}),
        Classroom.countDocuments({}),
        Course.countDocuments({})
      ]);

      context.counts = {
        teachers: teacherCount,
        students: studentCount,
        classrooms: classroomCount,
        courses: courseCount
      };

      // Fetch teachers if query mentions them
      if (message.includes('teacher') || message.includes('faculty') || message.includes('professor')) {
        context.teachers = await Teacher.find({ status: 'active' })
          .select('name email department designation subjects')
          .limit(100)
          .lean();
      }

      // Fetch students if query mentions them
      if (message.includes('student')) {
        context.students = await Student.find({})
          .select('name email rollNumber division program')
          .limit(100)
          .lean();
      }

      // Fetch classrooms if query mentions rooms
      if (message.includes('room') || message.includes('classroom') || message.includes('lab')) {
        context.classrooms = await Classroom.find({})
          .select('roomNumber building capacity features')
          .lean();
      }

      // Fetch courses if query mentions courses
      if (message.includes('course') || message.includes('subject')) {
        context.courses = await Course.find({})
          .select('name code department credits type')
          .limit(50)
          .lean();
      }

      // Fetch active timetable
      context.timetable = await Timetable.findOne({ status: 'active' })
        .populate('schedule.teacher schedule.classroom')
        .lean();

    } catch (error) {
      console.error('Error gathering context:', error);
    }

    return context;
  }

  /**
   * Generate intelligent response
   */
  async generateResponse(intent, message, context, userRole, userId) {
    switch (intent) {
      case 'greeting':
        return this.handleGreeting(userRole);
      
      case 'thanks':
        return "You're welcome! 😊 Feel free to ask me anything about timetables, teachers, students, or schedules.";
      
      case 'teacherLocation':
        return await this.handleTeacherLocation(message, context);
      
      case 'teacherList':
        return this.handleTeacherList(context);
      
      case 'studentList':
        return this.handleStudentList(context);
      
      case 'roomAvailability':
        return await this.handleRoomAvailability(context);
      
      case 'schedule':
        return await this.handleSchedule(userRole, userId, context);
      
      case 'courseList':
        return this.handleCourseList(context);
      
      case 'optimization':
        return this.handleOptimization();
      
      case 'timetableInfo':
        return await this.handleTimetableInfo(context);
      
      default:
        return this.handleGeneral(message, context, userRole);
    }
  }

  /**
   * Handle greeting
   */
  handleGreeting(userRole) {
    const greetings = {
      admin: "Hello! 👋 I'm your AI assistant. As an admin, I can help you with:\n• Viewing all teachers and students\n• Checking room availability\n• Timetable management\n• Optimization strategies\n• System insights\n\nWhat would you like to know?",
      faculty: "Hello! 👋 I'm your AI assistant. I can help you with:\n• Finding colleagues and their locations\n• Viewing your teaching schedule\n• Checking room availability\n• Course information\n• Student lists\n\nHow can I assist you?",
      student: "Hello! 👋 I'm your AI assistant. I can help you with:\n• Your class schedule\n• Finding professors\n• Room locations\n• Course information\n• Timetable queries\n\nWhat would you like to know?"
    };

    return greetings[userRole] || greetings.student;
  }

  /**
   * Handle teacher location queries
   */
  async handleTeacherLocation(message, context) {
    try {
      const nameMatch = message.match(/(?:teacher|professor|dr\.|mr\.|ms\.)\s+([a-z\s]+?)(?:\?|$|is|right|now)/i);
      
      if (!nameMatch && context.teachers) {
        const teacherList = context.teachers.slice(0, 5)
          .map(t => `• ${t.name} (${t.department})`)
          .join('\n');
        return `I couldn't identify the teacher's name. Here are some teachers:\n\n${teacherList}\n\nPlease specify the full name.`;
      }

      const searchName = nameMatch[1].trim();
      const teacher = context.teachers?.find(t => 
        t.name.toLowerCase().includes(searchName.toLowerCase())
      );

      if (!teacher) {
        return `I couldn't find a teacher named "${searchName}". Please check the spelling or try asking "show all teachers" to see the list.`;
      }

      // Get current location from timetable
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (!context.timetable) {
        return `**${teacher.name}** is in the ${teacher.department} department.\n\n📧 Email: ${teacher.email}\n🏢 Office: Faculty room\n\n(No active timetable to check current location)`;
      }

      const currentClass = context.timetable.schedule.find(slot => {
        if (!slot.teacher || slot.teacher._id.toString() !== teacher._id.toString()) return false;
        if (slot.day.toLowerCase() !== currentDay) return false;

        const slotStart = this.timeToMinutes(slot.startTime);
        const slotEnd = this.timeToMinutes(slot.endTime);
        const current = this.timeToMinutes(currentTime);

        return current >= slotStart && current <= slotEnd;
      });

      if (currentClass) {
        return `📍 **${teacher.name}** is currently teaching:\n\n` +
               `🏫 **Room:** ${currentClass.classroom?.roomNumber || 'TBA'}\n` +
               `📚 **Course:** ${currentClass.course}\n` +
               `⏰ **Time:** ${currentClass.startTime} - ${currentClass.endTime}\n` +
               `👥 **Division:** ${currentClass.division}\n` +
               `🏢 **Building:** ${currentClass.classroom?.building || 'Main Building'}\n\n` +
               `You can find them there right now!`;
      }

      return `**${teacher.name}** is not currently teaching.\n\n` +
             `📧 Email: ${teacher.email}\n` +
             `🏢 Department: ${teacher.department}\n` +
             `🏫 Office: Faculty room, ${teacher.department}`;

    } catch (error) {
      console.error('Error finding teacher location:', error);
      return "I encountered an error finding the teacher's location. Please try again.";
    }
  }

  /**
   * Handle teacher list queries
   */
  handleTeacherList(context) {
    if (!context.teachers || context.teachers.length === 0) {
      return "There are no teachers in the system currently.";
    }

    let response = `👨‍🏫 **All Faculty Members** (${context.teachers.length} total):\n\n`;
    
    context.teachers.forEach((teacher, index) => {
      response += `**${index + 1}. ${teacher.name}** (${teacher.designation})\n`;
      response += `   📧 ${teacher.email}\n`;
      response += `   🏢 ${teacher.department}\n`;
      if (teacher.subjects && teacher.subjects.length > 0) {
        response += `   📚 ${teacher.subjects.slice(0, 3).join(', ')}\n`;
      }
      response += '\n';
    });

    return response;
  }

  /**
   * Handle student list queries
   */
  handleStudentList(context) {
    if (!context.students || context.students.length === 0) {
      return "There are no students in the system currently.";
    }

    let response = `👨‍🎓 **All Students** (${context.students.length} total):\n\n`;
    
    context.students.forEach((student, index) => {
      response += `**${index + 1}. ${student.name}**\n`;
      response += `   📧 ${student.email}\n`;
      response += `   🎓 Roll No: ${student.rollNumber || 'N/A'}\n`;
      response += `   📚 Division: ${student.division || 'N/A'}\n`;
      response += `   🏫 Program: ${student.program || 'N/A'}\n`;
      response += '\n';
    });

    return response;
  }

  /**
   * Handle room availability
   */
  async handleRoomAvailability(context) {
    if (!context.classrooms || context.classrooms.length === 0) {
      return "There are no classrooms in the system.";
    }

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!context.timetable) {
      const roomList = context.classrooms.slice(0, 10).map(room =>
        `• **${room.roomNumber}** (${room.building}) - Capacity: ${room.capacity}`
      ).join('\n');
      return `🏫 **Available Classrooms:**\n\n${roomList}\n\n(No active timetable to check occupancy)`;
    }

    const occupiedRooms = new Set();
    context.timetable.schedule.forEach(slot => {
      if (slot.day.toLowerCase() === currentDay && slot.classroom) {
        const slotStart = this.timeToMinutes(slot.startTime);
        const slotEnd = this.timeToMinutes(slot.endTime);
        const current = this.timeToMinutes(currentTime);

        if (current >= slotStart && current <= slotEnd) {
          occupiedRooms.add(slot.classroom._id.toString());
        }
      }
    });

    const availableRooms = context.classrooms.filter(room => 
      !occupiedRooms.has(room._id.toString())
    );

    if (availableRooms.length === 0) {
      return "⚠️ All classrooms are currently occupied.";
    }

    let response = `🏫 **Available Classrooms Right Now** (${availableRooms.length} free):\n\n`;
    availableRooms.slice(0, 15).forEach((room, index) => {
      response += `**${index + 1}. ${room.roomNumber}** (${room.building})\n`;
      response += `   👥 Capacity: ${room.capacity}\n`;
      if (room.features && room.features.length > 0) {
        response += `   ✨ Features: ${room.features.join(', ')}\n`;
      }
      response += '\n';
    });

    return response;
  }

  /**
   * Handle schedule queries
   */
  async handleSchedule(userRole, userId, context) {
    if (userRole === 'student') {
      const student = await Student.findById(userId);
      if (!student || !context.timetable) {
        return "I couldn't retrieve your schedule. Please ensure you're logged in and a timetable is active.";
      }

      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];

      const todayClasses = context.timetable.schedule
        .filter(slot => 
          slot.day.toLowerCase() === currentDay &&
          slot.division === student.division
        )
        .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

      if (todayClasses.length === 0) {
        return `📅 You have no classes today (${currentDay}). Enjoy your free day! 🎉`;
      }

      let response = `📅 **Your Schedule for ${currentDay}:**\n\n`;
      todayClasses.forEach((cls, index) => {
        response += `**${index + 1}. ${cls.startTime} - ${cls.endTime}**\n`;
        response += `   📚 ${cls.course}\n`;
        response += `   👨‍🏫 ${cls.teacher?.name || 'TBA'}\n`;
        response += `   🏫 ${cls.classroom?.roomNumber || 'TBA'}\n\n`;
      });

      return response;
    }

    return "To see a schedule, please specify whose schedule (e.g., 'my schedule' for students, or 'schedule for Dr. Smith' for teachers).";
  }

  /**
   * Handle course list
   */
  handleCourseList(context) {
    if (!context.courses || context.courses.length === 0) {
      return "There are no courses in the system.";
    }

    let response = `📚 **Available Courses** (${context.courses.length} total):\n\n`;
    
    context.courses.forEach((course, index) => {
      response += `**${index + 1}. ${course.code}**: ${course.name}\n`;
      response += `   🏢 Department: ${course.department || 'N/A'}\n`;
      response += `   ⭐ Credits: ${course.credits || 'N/A'}\n`;
      response += `   📖 Type: ${course.type || 'N/A'}\n`;
      response += '\n';
    });

    return response;
  }

  /**
   * Handle optimization queries
   */
  handleOptimization() {
    return `🎯 **Timetable Optimization Guide:**\n\n` +
           `**1. Genetic Algorithm** 🧬\n` +
           `   • Evolves schedules over generations\n` +
           `   • Best for: Complex constraints\n` +
           `   • Advantages: Global optimization\n\n` +
           `**2. Simulated Annealing** 🌡️\n` +
           `   • Gradually refines solutions\n` +
           `   • Best for: Quick optimization\n` +
           `   • Advantages: Escapes local optima\n\n` +
           `**3. Greedy Algorithm** ⚡\n` +
           `   • Makes optimal choices at each step\n` +
           `   • Best for: Fast generation\n` +
           `   • Advantages: Quick execution\n\n` +
           `**4. Hybrid Approach** 🔄\n` +
           `   • Combines multiple algorithms\n` +
           `   • Best for: Maximum quality\n` +
           `   • Advantages: Best of all methods\n\n` +
           `💡 **Tips:**\n` +
           `• Update teacher availability\n` +
           `• Define clear constraints\n` +
           `• Use larger populations for Genetic Algorithm`;
  }

  /**
   * Handle timetable info
   */
  async handleTimetableInfo(context) {
    if (!context.timetable) {
      return "There is no active timetable currently. Please generate one first.";
    }

    return `📅 **Active Timetable:**\n\n` +
           `📌 **Name:** ${context.timetable.name}\n` +
           `📚 **Semester:** ${context.timetable.semester}\n` +
           `🎓 **Academic Year:** ${context.timetable.academicYear}\n` +
           `📊 **Total Classes:** ${context.timetable.schedule.length}\n` +
           `✅ **Status:** ${context.timetable.status}\n` +
           `📅 **Created:** ${new Date(context.timetable.createdAt).toLocaleDateString()}\n\n` +
           `You can view the full timetable in the Timetable section.`;
  }

  /**
   * Handle general queries
   */
  handleGeneral(message, context, userRole) {
    return `I'm here to help! You can ask me about:\n\n` +
           `👨‍🏫 **Teachers** - "Show all teachers" or "Where is Dr. Smith?"\n` +
           `👨‍🎓 **Students** - "Show all students" or "List students"\n` +
           `🏫 **Rooms** - "Which rooms are free?" or "Show classrooms"\n` +
           `📅 **Schedule** - "Show my schedule" or "Today's classes"\n` +
           `📚 **Courses** - "List all courses" or "Show subjects"\n` +
           `🎯 **Optimization** - "How to optimize timetable?"\n` +
           `📊 **Timetable** - "Show active timetable"\n\n` +
           `What would you like to know?`;
  }

  /**
   * Convert time string to minutes
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

module.exports = new AIChatbotService();
