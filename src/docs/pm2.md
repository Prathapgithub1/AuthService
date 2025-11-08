# instll these below dep

npm install -g pm2
npm install ts-node typescript

# Create ecosystem.config.js for PM2

This file tells PM2 how to run your TypeScript app in different environments.

module.exports = {
apps: [
{
name: "auth-api",
script: "src/index.ts", // Your TS entry file
watch: true, // Optional, reload on file changes
exec_interpreter: "ts-node", // Run TS files directly
env: {
NODE_ENV: "development",
PORT: 5000,
},
env_production: {
NODE_ENV: "production",
PORT: 5000,
},
},
],
};

# npm install -g ts-node

# pm2 start ecosystem.config.js --env development

# not working to do this

1. Build your TypeScript project
   npm run build

This compiles your src/ TS files into dist/ JS files.

Ensure dist/index.js exists (or your entry file in dist/).

2. Start your app with PM2
   pm2 start dist/index.js --name auth-api

--name auth-api → gives a friendly name in PM2.

3. Check the PM2 status
   pm2 list

You should see auth-api with status: online.
