from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Resume Analysis for Software Project Manager Role', align='C', ln=True)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, title, ln=True)
        self.ln(5)

    def chapter_body(self, body):
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 10, body)
        self.ln()

def create_pdf():
    pdf = PDF()
    pdf.add_page()

    # Title
    pdf.chapter_title("Analysis")

    # Body content
    content = {
        "Skills": "The candidate predominantly has technical skills, including React.js, Python, JavaScript, and Node.js, which are irrelevant for a Project Manager role emphasizing management and negotiation capabilities, proficiency in MS Excel, Word, PowerPoint, email drafting, and fluency in Urdu, Punjabi, and English. There is a slight overlap in the generic skill of 'Multi-tasking'.",

        "Experience": "The candidate falls short of the required 3-4 years of experience in an RSM position or equivalent. Their experiences are largely based within software development and lack the managerial expertise sought for this position.",

        "Education": "The candidate meets the minimum criteria of holding a Bachelor's degree, but the preferred Master's degree isn't held. The certifications received focus on back-end Node.JS development and front-end job simulation, which aren't directly relevant for the job in question.",

        "Strengths": "The candidate appears to be strong in software development with a particular focus on Node.js, React.js, along with database management. This is evident through their workplace experiences and academic projects.",

        "Weaknesses": "The role requires language fluency, multitasking, team building, and negotiation skills, among other strictly managerial competencies. These aren't reflected in the candidate's resume.",

        "Recommendations for Improvement": "They would need to gain experience in managerial roles, and further develop their skills in areas such as negotiation, team building, and MS Office proficiency. Additionally, showcasing more diverse language skills could be beneficial."
    }

    for section, text in content.items():
        pdf.chapter_title(section)
        pdf.chapter_body(text)

    # Save PDF to the current directory
    pdf_file_path = "Resume_Analysis.pdf"
    pdf.output(pdf_file_path)

    # Save the script to the current directory
    script_file_path = "generate_pdf.py"
    with open(script_file_path, "w") as script_file:
        script_file.write(open(__file__).read())

# Generate the PDF
create_pdf()
