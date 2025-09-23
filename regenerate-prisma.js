const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Regenerating Prisma client...');

// Change to the backend directory
process.chdir(path.join(__dirname, 'backend'));

// Run Prisma generate
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error generating Prisma client:', error);
    return;
  }

  console.log('📝 Prisma generate output:');
  console.log(stdout);

  if (stderr) {
    console.log('⚠️ Warnings:', stderr);
  }

  console.log('✅ Prisma client regenerated successfully!');

  // Also run database push to sync schema
  console.log('\n🔄 Pushing schema to database...');
  exec('npx prisma db push', (pushError, pushStdout, pushStderr) => {
    if (pushError) {
      console.error('❌ Error pushing schema:', pushError);
      return;
    }

    console.log('📝 Prisma push output:');
    console.log(pushStdout);

    if (pushStderr) {
      console.log('⚠️ Push warnings:', pushStderr);
    }

    console.log('✅ Database schema synchronized successfully!');
    console.log('\n🎉 Prisma client and database are now in sync. You can now restart your backend server.');
  });
});
