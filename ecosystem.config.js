module.exports = {
  apps: [
    {
      name: 'auth-api',
      script: 'src/index.ts', // Your TS entry file
      watch: true, // Optional, reload on file changes
      exec_interpreter: 'ts-node', // Run TS files directly
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
