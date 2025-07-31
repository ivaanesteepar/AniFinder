import os
from urllib import response
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from supabase import create_client

app = Flask(__name__)
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CORS(app)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

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
        return jsonify({"success": False, "message": "Todos los campos son obligatorios"}), 400

    existing = supabase.table("usuarios").select("*").eq("email", email).execute()

    if existing.data and len(existing.data) > 0:
        return jsonify({"success": False, "message": "Usuario ya registrado"}), 409

    hashed_password = generate_password_hash(password)

    response = supabase.table("usuarios").insert({
        "username": username,
        "email": email,
        "password": hashed_password,
        "birthday": birthday
    }).execute()

    if response.data and len(response.data) > 0:
        return jsonify({"success": True, "message": "Usuario registrado correctamente"})
    else:
        return jsonify({"success": False, "message": "Error al registrar usuario"}), 500




@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Faltan campos obligatorios"}), 400

    response = supabase.table("usuarios").select("*").eq("email", email).execute()
    users = response.data

    if not users or len(users) == 0:
        return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

    user = users[0]

    if check_password_hash(user["password"], password):
        return jsonify({
            "success": True,
            "message": "Login correcto",
            "username": user["username"],
            "email": user["email"],
            "birthday": user["birthday"],
            "profilepic": user.get("profilepic", "")
        })
    else:
        return jsonify({"success": False, "message": "Credenciales incorrectas"}), 401



@app.route("/update-profile", methods=["PUT"])
def update_profile():
    data = request.json
    email = data.get("email")
    new_username = data.get("username")
    new_birthday = data.get("birthday")
    new_profilepic = data.get("profilepic") 

    if not email:
        return jsonify({"success": False, "message": "Email es obligatorio para identificar usuario"}), 400

    update_data = {}
    if new_username:
        update_data["username"] = new_username
    if new_birthday:
        update_data["birthday"] = new_birthday
    if new_profilepic is not None:
        update_data["profilepic"] = new_profilepic

    if not update_data:
        return jsonify({"success": False, "message": "No hay datos para actualizar"}), 400

    response = supabase.table("usuarios").update(update_data).eq("email", email).execute()

    if response.data and len(response.data) > 0:
        return jsonify({"success": True, "message": "Perfil actualizado correctamente"})
        
    return jsonify({"success": False, "message": "Error actualizando perfil: " + response.error.message}), 500
    



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
