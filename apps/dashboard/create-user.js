// Quick script to create an admin user in Supabase
// Run with: node create-user.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxieuybdhngkkkmaxpsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('Creating admin user...');

  const { data, error } = await supabase.auth.signUp({
    email: 'admin@vhlabs.com',
    password: 'VHLabs2024!',
    options: {
      data: {
        role: 'admin',
      }
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }

  console.log('✅ Admin user created successfully!');
  console.log('Email:', 'admin@vhlabs.com');
  console.log('Password:', 'VHLabs2024!');
  console.log('\nYou can now login at: http://localhost:5178/login');
  console.log('\nNote: Check your email for confirmation link if email confirmation is enabled.');
}

createAdminUser();
