const envs = {
   INTERVAL: '1h',
   LOW_PERCENT: 10,
   GROW_PERCENT: 5,
   SERVER_TOKEN: '',
};

Object.entries(envs).forEach(([key, value]) => {
   process.env[key] = value;
});
