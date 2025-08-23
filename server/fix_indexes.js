// MongoDB shell script to fix the duplicate key error
// Run this in MongoDB shell or MongoDB Compass

// Switch to your database
use test;

// Check current indexes on students collection
db.students.getIndexes();

// Drop the problematic id_1 index if it exists
try {
    db.students.dropIndex("id_1");
    print("Dropped id_1 index successfully");
} catch (e) {
    print("id_1 index doesn't exist or couldn't be dropped: " + e.message);
}

// Remove any documents with null id field
var result = db.students.updateMany(
    { id: null }, 
    { $unset: { id: "" } }
);
print("Removed id field from " + result.modifiedCount + " documents");

// Check for documents without proper studentId
var docsWithoutStudentId = db.students.find({
    $or: [
        { studentId: { $exists: false } },
        { studentId: null },
        { studentId: "" }
    ]
}).count();

print("Documents without proper studentId: " + docsWithoutStudentId);

// Create proper unique index on studentId
try {
    db.students.createIndex({ studentId: 1 }, { unique: true });
    print("Created unique index on studentId");
} catch (e) {
    print("Error creating studentId index: " + e.message);
}

// Create proper unique index on email
try {
    db.students.createIndex({ "personalInfo.email": 1 }, { unique: true });
    print("Created unique index on email");
} catch (e) {
    print("Error creating email index: " + e.message);
}

// Show final indexes
print("Final indexes:");
db.students.getIndexes().forEach(function(index) {
    printjson(index);
});
