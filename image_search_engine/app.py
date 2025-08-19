from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Unsplash API configuration
UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')
UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET'])
def search_images():
    query = request.args.get('query', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    try:
        # Fetch images from Unsplash API
        params = {
            'query': query,
            'page': page,
            'per_page': per_page,
            'client_id': UNSPLASH_ACCESS_KEY
        }
        
        response = requests.get(UNSPLASH_API_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Format the results
        results = []
        for photo in data['results']:
            results.append({
                'id': photo['id'],
                'url': photo['urls']['regular'],
                'thumb': photo['urls']['thumb'],
                'alt': photo['alt_description'] if photo['alt_description'] else query,
                'photographer': photo['user']['name'],
                'profile_link': photo['user']['links']['html']
            })
        
        return jsonify({
            'total': data['total'],
            'total_pages': data['total_pages'],
            'results': results
        })
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)