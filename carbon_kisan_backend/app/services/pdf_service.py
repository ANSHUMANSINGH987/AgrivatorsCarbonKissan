from jinja2 import Environment, FileSystemLoader
import os
import pdfkit
import base64
from datetime import datetime

class DocumentService:
    def __init__(self):
        # Point Jinja to your templates folder
        template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
        self.env = Environment(loader=FileSystemLoader(template_dir))
        self.output_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'certificates')
        # Create certificates directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_farmer_certificate_html(self, data: dict) -> str:
        """Injects Firebase data into the Farmer Certificate HTML."""
        try:
            template = self.env.get_template('farmer_cert.html')
            # Pass the data dict into the HTML file
            html_content = template.render(
                cert_id=data.get("certificate_id", "CERT-XXXX"),
                name=data.get("farmer_name", "Kisan"),
                area=data.get("metrics", {}).get("farm_area_hectares", 0),
                tonnes=data.get("metrics", {}).get("estimated_carbon_tonnes", 0),
                value=data.get("metrics", {}).get("estimated_value_inr", 0),
                issued_date=datetime.now().strftime("%d %B %Y")
            )
            return html_content
        except Exception as e:
            raise Exception(f"Template rendering failed: {e}")

    def generate_certificate_pdf(self, data: dict) -> str:
        """Generates a PDF certificate and saves it, returns the file path."""
        try:
            cert_id = data.get("certificate_id", "CERT-DEFAULT")
            
            # Generate HTML content
            html_content = self.generate_farmer_certificate_html(data)
            
            # Create output file path
            pdf_filename = f"{cert_id}.pdf"
            pdf_path = os.path.join(self.output_dir, pdf_filename)
            html_filename = f"{cert_id}.html"
            html_path = os.path.join(self.output_dir, html_filename)
            
            # Remove old files if they exist
            for old_file in [pdf_path, html_path]:
                try:
                    if os.path.exists(old_file):
                        os.remove(old_file)
                        print(f"[INFO] Removed old file: {old_file}")
                except Exception as e:
                    print(f"[WARNING] Could not remove old file {old_file}: {e}")
            
            # PDF generation options
            options = {
                'page-size': 'A4',
                'margin-top': '0.75in',
                'margin-right': '0.75in',
                'margin-bottom': '0.75in',
                'margin-left': '0.75in',
                'encoding': "UTF-8",
                'no-outline': None,
                'enable-local-file-access': None,
            }
            
            try:
                # Try to generate PDF using pdfkit/wkhtmltopdf
                pdfkit.from_string(html_content, pdf_path, options=options)
                print(f"[OK] PDF Certificate generated: {pdf_path}")
                return pdf_path
            except Exception as pdf_error:
                print(f"[WARNING] PDF generation failed: {pdf_error}")
                print(f"[INFO] Falling back to HTML certificate")
                # Fallback: save as HTML only
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                print(f"[OK] HTML Certificate saved: {html_path}")
                return html_path
        
        except Exception as e:
            raise Exception(f"Certificate generation failed: {str(e)}")

    def get_certificate_path(self, cert_id: str) -> str:
        """Returns the file path for certificate PDF or HTML."""
        try:
            pdf_path = os.path.join(self.output_dir, f"{cert_id}.pdf")
            html_path = os.path.join(self.output_dir, f"{cert_id}.html")
            
            if os.path.exists(pdf_path):
                return pdf_path
            elif os.path.exists(html_path):
                return html_path
            else:
                raise Exception(f"Certificate file not found: {cert_id}")
        except Exception as e:
            raise Exception(f"Failed to retrieve certificate path: {str(e)}")
    
    def get_certificate_content(self, cert_id: str) -> bytes:
        """Retrieves certificate PDF/HTML content as bytes."""
        try:
            pdf_path = os.path.join(self.output_dir, f"{cert_id}.pdf")
            html_path = os.path.join(self.output_dir, f"{cert_id}.html")
            
            if os.path.exists(pdf_path):
                with open(pdf_path, 'rb') as f:
                    return f.read()
            elif os.path.exists(html_path):
                with open(html_path, 'r', encoding='utf-8') as f:
                    return f.read().encode('utf-8')
            else:
                raise Exception(f"Certificate file not found: {cert_id}")
        except Exception as e:
            raise Exception(f"Failed to retrieve certificate: {str(e)}")