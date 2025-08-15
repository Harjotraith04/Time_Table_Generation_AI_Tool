class TimetableConstraints {
  constructor() {
    this.hardConstraints = [
      'teacherConflict',
      'roomConflict',
      'teacherAvailability',
      'roomAvailability',
      'workingHours',
      'coursePrerequisites',
      'roomCapacity',
      'roomTypeCompatibility'
    ];
    
    this.softConstraints = [
      'teacherWorkloadBalance',
      'roomUtilization',
      'dayDistribution',
      'consecutiveHours',
      'preferredTimeSlots',
      'teacherPreferences',
      'roomPreferences'
    ];
  }

  /**
   * Check all hard constraints
   */
  checkHardConstraints(timetableEntries) {
    const violations = [];
    
    this.hardConstraints.forEach(constraintType => {
      const constraintViolations = this[`check${constraintType.charAt(0).toUpperCase() + constraintType.slice(1)}`](timetableEntries);
      violations.push(...constraintViolations);
    });
    
    return violations;
  }

  /**
   * Check all soft constraints
   */
  checkSoftConstraints(timetableEntries) {
    const violations = [];
    
    this.softConstraints.forEach(constraintType => {
      const constraintViolations = this[`check${constraintType.charAt(0).toUpperCase() + constraintType.slice(1)}`](timetableEntries);
      violations.push(...constraintViolations);
    });
    
    return violations;
  }

  /**
   * Check for teacher conflicts (same teacher scheduled at same time)
   */
  checkTeacherConflict(entries) {
    const violations = [];
    const teacherSchedules = {};
    
    entries.forEach(entry => {
      const key = `${entry.teacherId}_${entry.day}_${entry.startTime}`;
      
      if (teacherSchedules[key]) {
        violations.push({
          type: 'hard_constraint',
          constraint: 'teacherConflict',
          message: `Teacher ${entry.teacherName} has conflicting schedule on ${entry.day} at ${entry.startTime}`,
          entry1: teacherSchedules[key],
          entry2: entry,
          severity: 'critical'
        });
      } else {
        teacherSchedules[key] = entry;
      }
    });
    
    return violations;
  }

  /**
   * Check for room conflicts (same room scheduled at same time)
   */
  checkRoomConflict(entries) {
    const violations = [];
    const roomSchedules = {};
    
    entries.forEach(entry => {
      const key = `${entry.roomId}_${entry.day}_${entry.startTime}`;
      
      if (roomSchedules[key]) {
        violations.push({
          type: 'hard_constraint',
          constraint: 'roomConflict',
          message: `Room ${entry.roomName} has conflicting schedule on ${entry.day} at ${entry.startTime}`,
          entry1: roomSchedules[key],
          entry2: entry,
          severity: 'critical'
        });
      } else {
        roomSchedules[key] = entry;
      }
    });
    
    return violations;
  }

  /**
   * Check teacher availability constraints
   */
  checkTeacherAvailability(entries) {
    const violations = [];
    
    // This would need to be implemented with actual teacher availability data
    // For now, we'll assume all teachers are available
    
    return violations;
  }

  /**
   * Check room availability constraints
   */
  checkRoomAvailability(entries) {
    const violations = [];
    
    // This would need to be implemented with actual room availability data
    // For now, we'll assume all rooms are available
    
    return violations;
  }

  /**
   * Check working hours constraints
   */
  checkWorkingHours(entries) {
    const violations = [];
    const workingHours = {
      start: 9, // 9 AM
      end: 17   // 5 PM
    };
    
    entries.forEach(entry => {
      const startHour = parseInt(entry.startTime.split(':')[0]);
      const endHour = parseInt(entry.endTime.split(':')[0]);
      
      if (startHour < workingHours.start || endHour > workingHours.end) {
        violations.push({
          type: 'hard_constraint',
          constraint: 'workingHours',
          message: `Class scheduled outside working hours: ${entry.startTime} - ${entry.endTime}`,
          entry: entry,
          severity: 'high'
        });
      }
    });
    
    return violations;
  }

  /**
   * Check course prerequisites
   */
  checkCoursePrerequisites(entries) {
    const violations = [];
    
    // This would need to be implemented with actual course prerequisite data
    // For now, we'll assume no prerequisites
    
    return violations;
  }

  /**
   * Check room capacity constraints
   */
  checkRoomCapacity(entries) {
    const violations = [];
    
    // This would need to be implemented with actual room capacity and student count data
    // For now, we'll assume all rooms can accommodate the classes
    
    return violations;
  }

  /**
   * Check room type compatibility
   */
  checkRoomTypeCompatibility(entries) {
    const violations = [];
    
    // This would need to be implemented with actual room type and subject type data
    // For now, we'll assume all rooms are compatible
    
    return violations;
  }

  /**
   * Check teacher workload balance
   */
  checkTeacherWorkloadBalance(entries) {
    const violations = [];
    const teacherWorkload = {};
    
    // Calculate workload for each teacher
    entries.forEach(entry => {
      if (!teacherWorkload[entry.teacherId]) {
        teacherWorkload[entry.teacherId] = 0;
      }
      teacherWorkload[entry.teacherId] += entry.duration;
    });
    
    // Check for significant imbalances
    const workloads = Object.values(teacherWorkload);
    const avgWorkload = workloads.reduce((sum, workload) => sum + workload, 0) / workloads.length;
    const threshold = avgWorkload * 0.3; // 30% deviation threshold
    
    Object.entries(teacherWorkload).forEach(([teacherId, workload]) => {
      if (Math.abs(workload - avgWorkload) > threshold) {
        violations.push({
          type: 'soft_constraint',
          constraint: 'teacherWorkloadBalance',
          message: `Teacher workload imbalance: ${workload} hours vs average ${avgWorkload.toFixed(1)} hours`,
          teacherId: teacherId,
          workload: workload,
          severity: 'medium'
        });
      }
    });
    
    return violations;
  }

  /**
   * Check room utilization balance
   */
  checkRoomUtilization(entries) {
    const violations = [];
    const roomUtilization = {};
    
    // Calculate utilization for each room
    entries.forEach(entry => {
      if (!roomUtilization[entry.roomId]) {
        roomUtilization[entry.roomId] = 0;
      }
      roomUtilization[entry.roomId] += entry.duration;
    });
    
    // Check for significant imbalances
    const utilizations = Object.values(roomUtilization);
    const avgUtilization = utilizations.reduce((sum, utilization) => sum + utilization, 0) / utilizations.length;
    const threshold = avgUtilization * 0.4; // 40% deviation threshold
    
    Object.entries(roomUtilization).forEach(([roomId, utilization]) => {
      if (Math.abs(utilization - avgUtilization) > threshold) {
        violations.push({
          type: 'soft_constraint',
          constraint: 'roomUtilization',
          message: `Room utilization imbalance: ${utilization} hours vs average ${avgUtilization.toFixed(1)} hours`,
          roomId: roomId,
          utilization: utilization,
          severity: 'low'
        });
      }
    });
    
    return violations;
  }

  /**
   * Check day distribution balance
   */
  checkDayDistribution(entries) {
    const violations = [];
    const dayDistribution = {};
    const workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Calculate distribution across days
    workingDays.forEach(day => {
      dayDistribution[day] = 0;
    });
    
    entries.forEach(entry => {
      if (dayDistribution[entry.day] !== undefined) {
        dayDistribution[entry.day]++;
      }
    });
    
    // Check for significant imbalances
    const counts = Object.values(dayDistribution);
    const avgCount = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const threshold = avgCount * 0.5; // 50% deviation threshold
    
    Object.entries(dayDistribution).forEach(([day, count]) => {
      if (Math.abs(count - avgCount) > threshold) {
        violations.push({
          type: 'soft_constraint',
          constraint: 'dayDistribution',
          message: `Uneven day distribution: ${day} has ${count} classes vs average ${avgCount.toFixed(1)}`,
          day: day,
          count: count,
          severity: 'low'
        });
      }
    });
    
    return violations;
  }

  /**
   * Check consecutive hours without breaks
   */
  checkConsecutiveHours(entries) {
    const violations = [];
    const teacherDaySchedules = {};
    
    // Group entries by teacher and day
    entries.forEach(entry => {
      const key = `${entry.teacherId}_${entry.day}`;
      if (!teacherDaySchedules[key]) {
        teacherDaySchedules[key] = [];
      }
      teacherDaySchedules[key].push(entry);
    });
    
    // Check for consecutive hours without breaks
    Object.values(teacherDaySchedules).forEach(dayEntries => {
      dayEntries.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      for (let i = 0; i < dayEntries.length - 1; i++) {
        const current = dayEntries[i];
        const next = dayEntries[i + 1];
        
        if (current.endTime === next.startTime) {
          violations.push({
            type: 'soft_constraint',
            constraint: 'consecutiveHours',
            message: `Teacher has consecutive classes without break on ${current.day}`,
            entry1: current,
            entry2: next,
            severity: 'medium'
          });
        }
      }
    });
    
    return violations;
  }

  /**
   * Check preferred time slots
   */
  checkPreferredTimeSlots(entries) {
    const violations = [];
    
    // This would need to be implemented with actual preferred time slot data
    // For now, we'll assume no preferred time slots
    
    return violations;
  }

  /**
   * Check teacher preferences
   */
  checkTeacherPreferences(entries) {
    const violations = [];
    
    // This would need to be implemented with actual teacher preference data
    // For now, we'll assume no teacher preferences
    
    return violations;
  }

  /**
   * Check room preferences
   */
  checkRoomPreferences(entries) {
    const violations = [];
    
    // This would need to be implemented with actual room preference data
    // For now, we'll assume no room preferences
    
    return violations;
  }

  /**
   * Get constraint violation summary
   */
  getViolationSummary(entries) {
    const hardViolations = this.checkHardConstraints(entries);
    const softViolations = this.checkSoftConstraints(entries);
    
    return {
      total: hardViolations.length + softViolations.length,
      hard: hardViolations.length,
      soft: softViolations.length,
      isValid: hardViolations.length === 0,
      details: {
        hard: hardViolations,
        soft: softViolations
      }
    };
  }

  /**
   * Validate specific constraint
   */
  validateConstraint(constraintType, entries, params = {}) {
    if (this.hardConstraints.includes(constraintType)) {
      return this[`check${constraintType.charAt(0).toUpperCase() + constraintType.slice(1)}`](entries);
    } else if (this.softConstraints.includes(constraintType)) {
      return this[`check${constraintType.charAt(0).toUpperCase() + constraintType.slice(1)}`](entries);
    } else {
      throw new Error(`Unknown constraint type: ${constraintType}`);
    }
  }

  /**
   * Get all available constraint types
   */
  getAvailableConstraints() {
    return {
      hard: this.hardConstraints,
      soft: this.softConstraints
    };
  }

  /**
   * Add custom constraint
   */
  addCustomConstraint(constraintType, constraintFunction, isHard = false) {
    if (isHard) {
      this.hardConstraints.push(constraintType);
    } else {
      this.softConstraints.push(constraintType);
    }
    
    this[`check${constraintType.charAt(0).toUpperCase() + constraintType.slice(1)}`] = constraintFunction;
  }
}

export default TimetableConstraints;
