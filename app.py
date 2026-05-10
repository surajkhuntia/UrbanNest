from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS so the frontend can communicate with the backend

client = MongoClient('mongodb+srv://surajkhuntia686_db_user:BtUmernZeNZsaJc7@cluster0.t1qyu7l.mongodb.net/?appName=Cluster0')
db = client.urbannest

def init_db():
    # Initialize the database with required collections and indexes if they don't exist
    db.subscribers.create_index("email", unique=True)
    db.users.create_index("email", unique=True)
    db.user_projects.create_index("email", unique=True)

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    
    if not name or not email or not message:
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        db.contacts.insert_one({
            "name": name,
            "email": email,
            "message": message,
            "created_at": datetime.utcnow()
        })
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
        db.subscribers.insert_one({
            "email": email,
            "created_at": datetime.utcnow()
        })
        return jsonify({'success': True, 'message': 'Subscribed successfully!'}), 201
    except DuplicateKeyError:
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
        db.users.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        })
        return jsonify({'success': True, 'message': 'Registration successful!'}), 201
    except DuplicateKeyError:
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
        user = db.users.find_one({"email": email})
        
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
        # Get project
        project = db.user_projects.find_one({"email": email}, {"_id": 0})
        
        # Get configs
        configs = list(db.saved_configs.find({"email": email}, {"_id": 0}).sort("created_at", -1))
        
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
        db.saved_configs.insert_one({
            "email": email,
            "name": name,
            "image_url": image_url,
            "created_at": datetime.utcnow()
        })
        
        # If user doesn't have a project yet, create a default one
        project = db.user_projects.find_one({"email": email})
        if not project:
            db.user_projects.insert_one({
                "email": email,
                "status": "Planning",
                "progress_percent": 25,
                "note": "We are reviewing your initial configuration.",
                "updated_at": datetime.utcnow()
            })
                     
        return jsonify({'success': True, 'message': 'Configuration saved!'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize DB on start
    init_db()
    print("Database initialized.")
    # Run the server on port 5000
    app.run(debug=True, port=5000)
