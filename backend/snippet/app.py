from flask import Flask, request, jsonify
import easyocr
import cv2
import numpy as np

app = Flask(__name__)

# Initialize EasyOCR reader
reader = easyocr.Reader(['en'])  # Initialize for English

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    
    # Read image file
    nparr = np.frombuffer(image_file.read(), np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Perform OCR
    result = reader.readtext(image)
    
    # Extract text from results
    full_text = []
    for detection in result:
        full_text.append(detection[1])  # Append recognized text
    
    full_text = ' '.join(full_text)
    
    print(full_text)
    return jsonify({'text': full_text})

if __name__ == '__main__':
    app.run(debug=True)