module.exports = {
  apps: [
    {
      name: 'fleetmada',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/html/fleetmada',

      // 1 seule instance sur 1Go RAM
      instances: 1,
      exec_mode: 'fork',

      // Limites mémoire adaptées à 1Go RAM
      max_memory_restart: '400M',

      // Charger le fichier .env
      env_file: '/var/www/html/fleetmada/.env',

      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Logs
      out_file: '/var/log/pm2/fleetmada-out.log',
      error_file: '/var/log/pm2/fleetmada-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Redémarrage automatique
      autorestart: true,
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // Optimisation Node.js pour petite RAM
      node_args: '--max-old-space-size=350',
    },
  ],
};
