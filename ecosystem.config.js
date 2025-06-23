module.exports = {
  apps: [{
    name: 'lectio-divina',
    script: 'node',
    args: 'server.js',
    cwd: '/var/www/your-project',
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0',
      NEXT_PUBLIC_SUPABASE_URL: 'https://unnijykbupxguogrkolj.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubmlqeWtidXB4Z3VvZ3Jrb2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDc0NzQsImV4cCI6MjA2NDEyMzQ3NH0.wYtU0y3kpglp3lDXR3t12vWd4U2ajM1qRCYNKtN3lHA',
      NEXT_PUBLIC_TINYMCE_API_KEY: 'ycrc44wkta8dt1xlpwejlqqr36pm26z06yehg8mehha64dnh'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: '/var/log/pm2/lectio-divina-err.log',
    out_file: '/var/log/pm2/lectio-divina-out.log',
    log_file: '/var/log/pm2/lectio-divina-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    
    // Auto restart settings
    autorestart: true,
    min_uptime: '10s',
    max_restarts: 10,
    
    // Performance monitoring
    monitoring: false,
    pmx: false
  }]
}