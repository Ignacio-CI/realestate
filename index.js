import express from 'express';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import propertiesRoutes from './routes/propertiesRoutes.js';
import db from './config/db.js';

const app = express();
const port = process.env.PORT || 3000;

// Enable Cookie Parser globally
app.use( cookieParser() );

// Enable CSRF globally
//app.use( csrf({cookie: true}) );

const csrfProtection = csrf({cookie: true});

// Enable form data reading
app.use(express.urlencoded({ extended: true }));

// Connect to database
try {
    await db.authenticate();
    db.sync();
    console.log('Connected to database');
} catch (error) {
    console.log(error);
}

// Seting Pug view engine
app.set('view engine', 'pug');
app.set('views', './views');

// Public
app.use( express.static('public') );


// Routing
app.use('/auth', csrfProtection, userRoutes);
app.use('/', propertiesRoutes);

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});