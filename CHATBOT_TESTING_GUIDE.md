# 🚀 Chatbot Quick Test Guide

## Starting the Application

### 1. Start the Backend Server
```bash
cd server
npm run dev
```
Server will start on `http://localhost:5000`

### 2. Start the Frontend Client
```bash
cd client
npm run dev
```
Client will start on `http://localhost:5173`

## Testing the Chatbot

### Login to Test
1. Open `http://localhost:5173` in your browser
2. Login with one of these accounts:
   - **Admin**: Use admin credentials
   - **Student**: Use student credentials
   - **Faculty**: Use faculty credentials

### Where to Find the Chatbot
Look for the **floating chat icon** in the **bottom-right corner** of:
- Admin Dashboard
- Student Dashboard  
- View Timetable page
- Create Timetable page
- Generate Timetable page

### Sample Test Queries

#### 🎯 Test Teacher Location (Best Feature!)
```
"Where is Professor Smith?"
"Find teacher John Doe"
"Where can I find Dr. Johnson right now?"
```

#### 📅 Test Schedule Queries
```
"Show me my schedule for today"
"What classes do I have?"
"Show today's timetable"
```

#### 🏫 Test Room Availability
```
"Which rooms are free?"
"Show me available classrooms"
"What rooms are available right now?"
```

#### 🎯 Test Optimization Info
```
"How can I optimize my timetable?"
"Explain genetic algorithm"
"What's the best optimization method?"
```

#### 📚 Test General Queries
```
"Show me active timetables"
"List all courses"
"Show faculty members"
"Hello"
"Thank you"
```

## Expected Behavior

### ✅ What Should Work
1. **Floating Icon**: Appears in bottom-right with gradient colors
2. **Open Chat**: Click icon to open chat window
3. **Welcome Message**: Bot greets with role-specific message
4. **Quick Questions**: Shows 4 suggested questions
5. **Send Message**: Type and press Enter or click Send button
6. **Bot Response**: Shows typing indicator, then intelligent response
7. **Real-Time Data**: Queries actual database for current information
8. **Minimize/Maximize**: Toggle window size
9. **Close**: Close button hides chat

### 🎨 UI Features to Check
- ✓ Gradient chat button with pulse animation
- ✓ Smooth open/close animations
- ✓ Dark mode support
- ✓ Message bubbles (user in blue, bot in white/gray)
- ✓ Avatar icons (user/bot)
- ✓ Timestamps on messages
- ✓ Typing indicator (3 bouncing dots)
- ✓ Auto-scroll to latest message
- ✓ Multi-line text input

## Troubleshooting

### Chatbot Icon Not Appearing
```bash
# Check browser console for errors
# Verify component is imported in the page
# Check if user is authenticated
```

### "Cannot connect to server" Error
```bash
# Verify backend is running on port 5000
cd server
npm run dev

# Check server logs for errors
```

### Incorrect/Generic Responses
```bash
# Ensure you have test data in database
cd server
node populate_test_data.js

# Verify timetable is marked as active
# Check teacher, classroom, course data exists
```

### Teacher Location Not Working
**Requirements**:
1. Active timetable exists (`status: 'active'`)
2. Teacher exists in database
3. Teacher has classes scheduled
4. Current time matches a scheduled class

**Test Setup**:
```bash
# Run this to check timetable status
cd server
node check_timetable_status.js

# Verify current day/time has classes scheduled
```

## Database Setup for Best Results

### Ensure You Have:
1. **Active Timetable**: At least 1 timetable with `status: 'active'`
2. **Teachers**: Multiple teachers with availability
3. **Classrooms**: Rooms with features
4. **Courses**: Course catalog
5. **Students**: Student records with divisions
6. **Schedule Entries**: Populated schedule in timetable

### Quick Test Data Setup
```bash
cd server
node populate_test_data.js
node setup_proper_test_data.js
```

## API Endpoints

### Test Directly with cURL or Postman

#### Send Message
```bash
POST http://localhost:5000/api/chatbot/message
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
{
  "message": "Where is Professor Smith?",
  "userRole": "student",
  "userId": "USER_ID"
}
```

#### Get Suggestions
```bash
GET http://localhost:5000/api/chatbot/suggestions
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

## Success Indicators

### ✅ Fully Working Chatbot
- [ ] Icon appears on all dashboards
- [ ] Chat window opens smoothly
- [ ] Welcome message is role-specific
- [ ] Quick questions appear
- [ ] Messages send successfully
- [ ] Typing indicator shows
- [ ] Bot responses are intelligent and relevant
- [ ] Teacher location returns real data
- [ ] Room availability shows current status
- [ ] Schedule queries return personalized data
- [ ] Optimization info is comprehensive
- [ ] Dark mode works correctly
- [ ] Minimize/maximize functions work
- [ ] Timestamps display correctly
- [ ] Auto-scroll works
- [ ] No console errors

## Performance Expectations

- **Response Time**: < 500ms for most queries
- **Teacher Location**: < 300ms (includes DB query)
- **Room Availability**: < 400ms (includes DB query)
- **Schedule Queries**: < 500ms (includes DB query)

## Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Edge 120+
- ✅ Safari 17+

## Mobile Responsiveness

- Optimized for mobile screens
- Touch-friendly interface
- Adaptive sizing
- Smooth animations

## Next Steps After Testing

1. **Add More Test Data**: Populate more teachers, rooms, courses
2. **Create Active Timetable**: Generate and activate a timetable
3. **Test Different Roles**: Login as admin, student, faculty
4. **Try Edge Cases**: Ask unusual questions, test error handling
5. **Check Performance**: Test with large datasets

## Known Limitations

- Requires active timetable for location tracking
- Teacher names must match database exactly (case-insensitive)
- Time-based queries depend on system time
- Real-time data updates on page refresh

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check server terminal logs
3. Verify database connection
4. Check authentication token
5. Review API response in Network tab

---

**Happy Testing! 🎉**

The chatbot is now fully integrated and ready to assist users with intelligent, context-aware responses!
