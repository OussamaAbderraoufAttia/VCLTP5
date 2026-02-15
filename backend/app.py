from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app) # Allow React to communicate with Flask

# Database connection configuration (using Environment Variables)
def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST', 'db'),
        database=os.environ.get('DB_NAME', 'mydatabase'),
        user=os.environ.get('DB_USER', 'myuser'),
        password=os.environ.get('DB_PASSWORD', 'mypassword')
    )
    return conn

@app.route('/')
def hello_world():
    return 'Backend is running!'

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Missing credentials"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    
    # Simple check for demo purposes
    cur.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))
    user = cur.fetchone()
    
    cur.close()
    conn.close()

    if user:
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
