const express = require('express');
const app = express();
const userRoute = require('./src/users/userRoutes');
const topicRoute = require('./src/topics/topicRoutes');
const articlesRoute = require('./src/articles/articleRoutes');

const cors = require('cors');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddleware');
app.use(cors());
app.use(express.json());
const PORT = 5000;

app.use((req, res, next) => {
	console.log(new Date(Date.now()).toTimeString(), req.method, req.path);
	next();
});

app.use('/api/users', userRoute);
app.use('/api/topics', topicRoute);
app.use('/api/articles', articlesRoute);

app.get('/', (req, res) => {
	res.status(200).send('get Server');
});

app.use(notFound); // Handle 404 Not Found errors
app.use(errorHandler); // Custom error handler for other types of errors

app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});
