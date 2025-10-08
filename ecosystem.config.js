module.exports = {
  apps: [{
    name: 'lectio',
    script: 'npm',
    args: 'start',
    cwd: '/srv/lectio/app',
    instances: 1,
    exec_mode: 'fork',
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
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    min_uptime: '10s',
    max_restarts: 3, // ✅ ZNÍŽENÉ z 5 na 3
    restart_delay: 4000, // ✅ PRIDANÉ: čakanie pred reštartom
    kill_timeout: 5000, // ✅ PRIDANÉ: timeout pre kill
    wait_ready: true, // ✅ PRIDANÉ: čakaj na ready signal
    listen_timeout: 8000, // ✅ PRIDANÉ: timeout pre listen
    monitoring: false,
    pmx: false,
    // ✅ PRIDANÉ: Health check
    health_check: {
      enabled: true,
      interval: 30000, // check každých 30s
      max_failures: 3,
      timeout: 5000
    },
    // ✅ PRIDANÉ: Memory monitoring
    memory_limit: '1024M',
    // ✅ PRIDANÉ: CPU monitoring  
    cpu_limit: '80%'
  }]
}