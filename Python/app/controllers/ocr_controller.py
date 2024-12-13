from flask import request, jsonify
from models.pdf_utils import is_pdf_scanned, process_scanned_pdf  # Import the function here
from models.ocr_utils import perform_ocr_on_image
import os
import fitz

def extract_text():
    try:
        print('Request files:', request.files)

        if 'image' not in request.files or not request.files['image']:
            return jsonify({'error': 'No file provided or file key missing'}), 400

        input_file = request.files['image']
        input_path = os.path.join('../app/uploads', input_file.filename)
        input_file.save(input_path)

        extracted_text = ""

        if input_file.filename.lower().endswith('.pdf'):
            if is_pdf_scanned(input_path):
                # Process scanned PDF
                extracted_text = process_scanned_pdf(input_path)
            else:
                # Extract text from text-based PDF
                pdf_document = fitz.open(input_path)
                for page_num in range(pdf_document.page_count):
                    page = pdf_document.load_page(page_num)
                    extracted_text += page.get_text("text") + "\n"
                pdf_document.close()
        elif input_file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            # Perform OCR on image
            extracted_text = perform_ocr_on_image(input_path)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400

        # Cleanup uploaded file
        # os.remove(input_path)

        return jsonify({'text': extracted_text.strip()})

    except Exception as e:
        print(f"Error in extract_text: {e}")
        return jsonify({'error': str(e)}), 500
