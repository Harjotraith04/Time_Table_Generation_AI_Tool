# Query Resolution System Implementation

## Overview
This implementation adds a comprehensive Query Resolution system to the Time Table Generation AI Tool, allowing students and teachers to submit queries about timetables and enabling administrators to manage and respond to these queries.

## Changes Made

### 1. Frontend Changes

#### AdminSidebar.jsx
- **"All Time Tables"** now routes to `/view-timetable` instead of staying in admin dashboard
- **"Query Resolution"** now routes to `/query-resolution` page
- Updated navigation handler to support direct routing for these two menu items

#### New Pages Created

##### QueryResolution.jsx (`client/src/pages/QueryResolution.jsx`)
A comprehensive admin interface for managing queries with the following features:
- **Statistics Dashboard**: Shows total, pending, approved, and rejected queries
- **Advanced Filtering**: Filter by status, type, and search queries
- **Query Management Table**: View all queries in a sortable table format
- **Actions Available**:
  - View query details in a modal
  - Approve pending queries
  - Reject pending queries
  - Send custom responses
  - Delete queries (admin only)
- **Real-time Updates**: Refresh button to fetch latest queries
- **Dark Mode Support**: Fully integrated with theme system

##### QuerySubmissionForm.jsx (`client/src/components/QuerySubmissionForm.jsx`)
A reusable form component that can be integrated into student/teacher dashboards:
- **Query Types**: 
  - General Query
  - Timetable Conflict
  - Schedule Change Request
  - Other
- **Priority Levels**: Low, Medium, High, Urgent
- **Optional Timetable Linking**: Associate queries with specific timetables
- **Form Validation**: Real-time validation and error handling
- **Success/Error Feedback**: Clear visual feedback for submission status

#### App.jsx
- Added import for `QueryResolution` component
- Added route `/query-resolution` protected for admin and faculty roles

#### API Service (`client/src/services/api.js`)
Added new API functions:
- `getQueries(params)` - Fetch all queries with filters
- `getQuery(id)` - Get single query details
- `createQuery(queryData)` - Submit a new query
- `updateQueryStatus(id, status)` - Update query status (approve/reject/resolve)
- `respondToQuery(id, response)` - Send admin response to a query
- `deleteQuery(id)` - Delete a query

### 2. Backend Changes

#### New Model: Query.js (`server/models/Query.js`)
MongoDB schema for queries with:
- **Fields**:
  - `subject`: Query title
  - `description`: Detailed query content
  - `type`: Category of query
  - `status`: pending/approved/rejected/resolved
  - `submittedBy`: User information (userId, name, email, role)
  - `timetableId`: Optional reference to timetable
  - `adminResponse`: Response text from admin
  - `respondedBy`: Admin who responded
  - `respondedAt`: Response timestamp
  - `priority`: low/medium/high/urgent
  - `attachments`: Array for future file uploads
  - `comments`: Array of comments on the query
  - `resolutionNotes`: Internal notes
- **Indexes**: Optimized for common query patterns

#### New Routes: queries.js (`server/routes/queries.js`)
RESTful API endpoints:
- `GET /api/queries` - Get all queries (with pagination and filters)
- `GET /api/queries/:id` - Get specific query
- `POST /api/queries` - Create new query
- `PATCH /api/queries/:id/status` - Update query status (admin/faculty)
- `POST /api/queries/:id/respond` - Send response (admin/faculty)
- `POST /api/queries/:id/comments` - Add comment to query
- `DELETE /api/queries/:id` - Delete query (admin only)
- `GET /api/queries/statistics/overview` - Get query statistics (admin/faculty)

**Security Features**:
- Authentication required for all routes
- Role-based access control (students can only see their own queries)
- Input validation using express-validator
- Proper error handling

#### Email Service Updates (`server/utils/emailService.js`)
Added two new email functions:

##### sendQueryNotification(adminEmail, query, submitter)
- Sends email to admins when a new query is submitted
- Includes query details and submitter information
- Professional HTML email template

##### sendQueryResponseEmail(userEmail, query, status, response)
- Notifies users when their query status changes
- Color-coded based on status (approved/rejected/resolved)
- Includes admin response if provided

#### Server.js Updates
- Added import for `queryRoutes`
- Mounted routes at `/api/queries`

## Usage Guide

### For Students/Teachers:
1. Open the Student/Teacher Dashboard
2. Click on "Submit Query" button (integrate QuerySubmissionForm component)
3. Fill in query details:
   - Subject
   - Type (General, Timetable Conflict, Schedule Change, Other)
   - Priority
   - Description
4. Submit and receive email notification when admin responds

### For Admins:
1. Navigate to Admin Dashboard
2. Click on "Query Resolution" in sidebar
3. View all queries with statistics
4. Filter by status/type or search queries
5. Click on a query to:
   - View full details
   - Approve/Reject pending queries
   - Send custom response
   - Delete if necessary
6. Users receive automatic email notifications for status changes

## Integration Points

### To Add Query Button to Student Dashboard:
```jsx
import QuerySubmissionForm from '../components/QuerySubmissionForm';

// In your component
const [showQueryForm, setShowQueryForm] = useState(false);

// Button
<button onClick={() => setShowQueryForm(true)}>
  Submit Query
</button>

// Form Modal
{showQueryForm && (
  <QuerySubmissionForm
    onClose={() => setShowQueryForm(false)}
    onSuccess={() => {
      // Refresh queries list if needed
      fetchQueries();
    }}
  />
)}
```

## Database Collections

### queries
Stores all query submissions with full history and relationships to users and timetables.

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/queries` | All (filtered) | Get all queries |
| GET | `/api/queries/:id` | Owner/Admin | Get specific query |
| POST | `/api/queries` | All | Create new query |
| PATCH | `/api/queries/:id/status` | Admin/Faculty | Update status |
| POST | `/api/queries/:id/respond` | Admin/Faculty | Send response |
| POST | `/api/queries/:id/comments` | Related users | Add comment |
| DELETE | `/api/queries/:id` | Admin | Delete query |
| GET | `/api/queries/statistics/overview` | Admin/Faculty | Get statistics |

## Email Notifications

### When Query is Submitted:
- All admins receive notification email
- Email contains full query details and submitter information

### When Status Changes:
- Submitter receives email notification
- Email includes status update and admin response (if provided)

## Future Enhancements

1. **File Attachments**: Allow users to upload screenshots or documents
2. **Real-time Notifications**: WebSocket integration for instant updates
3. **Query Templates**: Pre-defined templates for common query types
4. **Bulk Actions**: Process multiple queries at once
5. **Query Analytics**: Dashboard with charts and trends
6. **Auto-assignment**: Automatically route queries to relevant admins
7. **SLA Tracking**: Monitor response times and query resolution metrics
8. **Knowledge Base**: Convert resolved queries into FAQ articles

## Testing Checklist

- [ ] Query submission from student dashboard
- [ ] Query appears in admin Query Resolution page
- [ ] Email notifications sent to admins
- [ ] Admin can approve/reject queries
- [ ] Admin can send custom responses
- [ ] Status update emails sent to users
- [ ] Filtering and search work correctly
- [ ] Permission checks enforce access control
- [ ] Dark mode displays correctly
- [ ] Mobile responsive design works

## Notes

- All routes are protected with authentication
- Students can only view their own queries
- Admins and faculty can view all queries
- Email functionality requires SMTP configuration in .env
- The system is designed to scale with additional features
