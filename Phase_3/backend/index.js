const { startServer, stopServer } = require('./server');
const port = process.env.PORT || 3000;

startServer(port)
  .then((server) => {
    process.on('SIGINT', async () => {
      console.log('Received SIGINT. Closing server...');
      await stopServer(server);
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM. Closing server...');
      await stopServer(server);
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('Error starting server:', error);
  });
