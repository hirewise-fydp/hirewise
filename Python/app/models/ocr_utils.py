import os
from google_drive_ocr import GoogleOCRApplication

def perform_ocr_on_image(image_path):
    print('Performing OCR on:', image_path)
    try:
        client_secret_path = 'Python\secret.json'
        ocr = GoogleOCRApplication(client_secret=client_secret_path)

        output_path = ocr.get_output_path(image_path)
        status = ocr.perform_ocr(image_path, output_path)
        print(f"OCR status for {image_path}: {status}")

        if status.value in ['Done!', 'Already done!']:
            with open(output_path, 'r', encoding='utf-8', errors='ignore') as file:
                extracted_text = file.read()

            os.remove(image_path)
            os.remove(output_path)
            return extracted_text
        else:
            return ""
        
    except Exception as e:
        print(f"Error during OCR: {e}")
        return ""
