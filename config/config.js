/**
 * Port configuration.
 */
process.env.PORT = process.env.PORT || 3000;

/**
 * Enviorment configuration.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Token expiration (1 month).
 */
process.env.TOKEN_EXPIRATION = 60 * 60 * 24 * 30;

/**
 * Application secret.
 */
process.env.SECRET = process.env.SECRET || 'this-is-the-development-secret';

/**
 * Salt rounds for password hashing.
 */
process.env.SALT_ROUNDS = 10;

/**
 * Database connection.
 */
if (process.env.NODE_ENV === 'development') {
    process.env.DATABASE_URL = 'mongodb://jworker.ddns.net:27017/hamburguesas-ibeth';
} else {
    process.env.DATABASE_URL = process.env.MONGO_URL;
}
