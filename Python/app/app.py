from flask import Flask
from flask_cors import CORS
from controllers.ocr_controller import extract_text
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}})

# Register the route
app.add_url_rule('/extract-text', 'extract_text', extract_text, methods=['POST'])

if __name__ == '__main__':
    os.makedirs('/uploads', exist_ok=True)
    app.run(host='0.0.0.0', port=5001, debug=True)
