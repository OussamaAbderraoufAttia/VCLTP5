CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
);

-- Insert a default user for testing
INSERT INTO users (username, password) VALUES ('user', 'password') ON CONFLICT DO NOTHING;
