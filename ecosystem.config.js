// https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
    apps: [
        {
            name: 'dior-crm',
            script: './dist/main.js', // cluster mode run with node only, not npm
            args: 'restart',
            exec_mode: 'cluster', // default fork
            instances: 2, //"max",
            listen_timeout: 40000,
            kill_timeout: 4000,
            wait_ready: true,
            autorestart: true,
            watch: false,
            // max_memory_restart: "1G",
            log_date_format: 'YYYY-MM-DD HH:mm Z',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
