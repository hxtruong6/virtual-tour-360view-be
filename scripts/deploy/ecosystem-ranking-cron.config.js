const isProduction = process.env.NODE_ENV === 'production';

const envProduction = {
	NODE_ENV: 'production',
	PORT: 4101, // Different port for cron service
	// ... other production env vars (same as main config)
};

const envDevelopment = {
	NODE_ENV: 'development',
	PORT: 4101, // Different port for cron service
	// ... other development env vars (same as main config)
};

module.exports = {
	apps: [
		{
			name: `cwgame-ranking-cron-${isProduction ? 'prod' : 'dev'}`,
			script: 'dist/main.js',
			instances: 1, // Single instance for cron service
			exec_mode: 'fork', // Use fork mode for cron service
			autorestart: true,
			restart_delay: 1000,
			watch: false,
			max_memory_restart: isProduction ? '256M' : '128M', // Lower memory for cron service
			env_production: envProduction,
			env_development: envDevelopment,
			// Logging configuration
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			error_file: 'logs/ranking-cron-error.log',
			out_file: 'logs/ranking-cron-out.log',
			merge_logs: true,
			// Graceful shutdown
			kill_timeout: 3000,
			wait_ready: true,
			listen_timeout: 10000,
			// Monitoring
			exp_backoff_restart_delay: 1000,
			max_restarts: 10,
			// Performance
			node_args: '--max-old-space-size=512', // Lower memory limit
		},
	],
	deploy: {
		production: {
			user: 'xuantruong',
			host: '35.198.249.182',
			ref: 'origin/main',
			repo: 'git@gitlab.com:cwgame/backend.git',
			path: '/mnt/data1/be-prod-cron',
			'post-deploy': `pwd && pnpm install && pnpm run build:prod && pm2 startOrRestart scripts/deploy/ecosystem-ranking-cron.config.js --env production && pm2 save --force`,
		},
		development: {
			user: 'xuantruong',
			host: '35.198.249.182',
			ref: 'origin/dev',
			repo: 'git@gitlab.com:cwgame/backend.git',
			path: '/mnt/data1/be-dev-cron',
			'post-deploy': `pwd && pnpm install && pnpm run build:dev && pm2 startOrRestart scripts/deploy/ecosystem-ranking-cron.config.js --env development && pm2 save --force`,
		},
	},
};
