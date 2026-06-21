const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in env.');
  process.exit(1);
}

// Minimal User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  token: String,
  resetPasswordExpires: Date
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const users = await User.find({ token: { $ne: null } });
    console.log(`\nFound ${users.length} users with active reset tokens:`);
    for (const u of users) {
      console.log(`- Email: ${u.email}`);
      console.log(`  Token: ${u.token}`);
      console.log(`  Expires: ${u.resetPasswordExpires}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Diagnostic error:', err);
  }
}

main();
