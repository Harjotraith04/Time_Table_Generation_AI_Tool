const Teacher = require('../models/Teacher');
const Timetable = require('../models/Timetable');
const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Program = require('../models/Program');

class ChatbotService {
  constructor() {
    this.greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    this.thanks = ['thank', 'thanks', 'appreciate'];
  }

  /**
   * Process user message and generate intelligent response
   */
  async processMessage(message, userRole, userId) {
    const lowerMessage = message.toLowerCase().trim();

    try {
      // Handle greetings
      if (this.greetings.some(greeting => lowerMessage.includes(greeting))) {
        return this.getGreetingResponse(userRole);
      }

      // Handle thanks
      if (this.thanks.some(thank => lowerMessage.includes(thank))) {
        return "You're welcome! Feel free to ask if you need anything else. 😊";
      }

      // Handle teacher location queries
      if (this.isTeacherLocationQuery(lowerMessage)) {
        return await this.findTeacherLocation(lowerMessage);
      }

      // Handle timetable queries
      if (this.isTimetableQuery(lowerMessage)) {
        return await this.getTimetableInfo(lowerMessage, userRole, userId);
      }

      // Handle optimization queries
      if (this.isOptimizationQuery(lowerMessage)) {
        return this.getOptimizationInfo(lowerMessage);
      }

      // Handle room availability queries
      if (this.isRoomQuery(lowerMessage)) {
        return await this.getRoomAvailability(lowerMessage);
      }

      // Handle schedule queries
      if (this.isScheduleQuery(lowerMessage)) {
        return await this.getScheduleInfo(lowerMessage, userRole, userId);
      }

      // Handle course queries
      if (this.isCourseQuery(lowerMessage)) {
        return await this.getCourseInfo(lowerMessage);
      }

      // Handle teacher queries
      if (this.isTeacherQuery(lowerMessage)) {
        return await this.getTeacherInfo(lowerMessage);
      }

      // Default response
      return this.getDefaultResponse(userRole);
    } catch (error) {
      console.error('Error processing message:', error);
      return "I apologize, but I encountered an error processing your request. Please try rephrasing your question or contact support if the issue persists.";
    }
  }

  /**
   * Check if message is about teacher location
   */
  isTeacherLocationQuery(message) {
    const keywords = ['where is', 'location of', 'find teacher', 'where can i find', 'where\'s'];
    return keywords.some(keyword => message.includes(keyword)) && 
           (message.includes('professor') || message.includes('teacher') || message.includes('dr.') || message.includes('mr.') || message.includes('ms.'));
  }

  /**
   * Find teacher current location
   */
  async findTeacherLocation(message) {
    try {
      // Extract teacher name from message
      const nameMatch = message.match(/(?:professor|teacher|dr\.|mr\.|ms\.)\s+([a-z]+(?:\s+[a-z]+)?)/i);
      
      if (!nameMatch) {
        const teachers = await Teacher.find({ status: 'active' }).select('name department').limit(5);
        const teacherList = teachers.map(t => `• ${t.name} (${t.department})`).join('\n');
        return `I couldn't identify the teacher's name. Here are some available teachers:\n\n${teacherList}\n\nPlease specify the full name.`;
      }

      const searchName = nameMatch[1];
      const teacher = await Teacher.findOne({
        name: { $regex: searchName, $options: 'i' },
        status: 'active'
      });

      if (!teacher) {
        return `I couldn't find a teacher named "${searchName}". Please check the spelling or try with a different name.`;
      }

      // Get current day and time
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Find active timetable
      const timetable = await Timetable.findOne({
        status: 'active'
      }).populate('schedule.teacher schedule.classroom');

      if (!timetable) {
        return `${teacher.name} is available but there's no active timetable at the moment.\n\n📧 Email: ${teacher.email}\n🏢 Department: ${teacher.department}`;
      }

      // Find current class
      const currentClass = timetable.schedule.find(slot => {
        if (!slot.teacher || slot.teacher._id.toString() !== teacher._id.toString()) return false;
        if (slot.day.toLowerCase() !== currentDay) return false;

        const slotStart = this.timeToMinutes(slot.startTime);
        const slotEnd = this.timeToMinutes(slot.endTime);
        const current = this.timeToMinutes(currentTime);

        return current >= slotStart && current <= slotEnd;
      });

      if (currentClass) {
        return `📍 **${teacher.name}** is currently in:\n\n` +
               `🏫 **Room:** ${currentClass.classroom?.roomNumber || 'N/A'}\n` +
               `📚 **Teaching:** ${currentClass.course}\n` +
               `⏰ **Time:** ${currentClass.startTime} - ${currentClass.endTime}\n` +
               `👥 **Division:** ${currentClass.division}\n\n` +
               `You can find them at ${currentClass.classroom?.building || 'the specified location'}.`;
      }

      // Find next class today
      const todayClasses = timetable.schedule
        .filter(slot => 
          slot.teacher && 
          slot.teacher._id.toString() === teacher._id.toString() && 
          slot.day.toLowerCase() === currentDay &&
          this.timeToMinutes(slot.startTime) > this.timeToMinutes(currentTime)
        )
        .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

      if (todayClasses.length > 0) {
        const nextClass = todayClasses[0];
        return `${teacher.name} is not currently teaching.\n\n` +
               `📅 **Next class today:**\n` +
               `🏫 Room: ${nextClass.classroom?.roomNumber || 'N/A'}\n` +
               `📚 Course: ${nextClass.course}\n` +
               `⏰ Time: ${nextClass.startTime} - ${nextClass.endTime}\n\n` +
               `📧 Email: ${teacher.email}\n` +
               `🏢 Department: ${teacher.department}`;
      }

      return `${teacher.name} has no more classes scheduled for today.\n\n` +
             `📧 Email: ${teacher.email}\n` +
             `🏢 Department: ${teacher.department}\n` +
             `🏫 Office: Faculty room, ${teacher.department}`;

    } catch (error) {
      console.error('Error finding teacher location:', error);
      return "I encountered an error while searching for the teacher's location. Please try again.";
    }
  }

  /**
   * Convert time string to minutes
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if message is about timetable
   */
  isTimetableQuery(message) {
    const keywords = ['timetable', 'time table', 'schedule', 'class schedule'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get timetable information
   */
  async getTimetableInfo(message, userRole, userId) {
    try {
      const timetables = await Timetable.find({ status: 'active' })
        .select('name semester academicYear createdAt')
        .sort({ createdAt: -1 })
        .limit(3);

      if (timetables.length === 0) {
        return "There are currently no active timetables. You may need to generate one first.";
      }

      let response = "📅 **Active Timetables:**\n\n";
      timetables.forEach((tt, index) => {
        response += `${index + 1}. **${tt.name}**\n`;
        response += `   • Semester: ${tt.semester}\n`;
        response += `   • Academic Year: ${tt.academicYear}\n`;
        response += `   • Created: ${new Date(tt.createdAt).toLocaleDateString()}\n\n`;
      });

      if (userRole === 'student') {
        response += "\n💡 **Tip:** You can view your personalized schedule in the 'My Timetable' section of your dashboard.";
      } else if (userRole === 'faculty' || userRole === 'admin') {
        response += "\n💡 **Tip:** You can view detailed timetables and make adjustments in the Timetable Management section.";
      }

      return response;
    } catch (error) {
      console.error('Error getting timetable info:', error);
      return "I encountered an error retrieving timetable information. Please try again.";
    }
  }

  /**
   * Check if message is about optimization
   */
  isOptimizationQuery(message) {
    const keywords = ['optimize', 'optimization', 'improve', 'better', 'efficiency', 'algorithm'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get optimization information
   */
  getOptimizationInfo(message) {
    return `🎯 **Timetable Optimization Strategies:**\n\n` +
           `1. **Genetic Algorithm**: Evolves schedules over generations for optimal solutions\n` +
           `   • Best for: Complex constraints and large datasets\n` +
           `   • Advantages: Global optimization, handles multiple objectives\n\n` +
           `2. **Simulated Annealing**: Gradually refines schedules like metal cooling\n` +
           `   • Best for: Quick optimization with good results\n` +
           `   • Advantages: Escapes local optima, consistent results\n\n` +
           `3. **Greedy Algorithm**: Makes locally optimal choices at each step\n` +
           `   • Best for: Fast generation with basic constraints\n` +
           `   • Advantages: Quick execution, simple to understand\n\n` +
           `4. **Hybrid Approach**: Combines multiple algorithms\n` +
           `   • Best for: Maximum optimization quality\n` +
           `   • Advantages: Leverages strengths of each method\n\n` +
           `💡 **Tips for Better Optimization:**\n` +
           `• Ensure all teacher availabilities are updated\n` +
           `• Define clear classroom requirements\n` +
           `• Set realistic constraints\n` +
           `• Use larger population sizes for Genetic Algorithm\n\n` +
           `Would you like help with a specific optimization aspect?`;
  }

  /**
   * Check if message is about rooms
   */
  isRoomQuery(message) {
    const keywords = ['room', 'classroom', 'available', 'free', 'vacant'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get room availability
   */
  async getRoomAvailability(message) {
    try {
      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDay = days[now.getDay()];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const classrooms = await Classroom.find({}).select('roomNumber building capacity features');
      const timetable = await Timetable.findOne({ status: 'active' }).populate('schedule.classroom');

      if (!timetable) {
        const roomList = classrooms.slice(0, 5).map(room => 
          `• **${room.roomNumber}** (${room.building}) - Capacity: ${room.capacity}`
        ).join('\n');
        return `🏫 **Available Classrooms:**\n\n${roomList}\n\n(No active timetable to check current occupancy)`;
      }

      // Find occupied rooms
      const occupiedRooms = new Set();
      timetable.schedule.forEach(slot => {
        if (slot.day.toLowerCase() === currentDay && slot.classroom) {
          const slotStart = this.timeToMinutes(slot.startTime);
          const slotEnd = this.timeToMinutes(slot.endTime);
          const current = this.timeToMinutes(currentTime);

          if (current >= slotStart && current <= slotEnd) {
            occupiedRooms.add(slot.classroom._id.toString());
          }
        }
      });

      // Filter available rooms
      const availableRooms = classrooms.filter(room => !occupiedRooms.has(room._id.toString()));

      if (availableRooms.length === 0) {
        return "All classrooms are currently occupied. Please check back later or specify a different time.";
      }

      let response = `🏫 **Available Classrooms Right Now:**\n\n`;
      availableRooms.slice(0, 8).forEach(room => {
        response += `• **${room.roomNumber}** (${room.building})\n`;
        response += `  Capacity: ${room.capacity} students\n`;
        if (room.features && room.features.length > 0) {
          response += `  Features: ${room.features.join(', ')}\n`;
        }
        response += '\n';
      });

      if (availableRooms.length > 8) {
        response += `\n...and ${availableRooms.length - 8} more rooms available.`;
      }

      return response;
    } catch (error) {
      console.error('Error getting room availability:', error);
      return "I encountered an error checking room availability. Please try again.";
    }
  }

  /**
   * Check if message is about schedule
   */
  isScheduleQuery(message) {
    const keywords = ['schedule', 'today', 'tomorrow', 'class', 'when', 'what time'];
    return keywords.some(keyword => message.includes(keyword));
  }

  /**
   * Get schedule information
   */
  async getScheduleInfo(message, userRole, userId) {
    try {
      if (userRole === 'student') {
        const student = await Student.findById(userId);
        if (!student) {
          return "I couldn't find your student information. Please contact support.";
        }

        const timetable = await Timetable.findOne({ status: 'active' });
        if (!timetable) {
          return "There's no active timetable available at the moment.";
        }

        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];

        const todayClasses = timetable.schedule
          .filter(slot => 
            slot.day.toLowerCase() === currentDay &&
            slot.division === student.division
          )
          .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

        if (todayClasses.length === 0) {
          return `You have no classes scheduled for today (${currentDay}). Enjoy your free day! 🎉`;
        }

        let response = `📅 **Your Schedule for Today (${currentDay}):**\n\n`;
        todayClasses.forEach((cls, index) => {
          response += `**${index + 1}. ${cls.startTime} - ${cls.endTime}**\n`;
          response += `   📚 ${cls.course}\n`;
          response += `   👨‍🏫 ${cls.teacher?.name || 'TBA'}\n`;
          response += `   🏫 ${cls.classroom?.roomNumber || 'TBA'}\n\n`;
        });

        return response;
      }

      return "Please specify what schedule information you need. You can ask about:\n• Today's schedule\n• Tomorrow's schedule\n• A specific teacher's schedule\n• Room schedules";
    } catch (error) {
      console.error('Error getting schedule info:', error);
      return "I encountered an error retrieving schedule information. Please try again.";
    }
  }

  /**
   * Check if message is about courses
   */
  isCourseQuery(message) {
    const keywords = ['course', 'subject', 'class'];
    return keywords.some(keyword => message.includes(keyword)) && !this.isScheduleQuery(message);
  }

  /**
   * Get course information
   */
  async getCourseInfo(message) {
    try {
      const courses = await Course.find({})
        .select('name code department credits type')
        .limit(10);

      if (courses.length === 0) {
        return "There are no courses registered in the system yet.";
      }

      let response = `📚 **Available Courses:**\n\n`;
      courses.forEach(course => {
        response += `• **${course.code}**: ${course.name}\n`;
        response += `  Department: ${course.department || 'N/A'}\n`;
        response += `  Credits: ${course.credits || 'N/A'} | Type: ${course.type || 'N/A'}\n\n`;
      });

      if (courses.length === 10) {
        response += `\n💡 Showing first 10 courses. For complete list, please check the Courses section.`;
      }

      return response;
    } catch (error) {
      console.error('Error getting course info:', error);
      return "I encountered an error retrieving course information. Please try again.";
    }
  }

  /**
   * Check if message is about teachers
   */
  isTeacherQuery(message) {
    const keywords = ['teacher', 'faculty', 'professor', 'instructor'];
    return keywords.some(keyword => message.includes(keyword)) && !this.isTeacherLocationQuery(message);
  }

  /**
   * Get teacher information
   */
  async getTeacherInfo(message) {
    try {
      const teachers = await Teacher.find({ status: 'active' })
        .select('name email department designation subjects')
        .limit(8);

      if (teachers.length === 0) {
        return "There are no active teachers in the system.";
      }

      let response = `👨‍🏫 **Faculty Members:**\n\n`;
      teachers.forEach(teacher => {
        response += `• **${teacher.name}** (${teacher.designation})\n`;
        response += `  📧 ${teacher.email}\n`;
        response += `  🏢 ${teacher.department}\n`;
        if (teacher.subjects && teacher.subjects.length > 0) {
          response += `  📚 ${teacher.subjects.slice(0, 3).join(', ')}\n`;
        }
        response += '\n';
      });

      if (teachers.length === 8) {
        response += `\n💡 Showing first 8 teachers. For complete list, please check the Faculty section.`;
      }

      return response;
    } catch (error) {
      console.error('Error getting teacher info:', error);
      return "I encountered an error retrieving teacher information. Please try again.";
    }
  }

  /**
   * Get greeting response based on user role
   */
  getGreetingResponse(userRole) {
    const roleGreetings = {
      admin: "Hello! I'm your AI assistant. As an admin, I can help you with:\n• Timetable optimization strategies\n• Finding teacher locations\n• Room availability\n• System insights\n\nWhat would you like to know?",
      faculty: "Hello! I'm your AI assistant. As faculty, I can help you with:\n• Your teaching schedule\n• Finding colleagues\n• Room availability\n• Timetable information\n\nHow can I assist you today?",
      student: "Hello! I'm your AI assistant. I can help you with:\n• Your class schedule\n• Finding your professors\n• Room locations\n• Timetable queries\n\nWhat would you like to know?"
    };

    return roleGreetings[userRole] || "Hello! How can I help you today?";
  }

  /**
   * Get default response
   */
  getDefaultResponse(userRole) {
    return `I'm here to help! You can ask me about:\n\n` +
           `📍 Teacher locations - "Where is Professor Smith?"\n` +
           `📅 Schedules - "Show me today's schedule"\n` +
           `🏫 Room availability - "Which rooms are free?"\n` +
           `🎯 Optimization - "How can I optimize my timetable?"\n` +
           `📚 Courses - "What courses are available?"\n` +
           `👨‍🏫 Faculty - "Show me the teachers"\n\n` +
           `What would you like to know?`;
  }
}

module.exports = new ChatbotService();
