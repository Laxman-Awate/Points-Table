from flask import Flask, render_template, jsonify, request
import json, os

app = Flask(__name__)

# ----- Admin / Ambassador setup -----
ADMINS = {
    "1": {"name": "Arsh", "password": "Arsh123"},
    "2": {"name": "Rishab", "password": "Rishab123"},
    "3": {"name": "Sama", "password": "Sama123"},
    "4": {"name": "Firdaus", "password": "Firdaus123"},
    "5": {"name": "Rashmi", "password": "Rashmi123"},
    "6": {"name": "MuhammadMaaz", "password": "Maaz123"},
    "7": {"name": "Naveli", "password": "Naveli123"},
    "8": {"name": "Girish", "password": "Girish123"},
    "9": {"name": "Mahesh", "password": "Mahesh123"},
    "10": {"name": "Laxman", "password": "Laxman123"},
    "11": {"name": "Namrata", "password": "Namrata123"},
    "12": {"name": "Arshan", "password": "Arshan123"}
}

# ----- Temporary in-memory data -----
data = {"players": []}

# ---------------- Helper Functions ----------------
def get_player(username):
    for player in data["players"]:
        if player["username"] == username:
            return player
    return None

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

    player = get_player(username)
    if player:
        return jsonify({"ok": True, "existing": True})

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

@app.route("/api/players")
def api_players():
    return jsonify(data)

@app.route("/api/player/score", methods=["POST"])
def api_player_score():
    payload = request.get_json()
    username = payload.get("username")
    points = payload.get("points", 1)
    category = payload.get("category", "qr_points")

    if not username or not category:
        return jsonify({"error": "Missing fields"}), 400

    player = get_player(username)
    if not player:
        return jsonify({"error": "Player not found"}), 404

    if category in player:
        player[category] += points
    else:
        player[category] = points

    player["score"] = (
        player.get("qr_points", 0) +
        player.get("treasure_points", 0) +
        player.get("game1_points", 0) +
        player.get("game2_points", 0) +
        player.get("reel_points", 0)
    )

    return jsonify({"ok": True, "score": player["score"]})

@app.route("/api/player/scan", methods=["POST"])
def player_scan():
    payload = request.get_json()
    username = payload.get("username")

    if not username:
        return jsonify({"error": "Missing username"}), 400

    player = get_player(username)
    if not player:
        return jsonify({"error": "Player not found"}), 404

    points_to_add = 1
    player["qr_points"] += points_to_add

    player["score"] = (
        player.get("qr_points", 0) +
        player.get("treasure_points", 0) +
        player.get("game1_points", 0) +
        player.get("game2_points", 0) +
        player.get("reel_points", 0)
    )

    return jsonify({"ok": True, "reward": f"{points_to_add} QR point(s) added!", "score": player["score"]})

@app.route("/api/leaderboard")
def api_leaderboard():
    teams = {}
    for p in data["players"]:
        if p["team"] not in teams:
            teams[p["team"]] = {"players": [], "qr": 0, "treasure": 0, "game1": 0, "game2": 0, "reel": 0, "total": 0}
        teams[p["team"]]["players"].append(p)
        teams[p["team"]]["qr"] += p.get("qr_points", 0)
        teams[p["team"]]["treasure"] += p.get("treasure_points", 0)
        teams[p["team"]]["game1"] += p.get("game1_points", 0)
        teams[p["team"]]["game2"] += p.get("game2_points", 0)
        teams[p["team"]]["reel"] += p.get("reel_points", 0)
        teams[p["team"]]["total"] += p.get("score", 0)

    leaderboard = [{"team": k, **v} for k, v in teams.items()]
    return jsonify({"ok": True, "leaderboard": leaderboard})

@app.route("/api/reset", methods=["POST"])
def reset_all():
    for p in data["players"]:
        p["qr_points"] = 0
        p["treasure_points"] = 0
        p["game1_points"] = 0
        p["game2_points"] = 0
        p["reel_points"] = 0
        p["score"] = 0
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True)
