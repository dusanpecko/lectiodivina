module.exports = {
  apps: [{
    name: 'lectio',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/lectiodivina.org',
    instances: 1,
    exec_mode: 'fork',  // ✅ ZMENA: fork namiesto cluster
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/pm2/lectio-err.log',
    out_file: '/var/log/pm2/lectio-out.log',
    log_file: '/var/log/pm2/lectio-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    autorestart: true,
    min_uptime: '10s',
    max_restarts: 5,  // ✅ ZMENA: menej restartov
    monitoring: false,
    pmx: false
  }]
}