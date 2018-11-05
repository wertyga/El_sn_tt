export const host = (path) => process.env.NODE_ENV === 'development'
  ? `http://localhost:3005${path}`
  : `http://46.101.209.10:3005${path}`;

global.host = host; // host path
global.getToken = () => localStorage.getItem('token'); // Get localStorage token


