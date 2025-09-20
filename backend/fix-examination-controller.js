const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'examinationController.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of the problematic student select pattern
content = content.replace(/student: \{\s*select: \{\s*id: true,\s*firstName: true,\s*lastName: true,\s*email: true,\s*\}\s*\},/g, `student: {
          select: {
            id: true,
            studentId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },`);

// Replace the export grades pattern
content = content.replace(/student: \{\s*select: \{\s*firstName: true,\s*lastName: true,\s*email: true,\s*\}\s*\},/g, `student: {
          select: {
            studentId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },`);

// Fix the CSV generation
content = content.replace(/`\$\{grade\.student\.firstName\} \$\{grade\.student\.lastName\}`,\s*grade\.student\.email,/g, `\`\${grade.student.user.firstName} \${grade.student.user.lastName}\`,
        grade.student.user.email,`);

// Fix the orderBy clause
content = content.replace(/\{ student: \{ lastName: 'asc' \} \},\s*\{ student: \{ firstName: 'asc' \} \}/g, `{ student: { user: { lastName: 'asc' } } },
        { student: { user: { firstName: 'asc' } } }`);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed examination controller student relationships');