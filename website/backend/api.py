from flask import Flask, request, jsonify
from flask_restful import Resource, Api
import hashlib
import os
import hmac
import base64
from dotenv import load_dotenv

load_dotenv()
PEPPER = os.getenv("PEPPER")

app = Flask(__name__)
api = Api(app)

users = {}  # Structure: {username: {"salt": ..., "hash": ...}}

PBKDF2_ITERATIONS = 600000
PBKDF2_SALT_LENGTH = 32

def hash_password(password, salt=None):
    if not salt:
        salt = os.urandom(PBKDF2_SALT_LENGTH)
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        (password + PEPPER).encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS
    )
    return base64.b64encode(salt).decode(), base64.b64encode(pwd_hash).decode()

def verify_password(stored_salt, stored_hash, password):
    salt = base64.b64decode(stored_salt.encode())
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        (password + PEPPER).encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS
    )
    return hmac.compare_digest(base64.b64decode(stored_hash.encode()), pwd_hash)

class Register(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        if username in users:
            return {"message": "User already exists"}, 400
        if len(password) < 8:
            return {"message": "Password must be at least 8 characters long"}, 400
        salt, pwd_hash = hash_password(password)
        users[username] = {"salt": salt, "hash": pwd_hash}
        return {"message": "User registered successfully"}, 201

class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        user = users.get(username)
        if not user or not verify_password(user["salt"], user["hash"], password):
            return {"message": "Invalid username or password"}, 401
        return {"message": "Login successful"}, 200

api.add_resource(Register, "/register")
api.add_resource(Login, "/login")

class User(Resource):
    def get(self, user_id):
        return {user_id: users.get(user_id, {})}

    def put(self, user_id):
        users[user_id] = request.form["data"]
        return {user_id: users[user_id]}

api.add_resource(User, "/<string:user_id>")

if __name__ == "__main__":
    app.run(debug=True)