from flask import Flask, render_template, jsonify, request
import json, os

app = Flask(__name__)

DATA_FILE = "data.json"

# Admin / Ambassador setup
ADMINS = {
    "A": {"name": "Alice", "password": "1234"},
    "B": {"name": "Bob", "password": "1234"},
    "C": {"name": "Charlie", "password": "1234"},
    "D": {"name": "Laxman", "password": "Laxman@123"}
}

# ---------------- Helper Functions ----------------
def load_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({"players": []}, f)
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_player(data, username):
    for player in data["players"]:
        if player["username"] == username:
            return player
    return None

def get_team(data, team_name):
    return [p for p in data["players"] if p["team"] == team_name]

# ---------------- Routes ----------------
@app.route("/")
def home():
    return render_template("index.html", ADMINS=ADMINS)

@app.route("/player")
def player_page():
    return render_template("player_dashboard.html")

@app.route("/admin")
def admin_page():
    return render_template("admin_dashboard.html")

# ---------------- API Routes ----------------
@app.route("/api/register", methods=["POST"])
def register_player():
    payload = request.get_json()
    username = payload.get("username")
    team = payload.get("team")

    if not username or not team:
        return jsonify({"error": "Missing fields"}), 400

    data = load_data()
    player = get_player(data, username)

    if player:
        # Player exists, allow login
        return jsonify({"ok": True, "existing": True})

    # New player
    new_player = {
        "username": username,
        "team": team,
        "qr_points": 0,
        "treasure_points": 0,
        "game1_points": 0,
        "game2_points": 0,
        "reel_points": 0,
        "score": 0
    }
    data["players"].append(new_player)
    save_data(data)
    return jsonify({"ok": True, "existing": False})

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    payload = request.get_json()
    name = payload.get("name")
    team = payload.get("team")
    password = payload.get("password")

    admin = ADMINS.get(team)
    if admin and admin["name"] == name and admin["password"] == password:
        return jsonify({"ok": True})
    else:
        return jsonify({"error": "Invalid admin credentials"}), 401

# ---------------- Run App ----------------
if __name__ == "__main__":
    app.run(debug=True)
