from flask import Flask, request, jsonify
from db_config import get_db_connection

app = Flask(__name__)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s AND password = %s", (email, password))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        return jsonify({"success": True, "message": "Login correcto"})
    else:
        return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401

if __name__ == "__main__":
    app.run(debug=True)
