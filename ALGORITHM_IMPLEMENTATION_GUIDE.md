# Timetable Generation Algorithms - Implementation Guide

## Overview
This document describes the enhanced timetable generation system with 6 different algorithms, each designed to handle complex scheduling constraints including visiting faculty priority, electives, lab batches, and infrastructure policies.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Algorithms Implemented](#algorithms-implemented)
3. [Constraint System](#constraint-system)
4. [Usage Guide](#usage-guide)
5. [Testing](#testing)
6. [Next Steps](#next-steps)

---

## System Architecture

### Core Components

#### 1. **ConstraintChecker** (`algorithms/ConstraintChecker.js`) ✅ COMPLETED
A centralized utility for validating all scheduling constraints:

**Hard Constraints (Must be satisfied):**
- ✅ No teacher in two places at once
- ✅ No classroom hosting two classes simultaneously (EXCEPT: Labs with different teachers/subjects)
- ✅ No student group in two classes at once (EXCEPT: Electives run simultaneously)
- ✅ Teacher availability checks
- ✅ Classroom capacity requirements
- ✅ Classroom feature requirements (labs, projectors, etc.)

**Soft Constraints (Preferences):**
- ✅ Teacher preferred time slots
- ✅ Classroom utilization optimization
- ✅ Balanced teacher workload
- ✅ Maximum consecutive hours
- ✅ Schedule gap minimization

**Priority System:**
- ✅ Visiting faculty gets highest priority (scheduled first)
- ✅ Guest and adjunct faculty get medium-high priority
- ✅ Core faculty uses assigned priority

#### 2. **Teacher Model Enhancement** ✅ COMPLETED
- Added `teacherType` field: 'core', 'visiting', 'guest', 'adjunct'
- Added `getEffectivePriority()` method - visiting faculty always returns 'high'
- Added `getPriorityScore()` method for sorting (3=high, 2=medium, 1=low)

---

## Algorithms Implemented

### 1. **Greedy Scheduler** ✅ WORKING
**Status:** Fully functional
**Best For:** Quick scheduling, small to medium datasets
**File:** `algorithms/GreedyScheduler.js`

**How it works:**
1. Sorts courses by priority (visiting faculty first)
2. For each session, finds first available time slot
3. Assigns teacher, classroom, and time
4. Tracks conflicts in real-time

**Complexity:** O(n) - Very fast
**Quality:** Good for simple cases, may not find optimal solutions

---

### 2. **Backtracking Search** ✅ COMPLETED
**Status:** Newly implemented
**Best For:** Guaranteed solutions when they exist
**File:** `algorithms/BacktrackingSearch.js`

**How it works:**
1. Orders sessions by priority (visiting faculty first)
2. Uses Minimum Remaining Values (MRV) heuristic
3. Tries each valid assignment systematically
4. Backtracks when constraints violated
5. Continues until solution found or limit reached

**Features:**
- ✅ Systematic exhaustive search
- ✅ Intelligent variable ordering
- ✅ Forward checking to prune domains
- ✅ Visiting faculty prioritization
- ✅ Elective handling
- ✅ Lab batch support

**Settings:**
```javascript
{
  maxBacktracks: 10000,  // Maximum backtrack steps
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 60,
  breakSlots: ['12:00-13:00']
}
```

---

### 3. **Simulated Annealing** ✅ COMPLETED
**Status:** Newly implemented
**Best For:** Large datasets, optimization focus
**File:** `algorithms/SimulatedAnnealing.js`

**How it works:**
1. Generates random initial solution
2. Iteratively perturbs solution (swap sessions, change times, change classrooms)
3. Accepts worse solutions probabilistically (controlled by temperature)
4. Gradually "cools down" - becomes more selective
5. Returns best solution found

**Features:**
- ✅ Probabilistic optimization
- ✅ Escapes local optima
- ✅ Three perturbation types (swap, time change, classroom change)
- ✅ Energy function considers hard and soft constraints
- ✅ Metropolis acceptance criterion

**Settings:**
```javascript
{
  initialTemperature: 1000,
  coolingRate: 0.995,
  minTemperature: 0.1,
  maxIterations: 10000,
  iterationsPerTemp: 10
}
```

**Energy Function:**
- Hard constraint violations: +100 per violation
- Soft constraint penalties: +10 * (1 - score)
- Lower energy = better solution

---

### 4. **CSP Solver** ⚠️ NEEDS ENHANCEMENT
**Status:** Existing but needs updates for new constraints
**Best For:** Constraint-heavy problems
**File:** `algorithms/CSPSolver.js`

**Required Enhancements:**
1. Integrate ConstraintChecker for validation
2. Add visiting faculty priority in variable ordering
3. Enhance domain initialization for electives
4. Add lab batch support
5. Update arc consistency for new constraints

**Recommended Changes:**
```javascript
// In createVariables() method:
createVariables() {
  const variables = this.extractSessions(); // Use method from BacktrackingSearch
  
  // Sort by visiting faculty priority
  return this.constraintChecker.sortCoursesByPriority(variables);
}

// In solve() method:
async solve(progressCallback) {
  // Use ConstraintChecker for validation
  const check = this.constraintChecker.checkHardConstraints(assignment, this.assignment);
  if (!check.valid) {
    // Handle violation
  }
}
```

---

### 5. **Genetic Algorithm** ⚠️ NEEDS ENHANCEMENT
**Status:** Existing but needs updates for new constraints
**Best For:** Complex optimization, multiple objectives
**File:** `algorithms/GeneticAlgorithm.js`

**Required Enhancements:**
1. Integrate ConstraintChecker in fitness function
2. Update chromosome encoding for electives and batches
3. Add visiting faculty priority in initial population
4. Enhance crossover to preserve good patterns
5. Update mutation to respect constraints

**Recommended Changes:**
```javascript
// In calculateFitness() method:
calculateFitness(individual) {
  const schedule = this.chromosomeToSchedule(individual);
  let fitness = 1000;
  
  // Use ConstraintChecker
  for (const assignment of schedule) {
    const check = this.constraintChecker.checkHardConstraints(
      assignment, 
      schedule.filter(s => s !== assignment)
    );
    
    if (!check.valid) {
      fitness -= check.violations.length * 100;
    }
    
    const softCheck = this.constraintChecker.evaluateSoftConstraints(assignment, schedule);
    fitness += softCheck.score * 50;
  }
  
  return fitness;
}
```

---

### 6. **Hybrid CSP-GA** ⚠️ NEEDS ENHANCEMENT
**Status:** Exists but needs updates
**Best For:** Best quality solutions
**File:** `algorithms/OptimizationEngine.js` (hybridAlgorithm method)

**Current Flow:**
1. CSP finds initial feasible solution (respects all hard constraints)
2. GA optimizes for soft constraints and preferences

**Required Enhancements:**
1. Update CSP phase to use enhanced CSP solver
2. Pass CSP solution to GA as seed for initial population
3. Configure GA to focus on soft constraint optimization
4. Add multi-objective fitness function

---

## Constraint System

### Hard Constraints ✅

#### 1. Teacher Conflicts
```javascript
// No teacher can teach two classes at the same time
checkTeacherConflict(assignment, schedule)
```

#### 2. Classroom Conflicts
```javascript
// No classroom can host two classes at once
// EXCEPTION: Labs can run simultaneously if:
//   - Both are lab sessions
//   - Different teachers
//   - Different courses
checkClassroomConflict(assignment, schedule)
```

#### 3. Student Group Conflicts
```javascript
// No student group in two classes at once
// EXCEPTION: Electives can run simultaneously
//   - Students choose 1 of 3 electives
//   - Different elective courses don't conflict
checkStudentGroupConflict(assignment, schedule)
```

#### 4. Teacher Availability
```javascript
// Teacher must be available on day/time
checkTeacherAvailability(assignment)
```

#### 5. Classroom Requirements
```javascript
// Classroom must have sufficient capacity
// Labs require lab facilities
checkClassroomCapacity(assignment)
checkClassroomFeatures(assignment)
```

### Soft Constraints ✅

All evaluated by `evaluateSoftConstraints()`:
- Teacher preferences (preferred/avoided time slots)
- Classroom utilization (aim for 50-100%)
- Teacher workload balance (avoid overloading)
- Consecutive hours (respect max consecutive)
- Schedule gaps (minimize wasted time)

---

## Usage Guide

### API Endpoint
```
POST /api/timetables/generate
```

### Request Body
```json
{
  "name": "Fall 2024 Timetable",
  "academicYear": "2024-2025",
  "semester": 1,
  "department": "Computer Engineering",
  "year": 2,
  "settings": {
    "algorithm": "backtracking",  // Choose: greedy, genetic, csp, hybrid, backtracking, simulated_annealing
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "startTime": "09:00",
    "endTime": "17:00",
    "slotDuration": 60,
    "breakSlots": ["12:00-13:00"],
    
    // Algorithm-specific settings
    // For Genetic Algorithm:
    "populationSize": 100,
    "maxGenerations": 1000,
    "crossoverRate": 0.8,
    "mutationRate": 0.1,
    
    // For Simulated Annealing:
    "initialTemperature": 1000,
    "coolingRate": 0.995,
    "maxIterations": 10000,
    
    // For Backtracking/CSP:
    "maxBacktracks": 10000
  }
}
```

### Algorithm Selection Guide

**Choose Greedy when:**
- ✅ Quick results needed
- ✅ Simple scheduling (few constraints)
- ✅ Small datasets (< 50 courses)

**Choose Backtracking when:**
- ✅ Need guaranteed feasible solution
- ✅ Complex constraints must be satisfied
- ✅ Medium datasets (50-200 courses)
- ✅ Can wait a bit longer

**Choose Simulated Annealing when:**
- ✅ Large datasets (200+ courses)
- ✅ Optimization more important than guarantees
- ✅ Can accept good (not perfect) solutions
- ✅ Want to avoid local optima

**Choose CSP when:**
- ✅ Many interrelated constraints
- ✅ Need systematic constraint propagation
- ✅ Want provably optimal solutions

**Choose Genetic Algorithm when:**
- ✅ Multiple optimization objectives
- ✅ Complex fitness landscape
- ✅ Can run for longer duration

**Choose Hybrid when:**
- ✅ Need best possible quality
- ✅ Have time for two-phase approach
- ✅ Want hard constraints + soft optimization

---

## Data Requirements

### Teachers
```javascript
{
  id: "T001",
  name: "Dr. Smith",
  email: "smith@university.edu",
  teacherType: "visiting",  // NEW: core, visiting, guest, adjunct
  priority: "high",         // low, medium, high
  subjects: ["Data Structures", "Algorithms"],
  maxHoursPerWeek: 20,
  availability: {
    monday: { available: true, startTime: "09:00", endTime: "17:00" },
    // ... other days
  }
}
```

### Courses
```javascript
{
  id: "CS201",
  name: "Data Structures",
  program: "Computer Engineering",
  year: 2,
  semester: 1,
  isCore: true,  // false for electives
  enrolledStudents: 60,
  sessions: {
    theory: {
      duration: 60,
      sessionsPerWeek: 3,
      requiredFeatures: ["Projector"]
    },
    practical: {
      duration: 120,
      sessionsPerWeek: 1,
      requiresLab: true,
      requiredFeatures: ["Computers"]
    }
  },
  assignedTeachers: [
    { teacherId: "T001", sessionTypes: ["Theory", "Practical"], isPrimary: true }
  ],
  divisions: [
    {
      divisionId: "A",
      studentCount: 30,
      batches: [
        { batchId: "A1", studentCount: 15, type: "Lab" },
        { batchId: "A2", studentCount: 15, type: "Lab" }
      ]
    }
  ]
}
```

### Classrooms
```javascript
{
  id: "R101",
  name: "Computer Lab 1",
  building: "Engineering Block",
  floor: "1",
  capacity: 30,
  type: "Computer Lab",
  features: ["Computers", "Projector", "Air Conditioning"],
  availability: {
    monday: { available: true, startTime: "08:00", endTime: "18:00" },
    // ... other days
  }
}
```

---

## Testing

### Test Scenarios

#### 1. Visiting Faculty Priority Test
```javascript
// Create test data with:
// - 1 visiting faculty teaching Course A
// - 1 core faculty teaching Course B
// Both courses need same time slot type
// Expected: Course A scheduled first
```

#### 2. Elective Conflict Test
```javascript
// Create test data with:
// - 3 elective courses for same student group
// - Students choose 1 of 3
// Expected: All 3 can run simultaneously with different teachers
```

#### 3. Lab Batch Test
```javascript
// Create test data with:
// - Course with 60 students
// - 2 batches (30 each) for labs
// Expected: 2 separate lab sessions scheduled
```

#### 4. Lab Simultaneous Test
```javascript
// Create test data with:
// - 2 different lab courses
// - 2 different teachers
// - Same lab classroom
// Expected: Can run simultaneously if capacity allows
```

---

## Next Steps

### Immediate (To make all algorithms work):

1. **Update CSP Solver** (Priority: HIGH)
   - Integrate ConstraintChecker
   - Add visiting faculty priority
   - Support electives and lab batches
   - Estimated time: 2-3 hours

2. **Update Genetic Algorithm** (Priority: HIGH)
   - Integrate ConstraintChecker in fitness
   - Update chromosome encoding
   - Add visiting faculty priority
   - Estimated time: 2-3 hours

3. **Update Hybrid Algorithm** (Priority: MEDIUM)
   - Connect enhanced CSP and GA
   - Add proper parameter passing
   - Estimated time: 1 hour

4. **Testing** (Priority: HIGH)
   - Create test datasets
   - Test each algorithm
   - Verify all constraints work
   - Estimated time: 2 hours

### Future Enhancements:

1. **Advanced Features:**
   - Multi-objective optimization UI
   - Real-time constraint violation highlighting
   - Interactive schedule editing with constraint checking
   - Schedule comparison tools

2. **Performance:**
   - Parallel population evaluation in GA
   - Incremental constraint checking
   - Caching of valid assignments
   - Database query optimization

3. **Quality Improvements:**
   - Machine learning for parameter tuning
   - Adaptive algorithm selection
   - Conflict resolution suggestions
   - Schedule quality scoring

---

## Key Implementation Details

### Elective Handling

Electives are courses where students choose 1 out of N options. They can run simultaneously because there's no student overlap.

```javascript
// In ConstraintChecker
checkStudentGroupConflict(assignment, schedule) {
  // ...
  const isElectiveException = 
    isElective && 
    slot.isElective && 
    slot.courseId !== courseId;  // Different elective courses
  
  if (isElectiveException) {
    return null; // No conflict
  }
  // ...
}
```

### Lab Batch Handling

Labs are split into batches (typically 2) for practical sessions.

```javascript
// In session extraction
if (course.sessions?.practical) {
  const batches = course.divisions?.[0]?.batches || 
    [{ batchId: 'default', studentCount: course.enrolledStudents }];
  
  for (const batch of batches) {
    sessions.push({
      ...courseInfo,
      sessionType: 'Practical',
      batchId: batch.batchId,
      studentCount: batch.studentCount,
      requiresLab: true
    });
  }
}
```

### Visiting Faculty Priority

Visiting faculty gets highest priority in scheduling order.

```javascript
// In Teacher model
getEffectivePriority() {
  if (this.teacherType === 'visiting' || this.teacherType === 'guest') {
    return 'high';
  }
  return this.priority;
}

// In algorithm sorting
sortSessionsByPriority(sessions) {
  return sessions.sort((a, b) => {
    const aHasVisiting = a.teacherIds?.some(tid => {
      const teacher = this.teachers.find(t => t.id === tid);
      return teacher?.teacherType === 'visiting';
    });
    // Visiting faculty sessions first
    if (aHasVisiting && !bHasVisiting) return -1;
    // ...
  });
}
```

---

## Troubleshooting

### Issue: Algorithm returns "No solution found"
**Cause:** Constraints too strict or insufficient resources
**Solution:**
1. Check teacher availability matches course requirements
2. Verify sufficient classrooms (especially labs)
3. Ensure time slots accommodate all sessions
4. Try relaxing soft constraints

### Issue: Many constraint violations in result
**Cause:** Algorithm couldn't satisfy all constraints
**Solution:**
1. Use Backtracking or CSP for guaranteed feasibility
2. Increase maxBacktracks or maxIterations
3. Check data quality (missing teachers, unavailable classrooms)

### Issue: Slow performance
**Cause:** Large dataset or complex constraints
**Solution:**
1. Use Greedy for quick testing
2. Use Simulated Annealing for large datasets
3. Reduce population size or iterations
4. Add more resources (teachers, classrooms)

---

## Summary

✅ **Completed:**
- ConstraintChecker utility with all constraint types
- Teacher model with visiting faculty support
- Backtracking Search algorithm
- Simulated Annealing algorithm
- OptimizationEngine routing
- Greedy Scheduler (already working)

⚠️ **Needs Enhancement:**
- CSP Solver (integrate new constraints)
- Genetic Algorithm (integrate new constraints)
- Hybrid CSP-GA (connect enhanced versions)

🎯 **Estimated Time to Complete:**
- CSP updates: 2-3 hours
- GA updates: 2-3 hours
- Hybrid updates: 1 hour
- Testing: 2 hours
- **Total: 7-10 hours**

The foundation is solid. The ConstraintChecker provides a unified way to validate all constraints. The new algorithms (Backtracking, Simulated Annealing) are ready to use. The existing algorithms (CSP, GA) just need to integrate the ConstraintChecker and update their session extraction logic.
