# SafeSight AI
**Calibrated, Explainable, Human-Verified Near-Miss Intelligence**  
*Round 3 Prototype for PRASUNEX INNOVATHON 2026*

---

> [!IMPORTANT]
> **CORE ENGINEERING CONSTRAINT & COMMITMENT**  
> **SafeSight AI is NOT a crash-prediction system.** It must not claim to predict accidents. A detected conflict is an explainable surrogate screening signal for human review, not proof that a crash would occur.

---

## Overview
SafeSight AI converts authorized traffic video surveillance footage into reviewed, calibrated near-miss conflict intelligence and an exposure-normalized hotspot report. It provides transportation engineers and municipal planners with auditable diagnostic intelligence to fix dangerous intersections before fatal collisions occur.

### Key Architectural Commitments
- **Perception**: Ultralytics YOLOv8 (640px) + ByteTrack multi-object tracking.
- **Sensor Assurance**: Video Quality Gate evaluating blur ($\sigma^2_{Laplacian}$), illumination, resolution, frame rate, and camera shake.
- **Spatial Calibration**: Planar ground homography mapping pixels to meters with leave-one-out cross-validation error ($\le 0.50$m target; **0.061m achieved**).
- **Trajectory Analysis**: Calibrated trajectory conversion, 3-frame moving average smoothing, forward-difference velocity estimation, and Parquet storage.
- **Physics-Based Conflict Diagnostics**:
  - **TTC**: Constant-velocity footprint forward simulation at 0.1s steps up to 5.0s with approach condition, 3-frame persistence, and hysteresis.
  - **PET**: Conflict-zone entry/exit delta for shared intersection and crosswalk polygons.
- **Class-Specific Rules**: Pedestrian-vehicle, two-wheeler-vehicle, unsafe turn, and distinct following behavior.
- **Explainability**: Strict separation between **Physical Hazard Severity** and **Perceptual Confidence**.
- **Human Verification**: Mandatory reviewer justification reasons with immutable audit trail logging.
- **Hotspot Intelligence**: Exposure-normalized scoring formula with dynamic pending weight adaptation.
- **Privacy by Design**: Automated Gaussian face and license plate anonymization on 5s evidence clips; signed time-limited tokens; zero facial recognition.

---

## System Architecture

```
SafeSight AI Architecture
├── Video Quality Gate (Laplacian blur, brightness, FPS, stability)
├── Two-Pass Processing Engine (~5 FPS Pass 1 screening; native 30 FPS Pass 2 deep tracking)
├── Perceptual Tracking (YOLOv8 + ByteTrack + Parquet storage)
├── Spatial Homography Calibration (Image Pixels -> Ground Meters, Held-out error < 0.5m)
├── Surrogate Conflict Engine (Constant-velocity footprint TTC + Conflict-zone PET)
├── Severity & Confidence Separation Engine
├── Privacy Preservation Engine (Gaussian face & plate blurring + HMAC signed tokens)
├── Human Verification Engine (Mandatory audit reasons + immutable logs)
└── Exposure-Normalized Hotspot Scorer & Downloadable Audit Reports
```

---

## Technology Stack

### Backend
- **Python 3.11+ / 3.13**
- **FastAPI**: REST API framework
- **SQLAlchemy 2.0**: Relational ORM (PostgreSQL/PostGIS + transparent SQLite fallback)
- **Ultralytics YOLOv8**: Object detection
- **ByteTrack**: Multi-object tracking
- **OpenCV & NumPy**: Computer vision & matrix geometry
- **Shapely**: 2D polygon footprint intersection and zone containment
- **PyArrow & Pandas**: Parquet trajectory storage
- **Celery & Redis**: Asynchronous queue processing (with in-process ThreadPool fallback)

### Frontend
- **React 18 & Vite**
- **Tailwind CSS**: Modern high-density dark UI
- **React Router v6**: Single-page navigation
- **Leaflet & React-Leaflet**: Spatial map visualization
- **Recharts**: Telemetry plots and distribution charts
- **Lucide React**: Clean iconography

---

## Repository Structure

```
safesight-ai/
  backend/
    app/
      main.py                  # FastAPI application entry point
      api/                     # REST API routers (videos, jobs, events, hotspots, reports, calibrations)
      models/                  # SQLAlchemy models
      schemas/                 # Pydantic validation schemas
      services/                # Pipeline, privacy, hotspot, and report services
      workers/                 # Asynchronous background job queue
      ai/                      # Quality gate and YOLOv8 + ByteTrack tracker
      calibration/             # Homography calibrator & leave-one-out validator
      conflict/                # Constant-velocity TTC, PET, conflict rules, severity/confidence
      db/                      # Database engine & session management
      tests/                   # Pytest test suite (unit, integration, e2e)
    requirements.txt           # Python backend dependencies
    .env.example               # Environment variable template
    alembic.ini                # Database migration configuration
    Dockerfile                 # Container specification
  frontend/
    src/
      pages/                   # Upload, Processing, Event Review, Hotspots, Reports
      components/              # Navbar, Disclaimer banner
      services/                # Axios API services
    package.json               # Frontend dependencies
    vite.config.js             # Vite development & build config
    tailwind.config.js         # Tailwind styling config
    Dockerfile                 # Container specification
  sample_data/
    videos/                    # Authorized traffic sample videos
    calibrations/              # Preconfigured surveyed calibrations for CAM_01 & CAM_02
    expected_outputs/          # Documented expected events and report outputs
  docs/
    TECHNICAL_DOCUMENTATION.md # In-depth technical architecture and formulas
    IMPLEMENTATION_STATUS.md   # Feature implementation matrix and test report
    DEMO_SCRIPT.md             # Step-by-step presentation script & jury Q&A
  docker-compose.yml           # Production multi-container orchestration
  README.md                    # Project documentation
```

---

## Quick Start Instructions

### Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ and `npm`
- Git

### 1. Clone & Set Up Backend
```bash
cd safesight-ai/backend

# Create and activate virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be available at: `http://localhost:8000` (Swagger docs at `/docs`).

### 2. Set Up Frontend
In a new terminal window:
```bash
cd safesight-ai/frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Tests
```bash
cd safesight-ai/backend
python -m pytest app/tests/ -v
```
All 15 unit and integration tests run and verify calibration error, constant-velocity TTC, conflict-zone PET, severity/confidence separation, review reasons, and real-video processing.

---

## Live Demo Workflow
Follow the step-by-step presentation guide in [DEMO_SCRIPT.md](file:///c:/Users/avani/project/safesight-ai/docs/DEMO_SCRIPT.md):
1. **Upload Video**: Upload `sample_data/videos/intersection_authorized.mp4` under `CAM_01`.
2. **Review Quality Gate**: Inspect the composite quality score (1.0 Accepted) and blur/illumination gauges.
3. **Run Pipeline**: Track real-time progress across all 6 processing stages.
4. **Inspect Conflict Events**: Examine detected near misses, play the privacy-blurred evidence clip, inspect TTC forward projections, and separate severity vs confidence cards.
5. **Verify Decision**: Commit a `Confirm Conflict` action with a mandatory engineering justification reason and observe the immutable audit trail log.
6. **Analyze Hotspots**: Review the exposure-normalized ranking and Leaflet map pins.
7. **Download Safety Report**: Download the comprehensive Markdown audit report.

---

## Docker Deployment (Production Stack)
To run the full stack with PostgreSQL 16 + PostGIS and Redis via Docker Compose:
```bash
docker-compose up --build
```

---

## Verification & Target Disclosure
All reported metrics represent prototype pilot results on real authorized surveillance data:
- **Held-Out Median Calibration Error**: **0.061 m** (Target: $\le 0.50$ m)
- **Quality Gate Check Latency**: $<0.8$ seconds
- **Real-Video Conflict Detection**: 5 reviewer-actionable events extracted from 15-second authorized footage
- **Human Review Reason Enforcement**: 100% of review state changes require auditable justifications.
