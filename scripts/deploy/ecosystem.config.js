const argEnvIndex = process.argv.indexOf('--env');
let argEnv = (argEnvIndex !== -1 && process.argv[argEnvIndex + 1]) || '';

const dotenv = require('dotenv');

if (argEnv === 'production') {
	dotenv.config({ path: '.env.production' });
} else {
	dotenv.config({ path: '.env' });
}

console.log('** argEnv:', argEnv);

const isProduction = argEnv === 'production';
console.log('** isProduction:', isProduction);

const envProduction = {
	NODE_ENV: 'production',
	...process.env,
};

const envDevelopment = {
	NODE_ENV: 'development',
	...process.env,
};

module.exports = {
	apps: [
		{
			name: `cwgame-api-${isProduction ? 'prod' : 'dev'}`,
			script: 'dist/main.js',
			instances: 'max', // Use maximum number of instances based on CPU cores
			exec_mode: 'cluster',
			autorestart: true,
			restart_delay: 1000,
			watch: false,
			max_memory_restart: isProduction ? '512M' : '256M',
			env_production: envProduction,
			env_development: envDevelopment,
			instances: 1,
			// Logging configuration
			log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
			error_file: 'logs/error.log',
			out_file: 'logs/out.log',
			merge_logs: true,
			// Graceful shutdown
			kill_timeout: 3000,
			wait_ready: true,
			listen_timeout: 10000,
			// Monitoring
			exp_backoff_restart_delay: 1000,
			max_restarts: 10,
			// Performance
			node_args: '--max-old-space-size=1024',
		},
	],
	deploy: {
		production: {
			user: 'xuantruong', // Replace with your server user
			host: '35.198.249.182', // Replace with your server IP
			ref: 'origin/main',
			repo: 'git@gitlab.com:cwgame/backend.git', // Replace with your repo
			path: '/mnt/data1/be-prod',
			'post-deploy': `pwd && pnpm install && pnpm run build:prod && pm2 startOrRestart scripts/deploy/ecosystem.config.js --env production && pm2 save --force`,
		},
		development: {
			user: 'xuantruong', // Replace with your server user
			host: '35.198.249.182', // Replace with your server IP
			ref: 'origin/dev',
			repo: 'git@gitlab.com:cwgame/backend.git', // Replace with your repo
			path: '/mnt/data1/be-dev',
			'post-deploy': `pwd && pnpm install && pnpm run build:dev && pm2 startOrRestart scripts/deploy/ecosystem.config.js --env development && pm2 save --force`,
		},
	},
};
