
![da66cf8a-0851-4cbc-9239-23cac456faa4](https://github.com/user-attachments/assets/5ff02a4e-781a-44ff-b020-e77ae987381c)



# 🌱 Carbon-Kisan Credit — Climate-Tech Carbon Marketplace

> An AI-powered platform connecting farmers who generate carbon credits with businesses that purchase them — turning sustainable agriculture into verified, tradeable climate action.

Farmers log their practices; the platform's AI scores their carbon sequestration; those scores become credits listed on a live marketplace. Businesses browse, buy, and receive certified proof of offset.

### Core Goals
- Quantify and monetize CO₂ sequestration from sustainable farming across India
- Create a new income stream for smallholder farmers beyond crop yield
- Provide businesses with satellite-verified, auditable carbon offsets
- Use AI recommendations to continuously improve sustainable practice adoption

---

## Why This Project Matters

### For Farmers 🌾
India is home to over 100 million smallholder farmers who bear the greatest burden of climate change while contributing the least to it. These farmers already practice many forms of sustainable agriculture — cover cropping, no-till farming, agroforestry — but receive no financial recognition for the carbon these practices sequester.

Carbon-Kisan Credit changes that:
- **Creates a new income stream** entirely separate from crop yield, helping farmers survive bad harvest seasons.
- **Uses satellite verification** (not self-reporting) so farmers don't need to maintain complex documentation — the platform does the heavy lifting.
- **Provides AI-driven guidance** in local languages so farmers know exactly which practices will improve their score and earnings, removing guesswork.
- **Pays directly via UPI**, reaching farmers instantly without bank intermediaries or bureaucratic delays.

### For Businesses 🏢
Corporate sustainability commitments are under increasing regulatory and public scrutiny. Businesses need carbon offsets that are credible, auditable, and traceable — not certificates from opaque registries.

Carbon-Kisan Credit provides:
- **Satellite-verified offsets** backed by NDVI analysis of real farmland, not estimates or projections.
- **Full auditability** — every credit is linked to a specific farm parcel, GPS coordinates, and a time-stamped satellite scan.
- **Direct social impact** — purchases demonstrably improve farmer livelihoods, enabling companies to report both carbon and ESG impact from a single transaction.
- **Competitive pricing** by eliminating the layers of brokers and intermediaries typical in traditional carbon markets.

---

## The Math Behind the Magic 🔬

Real Soil Organic Carbon (SOC) verification requires deep physical soil sampling. However, biomass (how healthy and dense the plants are) directly correlates with the amount of carbon being sequestered into the soil via roots and decaying matter. We use **NDVI** as the measure of biomass.

In the `_extrapolate_carbon` function, we utilize a simplified linear regression formula often found in remote sensing preliminary studies:

$$SOC = \alpha \times NDVI_{mean} + \beta$$

Where:
- **SOC** is the Soil Organic Carbon in tonnes per hectare.
- **NDVI_mean** is the average vegetation index for the farm over a year.
- **α** and **β** are correlation constants (which you can adjust to calibrate your model if you introduce hardware sensor data later).

---

<img width="1408" height="768" alt="Carbon_Kishan Workflow" src="https://github.com/user-attachments/assets/7b48a8fc-f2b5-4187-a75f-93d66f2d927e" />

### Phase 1 — Discovery & Design
Analysis of the dual problem (CO₂ emissions + farmer poverty), definition of Farmer and Business user profiles, and creation of a unified Design System.

### Phase 2 — Infrastructure & Core Build
API Gateway and Authentication Service established. All four databases provisioned (User, Farm Data, Carbon Credit Records, Transaction). Satellite and farmer input data pipelines integrated.

### Phase 3 — Frontend & Role-Based Onboarding
Farmer Dashboard, Business Dashboard, and Carbon Marketplace UI launched. Pilot onboarding of initial users from both roles for early feedback.

### Phase 4 — Credit Generation & Scoring AI
Farm data collected from satellite feeds and farmer inputs. AI Scoring Engine trained and deployed to calculate carbon scores, producing the first batch of tradeable credits.

### Phase 5 — Marketplace Launch & Discovery
Carbon credits listed on the live marketplace. Business users browse and purchase. Marketplace transaction logic — listing, reservation, and purchase initiation — goes live.

### Phase 6 — Financial Fulfillment & Payout
Payments processed via UPI/Stripe gateway. Transaction DB updated in real time. Farmer payouts automatically calculated and disbursed.

### Phase 7 — Post-Trade Fulfillment & Certification
Digital certificates (PDF) generated for each completed trade. Recommendation Engine refined with post-trade data. Continuous feedback loop and impact tracking activated.

---

## System Architecture

<img width="1408" height="768" alt="system_archiecture_carbon_kishan" src="https://github.com/user-attachments/assets/b9621527-e595-47f5-98e3-f2fed12ffb3c" />


### Backend Layer — FastAPI Micro-APIs

All traffic routes through a central **FastAPI application** which exposes modular endpoints:

- **Land Mapping (`/land`)**: Handles automatic farm boundary detection from a single pin-drop (`/auto-boundary`) and manual GPS walks (`/walk-boundary`) using Google Earth Engine's segmentation algorithms.
- **Digital MRV (`/mrv`)**: The core Measurement, Reporting, and Verification engine. It takes a farm's GeoJSON polygon, analyzes 12 months of Sentinel-2 satellite data to calculate NDVI, and extrapolates it to estimate carbon sequestration in tonnes and its equivalent INR value.
- **AI & Voice (`/ai`)**: Interfaces with the Google Gemini model. Provides daily, region-specific insights (`/daily-insights`) and powers a conversational chatbot (`/chat`) that can answer farmer queries with context about their specific farm data.
- **Document Generation (`/docs`)**: Generates HTML-based certificates of carbon credit purchase (`/certificate/{cert_id}`), which can be converted to PDFs.

### AI / Analytics Layer
- **Carbon Scoring (`gee_engine.py`)**: Processes Sentinel-2 satellite data to compute the Normalized Difference Vegetation Index (NDVI) as a proxy for biomass and soil organic carbon.
- **Farm Auto-Mapping (`auto_mapper.py`)**: Uses Google Earth Engine's SNIC algorithm to automatically segment and vectorize a farm plot from a single coordinate.
- **Agronomist AI (`ai_service.py`)**: Leverages Google Gemini to provide actionable insights on weather, market rates, and government schemes, plus a conversational chat interface for farmers.

### Data Layer
- **Sources**: User-provided GPS coordinates (pin-drop or walk), external satellite imagery (Copernicus/S2_SR_HARMONIZED).
- **Database**: Firestore (via `firebase-admin`) for storing user data, farm polygons, and generated carbon credit records.

### External Services
- **Google Earth Engine**: Provides the core satellite imagery and processing power for NDVI analysis and farm boundary detection.
- **Google Gemini**: Powers all generative AI features, including regional insights and the farmer chatbot.
- **Firebase**: Acts as the primary backend database for the application.

---

## The Carbon Credit Lifecycle

```
Farm Boundary → MRV Analysis → Credit Generation → Marketplace Listing
    → Business Purchase → Payment → Farmer Payout → Digital Certificate
```

1.  **Data Collection**: A farmer defines their land boundary using either a single pin-drop (auto-detection) or a GPS walk via the `/api/land` endpoints.
2.  **AI Scoring**: The farm's GeoJSON polygon is sent to `/api/mrv/analyze`. The `DigitalMRVEngine` uses Google Earth Engine to calculate the mean NDVI, farm area, and estimate carbon tonnes sequestered.
3.  **Credit Listing**: The calculated carbon tonnage is converted into tradeable credits and listed on the marketplace (handled by the frontend and Firestore).
4.  **Purchase & Payment**: A business purchases the credits through the platform.
5.  **Certification**: Upon successful transaction, a unique certificate is generated via `/api/docs/certificate/{cert_id}` for the business, serving as proof of their carbon offset. The credit is retired in the database.

---

## Getting Started

### Prerequisites
- Python 3.8+
- A Google Cloud Platform project with Earth Engine API enabled.
- A Firebase project with a credentials file (`.json`).
- A Google Gemini API Key.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anshumansingh987/agrivatorscarbonkissan.git
    cd agrivatorscarbonkissan
    ```

2.  **Create and configure your environment file.**
    Copy the example file and fill in your credentials:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and populate the following variables:
    ```
    GEMINI_API_KEY="your_gemini_api_key"
    GEE_PROJECT_ID="your-gcp-project-id"
    FIREBASE_CREDENTIALS_PATH="/path/to/your/firebase-credentials.json"
    ```
    - `GEMINI_API_KEY` — obtain from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - `GEE_PROJECT_ID` — your Google Cloud project ID with Earth Engine API enabled.
    - `FIREBASE_CREDENTIALS_PATH` — absolute path to the `.json` service account key downloaded from your Firebase project settings under **Project Settings → Service Accounts → Generate new private key**.

3.  **Create and activate a virtual environment (recommended):**
    ```bash
    python -m venv venv
    # On Linux/macOS:
    source venv/bin/activate
    # On Windows:
    venv\Scripts\activate
    ```

4.  **Install dependencies:**
    ```bash
    pip install -r app/requirements.txt
    ```
    This installs FastAPI, Uvicorn, the Google Earth Engine Python client, Firebase Admin SDK, Google Generative AI SDK, and all other required packages.

5.  **Authenticate with Google Earth Engine:**
    ```bash
    earthengine authenticate
    ```
    This opens a browser window for OAuth. After authentication, your credentials are cached locally. You only need to run this once per machine. Ensure the GCP project linked to your `GEE_PROJECT_ID` has the **Earth Engine API** enabled in the [Google Cloud Console](https://console.cloud.google.com/apis/library/earthengine.googleapis.com).

6.  **Initialize Firebase:**
    Ensure your Firebase project has **Firestore** enabled (in Native mode). The credentials file specified in `FIREBASE_CREDENTIALS_PATH` must belong to a service account with **Firebase Admin** or **Cloud Datastore User** roles.

7.  **Run the FastAPI server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`. You can explore all endpoints interactively via the auto-generated Swagger docs at `http://127.0.0.1:8000/docs`.

> **Note:** On first run, Google Earth Engine may take a few extra seconds to initialize as it authenticates with the GCP project. This is normal behaviour.

---

## Usage

**Farmers**: Register → Add farm parcels → Log sustainable practices → Monitor carbon score → Receive payouts.

**Businesses**: Register → Browse marketplace → Purchase credits → Download digital certificate → Access impact reports.

---


## Team

| Name | Role |
|------|------|
| **Anshuman Singh** | Backend Lead |
| **Rishi Raj** | UI/UX Lead |
| **Harshil Srivastava** | Frontend Lead |
| **Akshat Kumar Singh** | Research & Deployment Lead |

---
*Carbon-Kisan Credit — Turning sustainable farming into climate action.*
