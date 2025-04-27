import csv
import html
import os
import random
from datetime import datetime

from flask import Flask, render_template
from flask_socketio import SocketIO

bg_thread=None

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
socketio = SocketIO(app, cors_allowed_origins=["http://127.0.0.1:5000", "http://localhost:5000","https://simulated-sentiment-tracker.onrender.com"])

@app.route("/")
def home():
    return render_template(
        "base.html",
        page="home",
        current_year=datetime.utcnow().year
    )
@app.route("/reflection")
def reflection():
    return render_template(
        "reflections.html",
        page="reflection",
        current_year=datetime.utcnow().year
    )

@app.route("/creative")
def creative():
    return render_template(
        "creative.html",
        page="creative",
        current_year=datetime.utcnow().year
    )

# Load synthetic tweets once
tweets = []
with open('static/data/synthetic_tweets.csv', newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        row['negative_reason'] = row.get('negative_reason') or 'Unknown'
        tweets.append(row)

def random_playback():
    while True:
        tweet = random.choice(tweets)
        payload = {
            'airline': html.escape(tweet['airline']),
            'sentiment': html.escape(tweet['airline_sentiment']),
            'reason': html.escape(tweet['negative_reason'])
        }
        socketio.emit('new_tweet', payload)
        socketio.sleep(1)

@socketio.on('connect')
def on_connect():
    global bg_thread
    if bg_thread is None:
        bg_thread = socketio.start_background_task(random_playback)

    try:
        bg_thread
    except NameError:
        # start random_playback in a SocketIO background task
           bg_thread = socketio.start_background_task(random_playback)

@app.route("/live")
def live():
    return render_template(
        "live.html",
        page="live",
        current_year=datetime.utcnow().year
    )

if __name__ == '__main__':
    socketio.run(app, debug=True)
