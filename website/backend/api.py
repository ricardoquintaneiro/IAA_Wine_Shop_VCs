import base64
import hashlib
import hmac
import os
import sqlite3
from http import HTTPStatus

from dotenv import load_dotenv
from flask import Flask, g, request
from flask_restful import Api, Resource

load_dotenv()
PEPPER = os.getenv("PEPPER")
DATABASE_PATH = os.getenv("DATABASE_PATH")

if not PEPPER or not DATABASE_PATH:
    raise ValueError("PEPPER and DATABASE_PATH must be set in the environment variables.")

PBKDF2_ITERATIONS = 600000
PBKDF2_SALT_LENGTH = 16

app = Flask(__name__)
api = Api(app)

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.execute(
        "CREATE TABLE IF NOT EXISTS users ("
        "username TEXT PRIMARY KEY, "
        "salt TEXT NOT NULL, "
        "password_hash TEXT NOT NULL)"
    )
    db.commit()

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
        db = get_db()
        user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if user:
            return {"message": "User already exists"}, HTTPStatus.BAD_REQUEST
        if len(password) < 8:
            return {"message": "Password must be at least 8 characters long"}, HTTPStatus.BAD_REQUEST
        salt, pwd_hash = hash_password(password)
        db.execute(
            "INSERT INTO users (username, salt, password_hash) VALUES (?, ?, ?)",
            (username, salt, pwd_hash)
        )
        db.commit()
        return {"message": "User registered successfully"}, HTTPStatus.CREATED

class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        db = get_db()
        user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if not user or not verify_password(user["salt"], user["password_hash"], password):
            return {"message": "Invalid username or password"}, HTTPStatus.UNAUTHORIZED
        return {"message": "Login successful"}, HTTPStatus.OK

class User(Resource):
    def get(self, username):
        db = get_db()
        user = db.execute("SELECT username, salt, password_hash FROM users WHERE username = ?", (username,)).fetchone()
        if not user:
            return {}, HTTPStatus.NOT_FOUND
        return {user["username"]: {"salt": user["salt"], "password_hash": user["password_hash"]}}

api.add_resource(Register, "/register")
api.add_resource(Login, "/login")
api.add_resource(User, "/<string:username>")

if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(debug=True)