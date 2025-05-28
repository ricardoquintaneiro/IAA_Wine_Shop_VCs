import base64
import datetime
import hashlib
import hmac
import os
import secrets
import sqlite3
from http import HTTPStatus

import jwt
from dotenv import load_dotenv
from flask import Flask, g, request
from flask_restful import Api, Resource

load_dotenv()
DATABASE_PATH = os.getenv("DATABASE_PATH")
PEPPER = base64.b64decode(os.getenv("PEPPER"))
JWT_SECRET_KEY = base64.b64decode(os.getenv("JWT_SECRET_KEY"))

if not PEPPER or not DATABASE_PATH or not JWT_SECRET_KEY:
    raise ValueError("Environment variables must be set.")

PBKDF2_ITERATIONS = 600000
PBKDF2_SALT_LENGTH = 16
JWT_TOKEN_EXPIRATION_MINUTES = 15
REFRESH_TOKEN_EXPIRATION_DAYS = 7

app = Flask(__name__)
api = Api(app)

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
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
    db.execute(
        "CREATE TABLE IF NOT EXISTS refresh_tokens ("
        "username TEXT, "
        "token TEXT, "
        "expires_at INTEGER, "
        "PRIMARY KEY(username, token), "
        "FOREIGN KEY(username) REFERENCES users(username) ON DELETE CASCADE"
        ")"
    )
    db.commit()

def hash_password(password, salt=None):
    if not salt:
        salt = os.urandom(PBKDF2_SALT_LENGTH)
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8") + PEPPER,
        salt,
        PBKDF2_ITERATIONS
    )
    return base64.b64encode(salt).decode(), base64.b64encode(pwd_hash).decode()

def verify_password(stored_salt, stored_hash, password):
    salt = base64.b64decode(stored_salt.encode())
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8") + PEPPER,
        salt,
        PBKDF2_ITERATIONS
    )
    return hmac.compare_digest(base64.b64decode(stored_hash.encode()), pwd_hash)

def create_access_token(username):
    payload = {
        "sub": username,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=JWT_TOKEN_EXPIRATION_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")

def create_refresh_token():
    return secrets.token_urlsafe(32)

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
        access_token = create_access_token(username)
        refresh_token = create_refresh_token()
        expires_at = int(
            (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS))
            .timestamp()
        )
        db.execute(
            "INSERT INTO refresh_tokens (username, token, expires_at) VALUES (?, ?, ?)",
            (username, refresh_token, expires_at)
        )
        db.commit()
        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }, HTTPStatus.OK

class Refresh(Resource):
    def post(self):
        data = request.get_json()
        refresh_token = data.get("refresh_token")
        db = get_db()
        row = db.execute(
            "SELECT username, expires_at FROM refresh_tokens WHERE token = ?", (refresh_token,)
        ).fetchone()
        if not row:
            return {"message": "Invalid refresh token"}, HTTPStatus.UNAUTHORIZED
        if row["expires_at"] < int(datetime.datetime.now(datetime.timezone.utc).timestamp()):
            db.execute("DELETE FROM refresh_tokens WHERE token = ?", (refresh_token,))
            db.commit()
            return {"message": "Refresh token expired"}, HTTPStatus.UNAUTHORIZED
        access_token = create_access_token(row["username"])
        return {"access_token": access_token}, HTTPStatus.OK

class User(Resource):
    # TODO: Remove this endpoint in production
    # It is only for debugging purposes to check user data.
    def get(self, username):
        db = get_db()
        user = db.execute("SELECT username, salt, password_hash FROM users WHERE username = ?", (username,)).fetchone()
        if not user:
            return {}, HTTPStatus.NOT_FOUND
        return {user["username"]: {"salt": user["salt"], "password_hash": user["password_hash"]}}

api.add_resource(Register, "/register")
api.add_resource(Login, "/login")
api.add_resource(Refresh, "/refresh")
api.add_resource(User, "/<string:username>")

if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(debug=True)