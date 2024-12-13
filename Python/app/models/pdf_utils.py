import os
import fitz
from models.ocr_utils import perform_ocr_on_image

# Utility: Check if a PDF is scanned or text-based
def is_pdf_scanned(pdf_path, min_words_per_page=20, min_text_pages_ratio=0.1, min_image_pages_ratio=0.7):
    try:
        pdf_document = fitz.open(pdf_path)
        total_pages = pdf_document.page_count

        significant_text_pages = 0
        image_pages = 0

        for page_number in range(total_pages):
            page = pdf_document.load_page(page_number)
            text = page.get_text("text")
            word_count = len(text.split())

            if word_count >= min_words_per_page:
                significant_text_pages += 1

            # Check if the page contains image objects
            image_list = page.get_images(full=True)
            if image_list:
                image_pages += 1

        text_pages_ratio = significant_text_pages / total_pages
        image_pages_ratio = image_pages / total_pages
        pdf_document.close()

        return text_pages_ratio < min_text_pages_ratio and image_pages_ratio > min_image_pages_ratio
    except Exception as e:
        print(f"Error analyzing PDF: {e}")
        return True  # Default to scanned if analysis fails

# Utility: Extract images from a PDF
def extract_images_from_pdf(pdf_path, output_folder):
    pdf_document = fitz.open(pdf_path)
    for page_number in range(len(pdf_document)):
        page = pdf_document.load_page(page_number)
        image_list = page.get_images(full=True)

        for image_index, image in enumerate(image_list, start=1):
            xref = image[0]
            base_image = pdf_document.extract_image(xref)
            image_data = base_image["image"]
            image_ext = base_image["ext"]

            image_filename = os.path.join(output_folder, f"page_{page_number+1}_image{image_index}.{image_ext}")
            with open(image_filename, "wb") as image_file:
                image_file.write(image_data)
            print(f"Saved image: {image_filename}")

    pdf_document.close()

# Process scanned PDF
def process_scanned_pdf(pdf_path):
    output_folder = '../app/uploads'
    os.makedirs(output_folder, exist_ok=True)

    # Extract images from PDF
    extract_images_from_pdf(pdf_path, output_folder)

    extracted_text = ""
    image_files = sorted(os.listdir(output_folder))
    
    for image_filename in image_files:
        image_path = os.path.join(output_folder, image_filename)
        print(f'Processing image: {image_filename}')  # Debugging line
        page_text = perform_ocr_on_image(image_path)
        
        if page_text:
            extracted_text += page_text + "\n"
        else:
            print(f'No text found in image: {image_filename}')  # Debugging line
    
    return extracted_text.strip()
