from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import io

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    image = Image.open(image_file)

    # Perform OCR using pytesseract
    text = pytesseract.image_to_string(image)
    print(text)
    return jsonify({'text': text})

if __name__ == '__main__':
    app.run(debug=True)
