const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'controllers', 'scheduleController.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the incorrect teacher include pattern back to select
content = content.replace(/teacher: \{\s*include: \{\s*user: \{\s*select: \{\s*id: true,\s*firstName: true,\s*lastName: true,\s*email: true\s*\}\s*\}\s*\}\s*\},/g, `teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },`);

// Fix the CSV export back to direct teacher access
content = content.replace(/schedule\.teacher \? `\$\{schedule\.teacher\.user\.firstName\} \$\{schedule\.teacher\.user\.lastName\}` : '',/g, `schedule.teacher ? \`\${schedule.teacher.firstName} \${schedule.teacher.lastName}\` : '',`);

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed schedule controller teacher relationships back to User model');