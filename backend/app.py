# setting up flask app and routes

from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO
import requests
from PIL import Image
import numpy as np
from flask_cors import CORS
from helpers import get_color, analyze_colors

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)


# Lobby page for player name input
@app.route('/', methods=['GET'])
def lobby():
    return render_template('lobby.html')

# Game page, expects player_name as GET param
@app.route('/game', methods=['GET'])
def game():
    player_name = request.args.get('player_name', '')
    if not player_name:
        return redirect(url_for('lobby'))
    return render_template('game.html', message='init', player_name=player_name)

@app.route('/capture')
def image_capture():
    print("getting results")

@app.route('/analyze-color/<user_color>', methods=['POST'])
def analyze_color(user_color):
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Empty file'}), 400
        
        image_data = file.read()
        
        colors = analyze_colors(image_data)
        print(colors)
        dominant_color = get_color(colors)
        print(dominant_color)
        
        print(f"User color: {user_color}, Dominant color: {dominant_color}")
        
        if dominant_color == user_color:
            print("Color match! Land added")
            return jsonify({
                'success': True, 
                'message': 'Color match found!',
                'dominant_color': dominant_color,
                'user_color': user_color
            })
        else:
            print("No color match, no land added")
            return jsonify({
                'success': False, 
                'message': 'No color match',
                'dominant_color': dominant_color,
                'user_color': user_color
            })
            
    except Exception as e:
        print(f"Error in analyze_color: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True, port=8080)