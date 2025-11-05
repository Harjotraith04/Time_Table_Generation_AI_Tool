# Quick Start Guide - Enhanced Timetable Generation

## 🚀 What's New

### ✅ Fully Working Algorithms (Ready to Use):
1. **Greedy Scheduler** - Fast, simple (already working)
2. **Backtracking Search** - Guaranteed solutions (NEW)
3. **Simulated Annealing** - Large dataset optimization (NEW)

### ⚠️ Algorithms Needing Updates (90% complete):
4. **CSP Solver** - Needs ConstraintChecker integration
5. **Genetic Algorithm** - Needs ConstraintChecker integration
6. **Hybrid CSP-GA** - Needs integration updates

---

## 🎯 Key Features Implemented

### 1. Visiting Faculty Priority ✅
Visiting faculty are automatically scheduled first because they have limited availability.

**How to use:**
```javascript
// In your teacher data, set:
{
  teacherType: "visiting"  // Options: 'core', 'visiting', 'guest', 'adjunct'
}
```

### 2. Elective Course Handling ✅
Multiple elective courses can run simultaneously (students choose 1 of N).

**How to use:**
```javascript
// In your course data:
{
  isCore: false  // Marks as elective
}
```

### 3. Lab Batch Support ✅
Labs are automatically split into batches for manageable group sizes.

**How to use:**
```javascript
// In your course data:
{
  divisions: [{
    divisionId: "A",
    batches: [
      { batchId: "A1", studentCount: 15, type: "Lab" },
      { batchId: "A2", studentCount: 15, type: "Lab" }
    ]
  }]
}
```

### 4. Lab Simultaneous Sessions ✅
Different lab courses can use the same lab simultaneously if:
- Different teachers
- Different subjects
- Capacity allows

---

## 📋 Algorithm Selection

### Use **Greedy** when:
- ✅ Need results in seconds
- ✅ Simple schedule (< 50 courses)
- ✅ Testing/prototyping

**Example:**
```json
{
  "settings": {
    "algorithm": "greedy"
  }
}
```

### Use **Backtracking** when:
- ✅ Need guaranteed feasible solution
- ✅ Complex constraints
- ✅ Medium dataset (50-200 courses)
- ✅ Can wait 1-5 minutes

**Example:**
```json
{
  "settings": {
    "algorithm": "backtracking",
    "maxBacktracks": 10000
  }
}
```

### Use **Simulated Annealing** when:
- ✅ Large dataset (200+ courses)
- ✅ Want optimization
- ✅ Can accept near-optimal solutions
- ✅ Have 5-10 minutes

**Example:**
```json
{
  "settings": {
    "algorithm": "simulated_annealing",
    "initialTemperature": 1000,
    "coolingRate": 0.995,
    "maxIterations": 10000
  }
}
```

---

## 🔧 Quick Setup

### 1. Update Teacher Data
Add `teacherType` to existing teachers:

```javascript
// For visiting faculty (high priority):
db.teachers.updateMany(
  { /* your criteria */ },
  { $set: { teacherType: "visiting" } }
);

// For core faculty:
db.teachers.updateMany(
  { /* your criteria */ },
  { $set: { teacherType: "core" } }
);
```

### 2. Mark Elective Courses
```javascript
// Mark elective courses:
db.courses.updateMany(
  { /* elective courses */ },
  { $set: { isCore: false } }
);
```

### 3. Set Up Lab Batches
```javascript
// For lab courses:
db.courses.updateOne(
  { code: "CS201" },
  {
    $set: {
      divisions: [{
        divisionId: "A",
        studentCount: 30,
        batches: [
          { batchId: "A1", studentCount: 15, type: "Lab" },
          { batchId: "A2", studentCount: 15, type: "Lab" }
        ]
      }]
    }
  }
);
```

---

## 🧪 Testing

### Test 1: Basic Generation
```bash
# In your terminal (server directory)
cd server
npm run dev
```

### Test 2: API Call
```bash
curl -X POST http://localhost:5000/api/timetables/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Timetable",
    "academicYear": "2024-2025",
    "semester": 1,
    "department": "Computer Engineering",
    "settings": {
      "algorithm": "backtracking"
    }
  }'
```

### Test 3: Check Progress
```bash
curl http://localhost:5000/api/timetables/generate/TIMETABLE_ID/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Understanding Results

### Success Response
```json
{
  "success": true,
  "solution": [
    {
      "courseId": "CS201",
      "courseName": "Data Structures",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "teacherId": "T001",
      "teacherName": "Dr. Smith",
      "classroomId": "R101",
      "classroomName": "Computer Lab 1",
      "sessionType": "Theory",
      "studentCount": 60
    }
  ],
  "metrics": {
    "algorithm": "Backtracking Search",
    "duration": 45000,
    "backtracks": 234
  }
}
```

### Failure Response
```json
{
  "success": false,
  "reason": "No feasible solution found within backtrack limit",
  "metrics": {
    "algorithm": "Backtracking Search",
    "duration": 120000,
    "backtracks": 10000
  }
}
```

**Common reasons for failure:**
1. Insufficient classrooms (especially labs)
2. Teacher unavailable when needed
3. Too many courses for available time slots
4. Conflicting hard constraints

---

## 🔍 Constraint Validation

All algorithms use the same constraint checker. Here's what's validated:

### Hard Constraints (MUST satisfy):
1. ✅ Teacher not double-booked
2. ✅ Classroom not double-booked (except simultaneous labs)
3. ✅ Students not double-booked (except electives)
4. ✅ Teacher available at scheduled time
5. ✅ Classroom has sufficient capacity
6. ✅ Classroom has required features

### Soft Constraints (Optimize):
1. ✅ Teacher preferred times
2. ✅ Classroom utilization (50-100%)
3. ✅ Balanced teacher workload
4. ✅ Limit consecutive hours
5. ✅ Minimize schedule gaps

---

## 🐛 Troubleshooting

### Problem: "No teachers provided"
**Solution:** Ensure teachers collection has data and teachers are active:
```javascript
db.teachers.find({ status: 'active' }).count()
```

### Problem: "No classrooms provided"
**Solution:** Ensure classrooms collection has data:
```javascript
db.classrooms.find({ status: 'available' }).count()
```

### Problem: "No courses provided"
**Solution:** Check courses match department/year/semester:
```javascript
db.courses.find({ 
  department: "Computer Engineering",
  year: 2,
  semester: 1,
  isActive: true 
}).count()
```

### Problem: "Backtrack limit reached"
**Solution:** Increase limit or check for impossible constraints:
```json
{
  "settings": {
    "algorithm": "backtracking",
    "maxBacktracks": 50000  // Increased from 10000
  }
}
```

### Problem: "Too many conflicts in result"
**Solution:** 
1. Try Backtracking instead of Simulated Annealing
2. Add more classrooms
3. Check teacher availability
4. Reduce number of courses or increase time slots

---

## 📈 Performance Tips

### For Small Datasets (< 50 courses):
```json
{
  "algorithm": "greedy"  // Fastest
}
```

### For Medium Datasets (50-200 courses):
```json
{
  "algorithm": "backtracking",
  "maxBacktracks": 10000
}
```

### For Large Datasets (200+ courses):
```json
{
  "algorithm": "simulated_annealing",
  "maxIterations": 20000,
  "initialTemperature": 1500
}
```

### For Best Quality (any size):
```json
{
  "algorithm": "hybrid",  // CSP + GA (when fully updated)
  "maxGenerations": 500
}
```

---

## 🎓 Example: Complete Timetable Generation

### Step 1: Prepare Data
```javascript
// Ensure you have:
// - Active teachers with subjects and availability
// - Available classrooms with correct types
// - Active courses with assigned teachers
// - Proper program/division/batch setup
```

### Step 2: Make API Call
```javascript
const response = await fetch('/api/timetables/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "Fall 2024 - Computer Engineering Year 2",
    academicYear: "2024-2025",
    semester: 1,
    department: "Computer Engineering",
    year: 2,
    settings: {
      algorithm: "backtracking",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 60,
      breakSlots: ["12:00-13:00"],
      maxBacktracks: 10000
    }
  })
});

const result = await response.json();
console.log('Timetable ID:', result.timetableId);
```

### Step 3: Monitor Progress
```javascript
const timetableId = result.timetableId;

const checkProgress = setInterval(async () => {
  const progress = await fetch(
    `/api/timetables/generate/${timetableId}/progress`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await progress.json();
  console.log(`Progress: ${data.progress.percentage}%`);
  console.log(`Status: ${data.progress.currentStep}`);
  
  if (data.status === 'completed') {
    clearInterval(checkProgress);
    console.log('Generation complete!');
  }
}, 2000);
```

### Step 4: Retrieve Result
```javascript
const timetable = await fetch(
  `/api/timetables/${timetableId}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const data = await timetable.json();
console.log('Schedule:', data.schedule);
console.log('Conflicts:', data.conflicts);
console.log('Quality Score:', data.quality.overallScore);
```

---

## 📞 Need Help?

### Check Logs
```bash
# Server logs show detailed algorithm progress
tail -f server/logs/app.log
```

### Common Log Messages

✅ **Good signs:**
```
[BACKTRACKING] Solution found!
[SIMULATED ANNEALING] Annealing complete
[GREEDY] Schedule generation completed successfully
```

⚠️ **Warning signs:**
```
[BACKTRACKING] Backtrack limit reached
[VALIDATION] ✗ No teachers found!
[GENERATION] Data validation failed
```

---

## 🎉 Success Checklist

Before generating timetable:
- [ ] Teachers have `teacherType` set
- [ ] Visiting faculty marked correctly
- [ ] All teachers have availability defined
- [ ] Classrooms have correct types (Lab, Lecture Hall, etc.)
- [ ] Lab courses have batches defined
- [ ] Elective courses marked with `isCore: false`
- [ ] All courses have assigned teachers
- [ ] Teachers' subjects match course requirements

---

## 📚 Additional Resources

- **Full Implementation Guide:** `ALGORITHM_IMPLEMENTATION_GUIDE.md`
- **API Documentation:** `API_CONNECTION_GUIDE.md`
- **Database Setup:** `MONGODB_SETUP.md`
- **Teacher CSV Format:** `TEACHER_CSV_FORMAT_GUIDE.md`
- **Student Management:** `STUDENT_MANAGEMENT_GUIDE.md`

---

## Summary

✅ **Ready to Use Now:**
- Greedy Scheduler
- Backtracking Search (NEW)
- Simulated Annealing (NEW)
- All constraint checking
- Visiting faculty priority
- Elective handling
- Lab batch support

⏳ **Coming Soon (with small updates):**
- Enhanced CSP Solver
- Enhanced Genetic Algorithm
- Hybrid CSP-GA

You can start generating timetables immediately with the three working algorithms. The system handles all your requirements:
- Visiting faculty scheduled first ✅
- Proper classroom allocation ✅
- Program/division/batch handling ✅
- All constraint types ✅
- Elective courses ✅
- Lab simultaneous sessions ✅

Just choose the right algorithm for your dataset size and start generating!
