from flask import Flask, request, jsonify
from db_config import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    birthday = data.get("birthday")

    if not username or not email or not password or not birthday:
        app.logger.warning("Faltan campos obligatorios")
        return jsonify({"success": False, "message": "Todos los campos son obligatorios"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))

    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"success": False, "message": "Usuario ya registrado"}), 409

    hashed_password = generate_password_hash(password)

    try:
        cursor.execute(
            "INSERT INTO usuarios (username, email, password, birthday) VALUES (%s, %s, %s, %s)",
            (username, email, hashed_password, birthday)
        )
        conn.commit()
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({"success": False, "message": f"Error al registrar usuario: {e}"}), 500

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
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
