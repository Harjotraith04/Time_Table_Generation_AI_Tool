# Quick Integration Guide - Query Submission in Student Dashboard

## Step 1: Import the Component

In your `StudentDashboard.jsx` file, add the import:

```jsx
import QuerySubmissionForm from '../components/QuerySubmissionForm';
import { MessageCircle } from 'lucide-react';
```

## Step 2: Add State Management

Add state to control the modal visibility:

```jsx
const [showQueryForm, setShowQueryForm] = useState(false);
const [userQueries, setUserQueries] = useState([]);
```

## Step 3: Add Fetch Queries Function

Add a function to fetch the user's queries:

```jsx
const fetchUserQueries = async () => {
  try {
    const response = await getQueries();
    setUserQueries(response.data || []);
  } catch (error) {
    console.error('Error fetching queries:', error);
  }
};

useEffect(() => {
  fetchUserQueries();
}, []);
```

## Step 4: Add Query Submission Button

Add this button to your dashboard UI (e.g., in a quick actions section or header):

```jsx
<button
  onClick={() => setShowQueryForm(true)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all"
>
  <MessageCircle className="w-5 h-5" />
  Submit Query
</button>
```

## Step 5: Add the Modal

Add this at the end of your component's return statement (before the closing div):

```jsx
{showQueryForm && (
  <QuerySubmissionForm
    onClose={() => setShowQueryForm(false)}
    onSuccess={() => {
      fetchUserQueries(); // Refresh the queries list
    }}
  />
)}
```

## Step 6: Display User Queries (Optional)

Add a section to display the user's submitted queries:

```jsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold">My Queries</h2>
    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
      {userQueries.length} Total
    </span>
  </div>
  
  <div className="space-y-3">
    {userQueries.length === 0 ? (
      <p className="text-gray-500 text-center py-8">
        No queries submitted yet
      </p>
    ) : (
      userQueries.slice(0, 5).map((query) => (
        <div 
          key={query._id}
          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{query.subject}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${
              query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              query.status === 'approved' ? 'bg-green-100 text-green-800' :
              query.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {query.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {query.description.substring(0, 100)}...
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Submitted on {new Date(query.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))
    )}
  </div>
  
  {userQueries.length > 5 && (
    <button 
      onClick={() => navigate('/my-queries')}
      className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
    >
      View All Queries
    </button>
  )}
</div>
```

## Complete Example - Student Dashboard with Query Integration

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import QuerySubmissionForm from '../components/QuerySubmissionForm';
import { getQueries } from '../services/api';
import { MessageCircle, Calendar, Book, User } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [showQueryForm, setShowQueryForm] = useState(false);
  const [userQueries, setUserQueries] = useState([]);

  const fetchUserQueries = async () => {
    try {
      const response = await getQueries();
      setUserQueries(response.data || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  useEffect(() => {
    fetchUserQueries();
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <button
            onClick={() => setShowQueryForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Submit Query
          </button>
        </div>
      </header>

      <main className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400">My Queries</p>
                <p className="text-2xl font-bold">{userQueries.length}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold">
                  {userQueries.filter(q => q.status === 'pending').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold">
                  {userQueries.filter(q => q.status === 'resolved').length}
                </p>
              </div>
              <Book className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Attendance</p>
                <p className="text-2xl font-bold">95%</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Queries Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">My Recent Queries</h2>
          
          <div className="space-y-3">
            {userQueries.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">No queries submitted yet</p>
                <button
                  onClick={() => setShowQueryForm(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Your First Query
                </button>
              </div>
            ) : (
              userQueries.slice(0, 5).map((query) => (
                <div 
                  key={query._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{query.subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      query.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      query.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      query.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {query.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {query.description.substring(0, 100)}...
                  </p>
                  {query.adminResponse && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Admin Response:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        {query.adminResponse.substring(0, 150)}...
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted on {new Date(query.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Query Submission Modal */}
      {showQueryForm && (
        <QuerySubmissionForm
          onClose={() => setShowQueryForm(false)}
          onSuccess={() => {
            fetchUserQueries();
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
```

## Testing the Integration

1. **Start the servers**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. **Login as a student**

3. **Click "Submit Query"** button

4. **Fill out the form** with test data

5. **Submit the query**

6. **Verify**:
   - Query appears in the student's query list
   - Admin receives email notification (if configured)
   - Query appears in Admin Dashboard → Query Resolution

7. **Login as admin** and verify you can:
   - See the query in Query Resolution page
   - Approve/Reject the query
   - Send a response

8. **Check student dashboard** again to see the updated status

## Additional Features You Can Add

1. **Real-time notifications** using WebSocket
2. **File upload** for attachments
3. **Query templates** for common issues
4. **Query history** page with detailed view
5. **Notification badge** showing pending queries count
6. **Quick reply** from notification dropdown

## Troubleshooting

- **Query not appearing**: Check browser console for API errors
- **Email not sending**: Verify SMTP configuration in server/.env
- **Permission errors**: Ensure user is authenticated properly
- **404 errors**: Verify server routes are properly mounted
