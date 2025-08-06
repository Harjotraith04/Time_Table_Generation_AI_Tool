# Test the Hybrid Advanced Timetable Generation Algorithm

## Overview
This document provides testing instructions for the new Hybrid Advanced Timetable Generation Algorithm.

## Features Tested

### 1. Core vs Elective Subject Handling
The algorithm properly categorizes and schedules:
- **Core Subjects**: MATH101, PHYS101, ENG101 (mandatory for all students)
- **Elective Groups**: 
  - CS_ADVANCED_GROUP_A (CS201, CS202, CS203)
  - EE_ADVANCED_GROUP_B (EE201, EE202)
  - MANAGEMENT_SOFT_SKILLS (MGMT201, MGMT202)

### 2. Batch Management
- **Core subjects**: Split into multiple batches (Batch A, Batch B)
- **Lab courses**: Smaller batch sizes for practical work
- **Parallel execution**: Different batches can run simultaneously

### 3. Advanced Constraints
- **Room type matching**: Computer labs for CS courses, lecture halls for theory
- **Teacher availability**: Respects teacher unavailable slots
- **Facility requirements**: GPU for computer vision, drawing boards for engineering drawing

## Testing the Algorithm

### Step 1: Test Algorithm Availability
```bash
curl -X GET http://localhost:8000/api/algorithms/algorithms
```

You should see the new `hybrid_advanced` algorithm in the response with its parameters and description.

### Step 2: Get Recommendations
```bash
curl -X POST http://localhost:8000/api/algorithms/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "dataSize": {
      "courses": 12,
      "teachers": 10,
      "classrooms": 15
    }
  }'
```

The hybrid advanced algorithm should be recommended for datasets with 20+ courses.

### Step 3: Test Timetable Generation
```bash
curl -X POST http://localhost:8000/api/timetables/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Algorithm Test",
    "academicYear": "2024-2025",
    "semester": 1,
    "department": "Engineering",
    "year": "Multi-Year",
    "settings": {
      "algorithm": "hybrid_advanced",
      "maxIterations": 5000,
      "initialTemperature": 1000,
      "coolingRate": 0.95,
      "tabuListSize": 30,
      "domainFilteringStrength": 0.8,
      "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 60,
      "breakSlots": ["12:00-13:00"],
      "maxConsecutiveHours": 3
    }
  }'
```

### Step 4: Monitor Progress
```bash
# Replace {timetableId} with the ID from step 3
curl -X GET http://localhost:8000/api/timetables/{timetableId}/progress
```

### Step 5: Get Results
```bash
# Replace {timetableId} with the ID from step 3
curl -X GET http://localhost:8000/api/timetables/{timetableId}
```

## Expected Results

### Algorithm Performance
- **Execution Time**: 2-8 minutes for the test dataset
- **Fitness Score**: 80-95% (higher is better)
- **Hard Constraint Satisfaction**: 100% (no conflicts)
- **Soft Constraint Satisfaction**: 70-85%

### Scheduling Quality
1. **Core Subjects**: Scheduled without conflicts for the same student group
2. **Elective Groups**: Optimized for parallel execution with different teachers
3. **Batch Distribution**: Multiple batches scheduled efficiently
4. **Room Matching**: Courses assigned to appropriate room types
5. **Teacher Utilization**: Balanced workload distribution

### Sample Output Structure
```json
{
  "status": "completed",
  "schedule": [
    {
      "courseId": "CORE_MATH_101",
      "courseName": "Calculus I",
      "teacherName": "Dr. John Smith",
      "classroomName": "Main Lecture Hall A",
      "timeSlotId": "Monday_0",
      "studentGroup": "ENG_2024_1ST",
      "isCore": true,
      "priority": 5
    }
  ],
  "metadata": {
    "algorithm": "Hybrid Advanced Algorithm",
    "fitness": 0.89,
    "violations": {
      "teacherConflicts": 0,
      "classroomConflicts": 0,
      "coreSubjectConflicts": 0
    },
    "statistics": {
      "coreSubjectsScheduled": 3,
      "electiveGroupsScheduled": 3,
      "totalAssignments": 12
    }
  }
}
```

## Data Loading

To test with the sample advanced data:

### Load Teachers
```bash
# Import the advanced teachers data
curl -X POST http://localhost:8000/api/data/teachers/import \
  -H "Content-Type: application/json" \
  -d @server/sample-data/advanced-teachers.json
```

### Load Classrooms
```bash
# Import the advanced classrooms data
curl -X POST http://localhost:8000/api/data/classrooms/import \
  -H "Content-Type: application/json" \
  -d @server/sample-data/advanced-classrooms.json
```

### Load Courses
```bash
# Import the advanced courses data
curl -X POST http://localhost:8000/api/data/courses/import \
  -H "Content-Type: application/json" \
  -d @server/sample-data/advanced-courses.json
```

## Validation Checklist

After running the algorithm, verify:

- [ ] All core subjects are scheduled without student group conflicts
- [ ] Elective groups allow parallel sessions with different teachers
- [ ] Batch courses are properly distributed
- [ ] Room requirements are satisfied (lab courses in labs, lectures in halls)
- [ ] Teacher availability constraints are respected
- [ ] No teacher double-booking exists
- [ ] No classroom double-booking exists
- [ ] Consecutive hour limits are maintained
- [ ] Algorithm metadata includes detailed statistics

## Performance Benchmarks

| Metric | Target | Typical Range |
|--------|---------|---------------|
| Execution Time | < 10 minutes | 2-8 minutes |
| Hard Constraint Satisfaction | 100% | 98-100% |
| Soft Constraint Satisfaction | > 70% | 70-85% |
| Overall Fitness | > 80% | 80-95% |
| Core Subject Conflicts | 0 | 0 |
| Teacher Conflicts | 0 | 0-1 |
| Room Conflicts | 0 | 0-1 |

## Troubleshooting

### Common Issues
1. **Low Fitness Score**: Check for unrealistic constraints or insufficient resources
2. **Long Execution Time**: Reduce maxIterations or increase coolingRate
3. **High Violations**: Review teacher availability and room capacity data
4. **Algorithm Crashes**: Verify all required course fields are present

### Debug Information
The algorithm provides detailed progress information including:
- Current iteration and temperature
- Best fitness achieved
- Constraint violation breakdown
- Algorithm phase (CSP, SA, Tabu, Intensification)

This comprehensive testing ensures the hybrid advanced algorithm performs optimally for complex timetabling scenarios.
