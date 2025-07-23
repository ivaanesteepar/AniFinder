from flask import Flask, request, jsonify
from db_config import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Email y contraseña obligatorios"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"success": False, "message": "Usuario ya registrado"}), 409

    hashed_password = generate_password_hash(password)
    cursor.execute("INSERT INTO usuarios (email, password) VALUES (%s, %s)", (email, hashed_password))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True, "message": "Usuario registrado correctamente"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and check_password_hash(user["password"], password):
        return jsonify({"success": True, "message": "Login correcto"})
    else:
        return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401

if __name__ == "__main__":
    app.run(debug=True)
