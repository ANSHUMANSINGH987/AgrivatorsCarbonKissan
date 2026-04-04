# 🌱 Carbon-Kisan Credit — Climate-Tech Carbon Marketplace

> An AI-powered platform connecting farmers who generate carbon credits with businesses that purchase them — turning sustainable agriculture into verified, tradeable climate action.

Farmers log their practices; the platform's AI scores their carbon sequestration; those scores become credits listed on a live marketplace. Businesses browse, buy, and receive certified proof of offset.

### Core Goals
- Quantify and monetize CO₂ sequestration from sustainable farming across India
- Create a new income stream for smallholder farmers beyond crop yield
- Provide businesses with satellite-verified, auditable carbon offsets
- Use AI recommendations to continuously improve sustainable practice adoption

---

## Project Lifecycle Roadmap

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


### Frontend Layer
| Interface | Role | Key Modules |
|---|---|---|
| Farmer Dashboard | Farmer | Farm Management, Practices, Carbon Score |
| Business Dashboard | Business | Credits Portfolio, Impact Reports, Marketplace Access |
| Carbon Marketplace UI | Business | Browse, filter, and purchase listed credits |

### Backend Layer — Microservices

All traffic routes through a central **API Service Gateway** to six microservices:

- **Authentication Service** — Role-based access control and session management for Farmer/Business roles.
- **Farm Data Processing Service** — Ingests and normalizes satellite and farmer input data.
- **Carbon Credit Management Service** — Creates, verifies, and manages credit lifecycle from score to retirement.
- **Marketplace Service** — Handles listings, discovery, reservations, and purchase initiation.
- **Payment Processing Service** — Interfaces with the external gateway; triggers farmer payouts on settlement.
- **Document Generation Service** — Produces digital certificates (PDF) and impact report exports.

### AI / Analytics Layer
- **Carbon Scoring Engine** — Processes multi-source farm data (satellite + farmer inputs) to compute carbon sequestration scores.
- **Recommendation Engine** — Suggests higher-impact practices to farmers based on historical scoring outcomes.
- **Data Processing Pipeline** — ETL layer that standardizes all input streams before they reach the AI models.

### Data Layer
**Sources**: Farmer input data (practices, irrigation, fertilizers), Satellite/remote sensing data, Historical agricultural data.

**Databases**: User DB · Farm Data DB · Carbon Credit Records DB · Transaction DB

### External Services
- **Payment Gateway** (UPI / Stripe) — Domestic and international payment settlement and farmer disbursements.
- **Satellite Data APIs** — Objective geospatial feeds for farm verification and AI model input.
- **Notification Service** (SMS / Email) — Transactional alerts for both user types across SMS and email channels.

---

## The Carbon Credit Lifecycle

```
Farm Data → AI Scoring Engine → Credit Generation → Marketplace Listing
    → Business Purchase → Payment Gateway → Farmer Payout → Digital Certificate
```

1. **Data Collection** — Farmer logs practices; satellite feed captured for their land parcel.
2. **AI Scoring** — Carbon Scoring Engine processes combined data and assigns a verified score.
3. **Credit Listing** — Carbon Credit Management Service converts the score into credits; listed on marketplace.
4. **Purchase & Payment** — Business buys credits; Payment Gateway settles funds; farmer payout initiated.
5. **Certification** — Digital certificate issued to business; credit retired in DB to prevent double-counting.

---

## Getting Started

### Setup

```bash
git clone https://github.com/your-org/carbon-kisan-credit.git
cd carbon-kisan-credit
cp .env.example .env        # Add your API keys
docker-compose up --build
```

---

## Usage

**Farmers**: Register → Add farm parcels → Log sustainable practices → Monitor carbon score → Receive payouts.

**Businesses**: Register → Browse marketplace → Purchase credits → Download digital certificate → Access impact reports.

---


## License
[MIT License](LICENSE)

---
*Carbon-Kisan Credit — Turning sustainable farming into climate action.*
