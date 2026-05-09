import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app)  # Enable CORS so the frontend can communicate with the backend

DB_FILE = 'database.db'

def init_db():
    # Initialize the database with required tables if they don't exist
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Table for contact form submissions
    c.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table for newsletter subscriptions
    c.execute('''
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table for users
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table for saved configurations
    c.execute('''
        CREATE TABLE IF NOT EXISTS saved_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            image_url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table for user projects
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            progress_percent INTEGER NOT NULL,
            note TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not name or not email or not message:
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)', (name, email, message))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Contact form submitted successfully!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Missing email field'}), 400
        
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('INSERT INTO subscribers (email) VALUES (?)', (email,))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Subscribed successfully!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already subscribed!'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
        
    hashed_password = generate_password_hash(password)
    
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, hashed_password))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Registration successful!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already registered!'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = c.fetchone()
        conn.close()
        
        if user and check_password_hash(user['password'], password):
            return jsonify({'success': True, 'message': 'Login successful!', 'user': {'name': user['name'], 'email': user['email']}}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Missing email parameter'}), 400
        
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        
        # Get project
        c.execute('SELECT * FROM user_projects WHERE email = ?', (email,))
        project_row = c.fetchone()
        project = dict(project_row) if project_row else None
        
        # Get configs
        c.execute('SELECT * FROM saved_configs WHERE email = ? ORDER BY created_at DESC', (email,))
        configs = [dict(row) for row in c.fetchall()]
        
        conn.close()
        return jsonify({'success': True, 'project': project, 'configs': configs}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/configs', methods=['POST'])
def save_config():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    image_url = data.get('image_url', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80')
    
    if not email or not name:
        return jsonify({'error': 'Missing email or name'}), 400
        
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('INSERT INTO saved_configs (email, name, image_url) VALUES (?, ?, ?)', (email, name, image_url))
        
        # If user doesn't have a project yet, create a default one
        c.execute('SELECT id FROM user_projects WHERE email = ?', (email,))
        if not c.fetchone():
            c.execute('INSERT INTO user_projects (email, status, progress_percent, note) VALUES (?, ?, ?, ?)', 
                     (email, 'Planning', 25, 'We are reviewing your initial configuration.'))
                     
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Configuration saved!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize DB on start
    init_db()
    print("Database initialized.")
    # Run the server on port 5000
    app.run(debug=True, port=5000)
