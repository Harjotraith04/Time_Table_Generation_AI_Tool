# Query Resolution System - Complete Implementation Guide

## Overview
The Query Resolution System connects Students, Faculty, and Admin to manage queries, conflicts, and schedule changes efficiently. This system allows students and faculty to raise queries that administrators can review, approve, reject, or respond to.

## System Components

### 1. Backend (Server)

#### Database Model (`server/models/Query.js`)
The Query model includes:
- **Subject & Description**: Core query information
- **Type**: timetable-conflict, schedule-change, general, other
- **Status**: pending, approved, rejected, resolved
- **Priority**: low, medium, high, urgent
- **Submitted By**: User information (userId, name, email, role)
- **Admin Response**: Response from admin/faculty
- **Comments**: Array of comments for discussion
- **Timestamps**: Automatic tracking of creation and updates

#### API Routes (`server/routes/queries.js`)
Available endpoints:

**GET /api/queries**
- Fetch all queries with filters (status, type, priority)
- Pagination support
- Students see only their queries
- Admin/Faculty see all queries

**GET /api/queries/:id**
- Get detailed information about a specific query
- Includes populated user and timetable data

**POST /api/queries**
- Create a new query
- Validates required fields
- Sends email notifications to admins
- Available to all authenticated users

**PATCH /api/queries/:id/status**
- Update query status (Admin/Faculty only)
- Options: pending, approved, rejected, resolved
- Sends email notification to query submitter

**POST /api/queries/:id/respond**
- Add admin/faculty response (Admin/Faculty only)
- Automatically sets status to 'resolved'
- Sends email to query submitter

**POST /api/queries/:id/comments**
- Add comments to a query
- Available to query owner and admin/faculty

**DELETE /api/queries/:id**
- Delete a query (Admin only)

**GET /api/queries/statistics/overview**
- Get query statistics (Admin/Faculty only)
- Returns counts by status, type, and priority

### 2. Frontend (Client)

#### API Service (`client/src/services/api.js`)
Functions added:
```javascript
getQueries(params)          // Fetch queries with filters
getQuery(id)                 // Get single query details
createQuery(queryData)       // Create new query
updateQueryStatus(id, status) // Update status
respondToQuery(id, response) // Send response
addQueryComment(id, text)    // Add comment
getQueryStatistics()         // Get statistics
deleteQuery(id)              // Delete query
```

#### Components

**QueryManagement Component (`client/src/components/QueryManagement.jsx`)**
- **Admin Dashboard Integration**: Full query management interface
- **Features**:
  - Statistics dashboard (total, pending, approved, rejected, resolved)
  - Advanced filtering (status, type, priority)
  - Query list with action buttons
  - Approve/Reject/Respond functionality
  - Delete queries
  - View detailed query information
  - Response modal for sending detailed responses
  - Real-time status updates

**Student Dashboard (`client/src/pages/StudentDashboard.jsx`)**
- **Query Tab**: View all submitted queries
- **Create Query Modal**: 
  - Subject (required)
  - Description (required)
  - Type selection
  - Priority level
- **Query List**:
  - View status (pending, approved, rejected, resolved)
  - See admin responses
  - Color-coded status badges

**Teacher Dashboard (`client/src/pages/TeacherDashboard.jsx`)**
- Similar query submission capability as students
- Can raise queries about schedule conflicts
- View responses from admin

## Workflow

### Student/Faculty Workflow
1. **Raise Query**:
   - Click "Raise Query" button
   - Fill in subject, description, type, and priority
   - Submit query
   - Receive confirmation

2. **Track Query**:
   - View all submitted queries in "Queries" tab
   - See current status with color-coded badges:
     - 🟡 Yellow: Pending
     - 🟢 Green: Approved
     - 🔴 Red: Rejected
     - 🔵 Blue: Resolved
   - Read admin responses when available

### Admin Workflow
1. **View Queries**:
   - Access "Query Resolution" from sidebar
   - View statistics dashboard
   - Apply filters (status, type, priority)

2. **Process Query**:
   - **Approve**: Mark query as approved
   - **Reject**: Mark query as rejected
   - **Respond**: Provide detailed response (auto-resolves)
   - **Mark Pending**: Revert to pending if needed

3. **Manage Queries**:
   - View detailed information
   - Add comments for discussion
   - Delete inappropriate queries
   - Track resolution metrics

## Query Types
- **Timetable Conflict**: Schedule clashes or conflicts
- **Schedule Change**: Requests for schedule modifications
- **General**: General academic queries
- **Other**: Other types of queries

## Priority Levels
- **Urgent**: Requires immediate attention (🔴 Red)
- **High**: Important, needs quick resolution (🟠 Orange)
- **Medium**: Standard priority (🟡 Yellow)
- **Low**: Can be addressed later (🟢 Green)

## Email Notifications
The system automatically sends emails:
1. **To Admins**: When new query is created
2. **To Query Submitter**: When status changes or response is added

## Usage Examples

### Student Raising a Timetable Conflict
```
Subject: "Class Timing Conflict - CS101 and MATH201"
Description: "Both classes scheduled at same time on Monday 10 AM"
Type: "Timetable Conflict"
Priority: "High"
```

### Admin Response
```
Status: Approved
Response: "Thank you for bringing this to our attention. We've adjusted 
the CS101 lecture to 2 PM on Mondays. The updated timetable will be 
available shortly."
```

### Faculty Request for Schedule Change
```
Subject: "Request to Move CS301 Lecture"
Description: "Would like to move Thursday 3 PM lecture to Friday 11 AM 
due to a departmental meeting"
Type: "Schedule Change"
Priority: "Medium"
```

## Security Features
- **Authentication Required**: All endpoints require valid JWT token
- **Role-Based Access**:
  - Students: Can only view/create their own queries
  - Faculty: Can create queries and view responses
  - Admin: Full access to all queries and management functions
- **Input Validation**: All inputs validated server-side
- **XSS Protection**: User inputs sanitized

## Best Practices
1. **For Students/Faculty**:
   - Provide clear, detailed descriptions
   - Choose appropriate priority level
   - Check for existing similar queries
   - Respond to admin comments promptly

2. **For Admins**:
   - Review queries regularly
   - Respond within 24-48 hours
   - Provide clear, actionable responses
   - Use comments for clarification
   - Archive resolved queries periodically

## Integration Points
- **Admin Sidebar**: "Query Resolution" tab
- **Student Dashboard**: "Queries" tab with "Raise Query" button
- **Teacher Dashboard**: "Query Raised" section
- **Email Service**: Automated notifications
- **User Management**: Linked to user roles

## Database Indexes
For optimal performance:
- Index on `status` and `createdAt`
- Index on `submittedBy.userId`
- Index on `type`
- Index on `timetableId`

## Future Enhancements
- File attachments support
- Query templates for common issues
- Automated query routing
- SLA tracking and metrics
- Query escalation system
- Search functionality
- Export to CSV/PDF
- Query analytics dashboard

## Troubleshooting

### Common Issues
1. **Queries not loading**:
   - Check authentication token
   - Verify API endpoint is correct
   - Check network console for errors

2. **Cannot create query**:
   - Ensure all required fields are filled
   - Check user role and permissions
   - Verify backend service is running

3. **Email notifications not sent**:
   - Check email service configuration
   - Verify SMTP settings in `.env`
   - Check email service logs

## Testing
Test the system with:
```bash
# Run query endpoint tests
node server/test_query_endpoints.js

# Check database queries
node server/check_database.js
```

## Conclusion
The Query Resolution System provides a complete workflow for managing student and faculty queries, enabling efficient communication between all stakeholders in the timetable management process.
