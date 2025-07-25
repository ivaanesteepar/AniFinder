import os
from flask import Flask, request, jsonify, send_from_directory
from db_config import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CORS(app)


@app.route("/")
def index():
    return send_from_directory(root_dir, "index.html")

@app.route("/pages/<path:filename>")
def serve_pages(filename):
    return send_from_directory(os.path.join(root_dir, "pages"), filename)

@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory(os.path.join(root_dir, "js"), filename)

@app.route("/css/<path:filename>")
def serve_css(filename):
    return send_from_directory(os.path.join(root_dir, "css"), filename)

@app.route("/img/<path:filename>")
def serve_img(filename):
    return send_from_directory(os.path.join(root_dir, "img"), filename)

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
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"success": False, "message": "Faltan campos obligatorios"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user["password"], password):
            return jsonify({
                "success": True,
                "message": "Login correcto",
                "username": user["username"],
                "birthday": user["birthday"]
            })
        else:
            return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401

    except Exception as e:
        app.logger.error(f"Error en /login: {e}")
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
