import easyocr
import cv2
import matplotlib.pyplot as plt

def detect_text(image_path, languages=['en']):
    # Create reader object
    reader = easyocr.Reader(languages)
    
    # Read image
    image = cv2.imread(image_path)
    
    # Detect text
    result = reader.readtext(image)
    
    # Draw bounding boxes and text
    for detection in result:
        top_left = tuple([int(val) for val in detection[0][0]])
        bottom_right = tuple([int(val) for val in detection[0][2]])
        text = detection[1]
        
        image = cv2.rectangle(image, top_left, bottom_right, (0, 255, 0), 3)
        image = cv2.putText(image, text, top_left, cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
    
    # Display image with detections
    plt.figure(figsize=(10, 10))
    plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.show()
    
    # Print detected text
    print("\nDetected Text:")
    for detection in result:
        print(detection[1])

# Example usage
image_path = 'screenshot.png'
detect_text(image_path, languages=['en'])  # You can add more language codes as needed