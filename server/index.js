const express = require('express');
const rateLimiterMiddleware = require('./middleware/rateLimiterMiddelware');
const app = express()
const port = 8000

app.use(rateLimiterMiddleware);

app.listen(port || 5000, () => {
  console.log(`Server listening on port ${port}`)
})