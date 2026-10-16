import Node from '#Node';
const { combine, timestamp, printf } = Node.Winston.format;

const logFormat = printf(({ level, message, metadata }) => {
    const { timestamp, stack } = metadata;
    return `${timestamp} [${level.toUpperCase()}] (${stack}) ${message}`;
});

function getLogFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}.log`;
};

function initLogger() {
    const errorLogFileName = `./logs/error/${getLogFileName()}`;

    this.logger = Node.Winston.createLogger({
        level: 'error',
        format: combine(
            timestamp(),
            Node.Winston.format.splat(),
            Node.Winston.format.errors({ stack: true }),
            Node.Winston.format.metadata(),
            logFormat
        ),
        transports: [
            new Node.Winston.transports.Console({
                format: combine(logFormat),
            }),
            new Node.Winston.transports.File({ filename: errorLogFileName, level: "error" }),
        ],
    });
};

export default { initLogger };
