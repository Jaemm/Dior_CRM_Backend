module.exports = {
    apps: [
        {
            name: 'Dior-CRM',
            script: './dist/main.js',
            exec_mode: 'cluster',
            instances: 2,
            listen_timeout: 40000,
            kill_timeout: 4000,
            wait_ready: true,
            autorestart: true,
            watch: false,
            merge_logs: true,
            time: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            out_file: './logs/pm2-out.log',
            error_file: './logs/pm2-error.log',
            log_file: './logs/pm2-combined.log',
            env: {
                NODE_ENV: 'production',
                PM2_LOG_SERVICE_NAME: 'Dior-CRM',
            },
        },
    ],
};
