const bcrypt = require('bcryptjs');

// Function to generate bcrypt hash for Owner email ID
async function generateHash() {
  // Change this password to whatever you want for the Owner account
  const password = 'ubeapg@7867';
  
  // Generate hash with cost factor of 10 (same as used in your app)
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=================================');
  console.log('BCRYPT HASH GENERATOR');
  console.log('=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('SQL Command to insert Owner:');ub
  console.log('=================================\n');
  console.log(`INSERT INTO admin_users (
  email,
  password_hash,
  full_name,
  role,
  phone,
  is_active
) VALUES (
  'ubeapg@gmail.com',
  '${hash}',
  'UBEA Owner',
  'Owner',
  '+919926770259',
  true
)
ON CONFLICT (email) 
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();`);
  console.log('\n=================================\n');
}

generateHash().catch(console.error);
