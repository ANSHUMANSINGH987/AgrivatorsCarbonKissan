from jinja2 import Environment, FileSystemLoader
import os

class DocumentService:
    def __init__(self):
        # Point Jinja to your templates folder
        template_dir = os.path.join(os.path.dirname(__file__), '..', 'templates')
        self.env = Environment(loader=FileSystemLoader(template_dir))

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
                value=data.get("metrics", {}).get("estimated_value_inr", 0)
            )
            return html_content
        except Exception as e:
            raise Exception(f"Template rendering failed: {e}")