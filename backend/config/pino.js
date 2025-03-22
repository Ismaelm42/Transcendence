const pinoConfig = {
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			ignore: 'pid,hostname,reqId,req,res,responseTime',
			singleLine: false,
		},
	},
};

export default pinoConfig;
