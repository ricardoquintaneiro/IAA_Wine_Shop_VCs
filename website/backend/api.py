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
    db.execute(
        "CREATE TABLE IF NOT EXISTS wines ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, "
        "verifiable_credential_id TEXT NOT NULL, "
        "name TEXT NOT NULL, "
        "type TEXT NOT NULL, "
        "vintage INTEGER NOT NULL, "
        "country TEXT NOT NULL, "
        "region TEXT NOT NULL, "
        "subregion TEXT, "
        "producer_name TEXT NOT NULL, "
        "grape_variety TEXT NOT NULL, "
        "price REAL NOT NULL, "
        "batch_code TEXT NOT NULL, "
        "description TEXT, "
        "image_url TEXT, "
        "bottle_size_ml INTEGER NOT NULL, "
        "alcohol_content_percentage REAL NOT NULL, "
        "fixed_acidity REAL, "
        "volatile_acidity REAL, "
        "citric_acid REAL, "
        "residual_sugar REAL, "
        "chlorides REAL, "
        "free_sulfur_dioxide REAL, "
        "total_sulfur_dioxide REAL, "
        "density REAL, "
        "pH REAL, "
        "sulphates REAL "
        ")"
    )
    db.execute(
        "CREATE TABLE IF NOT EXISTS wine_certifications ("
        "id TEXT PRIMARY KEY, "
        "wine_id INTEGER NOT NULL, "
        "type TEXT NOT NULL, "
        "certifying_body TEXT NOT NULL, "
        "certification_date DATE NOT NULL, "
        "FOREIGN KEY(wine_id) REFERENCES wines(id) ON DELETE CASCADE"
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
        if not username or not password:
            return {"message": "Username and password are required"}, HTTPStatus.BAD_REQUEST
        if len(password) < 8:
            return {"message": "Password must be at least 8 characters long"}, HTTPStatus.BAD_REQUEST
        if not password.isprintable():
            return {"message": "Password must contain only printable UTF-8 characters"}, HTTPStatus.BAD_REQUEST
        db = get_db()
        user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if user:
            return {"message": "User already exists"}, HTTPStatus.BAD_REQUEST
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

class Wine(Resource):

    def get(self, wine_id=None):
        db = get_db()

        if wine_id is None:
            wine_list = db.execute("SELECT * FROM wines").fetchall()
            wines = [dict(row) for row in wine_list]
            return wines, HTTPStatus.OK

        wine = db.execute("SELECT * FROM wines WHERE id = ?", (wine_id,)).fetchone()
        if wine:
            wine_certifications = db.execute(
                "SELECT * FROM wine_certifications WHERE wine_id = ?", (wine_id,)
            ).fetchall()
            wine = dict(wine)
            wine["certifications"] = [dict(cert) for cert in wine_certifications]
        if not wine:
            return {}, HTTPStatus.NOT_FOUND
        return wine, HTTPStatus.OK

    def post(self):
        data = request.get_json()
        wine_data = {
            "verifiable_credential_id": data.get("verifiable_credential_id"),
            "name": data.get("name"),
            "type": data.get("type"),
            "vintage": data.get("vintage"),
            "country": data.get("country"),
            "region": data.get("region"),
            "subregion": data.get("subregion"),
            "producer_name": data.get("producer_name"),
            "grape_variety": data.get("grape_variety"),
            "price": data.get("price"),
            "batch_code": data.get("batch_code"),
            "description": data.get("description"),
            "image_url": data.get("image_url"),
            "bottle_size_ml": data.get("bottle_size_ml"),
            "alcohol_content_percentage": data.get("alcohol_content_percentage"),
            "fixed_acidity": data.get("fixed_acidity"),
            "volatile_acidity": data.get("volatile_acidity"),
            "citric_acid": data.get("citric_acid"),
            "residual_sugar": data.get("residual_sugar"),
            "chlorides": data.get("chlorides"),
            "free_sulfur_dioxide": data.get("free_sulfur_dioxide"),
            "total_sulfur_dioxide": data.get("total_sulfur_dioxide"),
            "density": data.get("density"),
            "pH": data.get("pH"),
            "sulphates": data.get("sulphates"),
            "certifications": data.get("certifications", [])
        }
        db = get_db()
        cursor = db.execute(
            """INSERT INTO wines (verifiable_credential_id, name, description, type, vintage, country, region,
                                  subregion, producer_name, grape_variety, price, batch_code, image_url, bottle_size_ml,
                                  alcohol_content_percentage, fixed_acidity, volatile_acidity, citric_acid, residual_sugar,
                                  chlorides, free_sulfur_dioxide, total_sulfur_dioxide, density, pH, sulphates
                                  )
               VALUES (:verifiable_credential_id, :name, :description, :type, :vintage, :country, :region,
                       :subregion, :producer_name, :grape_variety, :price, :batch_code, :image_url, :bottle_size_ml,
                       :alcohol_content_percentage, :fixed_acidity, :volatile_acidity, :citric_acid, :residual_sugar,
                       :chlorides, :free_sulfur_dioxide, :total_sulfur_dioxide, :density, :pH, :sulphates
                       )""",
            wine_data
        )
        db.commit()
        wine_id = cursor.lastrowid
        for cert in wine_data["certifications"]:
            db.execute(
                """INSERT INTO wine_certifications (id, wine_id, type, certifying_body, certification_date)
                   VALUES (?, ?, ?, ?, ?)""",
                (cert["id"], wine_id, cert["type"], cert["certifying_body"], cert["certification_date"])
            )
        db.commit()
        return {"id": wine_id}, HTTPStatus.CREATED


api.add_resource(Register, "/register")
api.add_resource(Login, "/login")
api.add_resource(Refresh, "/refresh")
api.add_resource(Wine, "/wines", "/wines/<int:wine_id>")

if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(debug=True)