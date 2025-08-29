module.exports = {
	lang: 'en-US',
	title: 'cwgame Documentation 🎉',
	description: 'Documentation for CWGame API',
	base: process.env.DEPLOY_ENV === 'gh-pages' ? '/cwgame-docs/' : '/',
	themeConfig: {
		sidebar: [
			['/', 'Introduction'],
			'/docs/development',
			'/docs/architecture',
			'/docs/naming-cheatsheet',
			// '/docs/routing',
			// '/docs/state',
			'/docs/linting',
			// '/docs/editors',
			// '/docs/production',
			// '/docs/troubleshooting',
		],
	},
};
