const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'scheduleController.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all teacher select patterns with proper User relationship
content = content.replace(/teacher: \{\s*select: \{\s*id: true,\s*firstName: true,\s*lastName: true,\s*email: true\s*\}\s*\},/g, `teacher: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },`);

// Fix the export CSV generation for teacher names
content = content.replace(/schedule\.teacher \? `\$\{schedule\.teacher\.firstName\} \$\{schedule\.teacher\.lastName\}` : '',/g, `schedule.teacher ? \`\${schedule.teacher.user.firstName} \${schedule.teacher.user.lastName}\` : '',`);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed schedule controller teacher relationships');