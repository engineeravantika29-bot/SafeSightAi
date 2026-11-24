# SafeSight AI — Live Demo Script & Jury Defense Guide
**PRASUNEX INNOVATHON 2026 — Round 3 Prototype**  
*Calibrated, Explainable, Human-Verified Near-Miss Intelligence*

---

## Part 1: Live Demonstration Walkthrough (10-Minute Presentation)

### Step 1: System Purpose & Core Commitment (0:00 – 1:30)
- **Presenter Action**: Open the application at `http://localhost:5173`.
- **Key Talking Point**:
  > *"SafeSight AI is NOT a crash prediction system. We do not claim to predict accidents. In civil transportation engineering, fatal crashes are statistically rare and unpredictable. SafeSight AI turns authorized surveillance footage into calibrated, explainable surrogate near-miss intelligence with mandatory human verification."*
- **Visual Highlight**: Point to the persistent top banner emphasizing the non-prediction engineering constraint.

---

### Step 2: Video Ingestion & Quality Gate Screening (1:30 – 3:30)
- **Presenter Action**:
  1. Navigate to the **Upload & Quality Gate** tab (`/upload`).
  2. Select Camera ID **CAM_01 (Pie-IX & Sherbrooke Urban Intersection)**.
  3. Show the surveyed calibration status pill: **Held-Out Median Error: 0.061m (Target $\le 0.50$m PASS)**.
  4. Select or drop `sample_data/videos/intersection_authorized.mp4` (or click the quick-select preset).
  5. Click **"Upload & Evaluate Quality Gate"**.
- **What to Observe on Screen**:
  - Upload completes and Quality Gate evaluation triggers instantly ($<1$ second).
  - Four sub-metrics appear:
    - **Resolution**: 1920x1080 (Score: 1.0)
    - **Frame Rate**: 29.97 FPS (Score: 1.0)
    - **Laplacian Blur Variance**: Clean street footage (Score: 0.85)
    - **Illumination**: Optimal ambient lighting (Score: 1.0)
  - Composite Quality Score: **1.0 (ACCEPTED)**.
- **Presenter Note**:
  > *"Our quality gate guarantees that degraded, blurry, or jittery cameras cannot silently generate high-confidence false near misses."*

---

### Step 3: Two-Pass Execution & Real-Time Tracking (3:30 – 5:00)
- **Presenter Action**:
  1. Click **"Launch Two-Pass Conflict Analysis"**.
  2. The UI navigates to `/processing/:jobId`.
- **What to Observe on Screen**:
  - Visual stepped pipeline highlights stages:
    - Stage 1: Quality Gate Verification
    - Stage 2: Ground-Plane Homography Grid
    - Stage 3: Pass 1 Screening (~5 FPS temporal window detection)
    - Stage 4: Pass 2 Native Deep Tracking (YOLOv8 + ByteTrack + Parquet storage)
    - Stage 5: Conflict Analysis (Constant-Velocity TTC & Shared-Zone PET)
    - Stage 6: Privacy Anonymization & Evidence Clipping
  - Real-time progress bar reaches 100% in ~15-20 seconds.
  - Green **COMPLETED** badge appears.
  - Click **"Inspect Candidate Conflict Events"**.

---

### Step 4: Incident Review & Human Verification (5:00 – 7:30)
- **Presenter Action**:
  1. Navigate to the **Incident Review** screen (`/events`).
  2. Point out the candidate conflict events extracted from real video footage (e.g. `pedestrian_vehicle` car-person conflict with TTC 1.4s, `unsafe_turn` car-car conflict with TTC 1.9s).
  3. Click on the high-severity **`pedestrian_vehicle` (car-person)** event.
- **What to Observe on Screen**:
  - **Embedded Evidence Video**: Plays a 5-second video clip centered on the near miss. Observe that the pedestrian's face and the vehicle's license plate are automatically obscured with Gaussian privacy blurring.
  - **Telemetry Grid**:
    - Minimum TTC: **1.4s**
    - Relative Closing Speed: **24.5 km/h**
    - Crossing Angle: **88.0°** (perpendicular turn crossing)
  - **Strict Severity vs Confidence Separation**:
    - **Physical Severity Card**: Classified as **High Hazard** (due to vulnerable road user involvement + low TTC + turning approach).
    - **Statistical Confidence Card**: Rated at **88%** with individual breakdown (Calibration 95%, Tracking 85%, Detection 82%, Visibility 90%).
  - **Human Review Decision**:
    1. Select **"Confirm Conflict"**.
    2. Try submitting with an empty text box $\rightarrow$ The UI rejects it with an error: *"Mandatory human review reason is required."*
    3. Type a professional engineering justification:
       `"Pedestrian crossed within marked crosswalk during vehicle right-turn phase; clear vehicle deceleration near miss."`
    4. Click **"Commit Review Decision"**.
    5. The event status instantly turns green (**CONFIRMED**), and an immutable record appears in the **Audit Trail Log History** with timestamp, reviewer ID, and justification reason.

---

### Step 5: Exposure-Normalized Hotspots & Safety Audit Report (7:30 – 10:00)
- **Presenter Action**:
  1. Click **"Hotspot Intelligence"** (`/hotspots`).
  2. Show the ranked hotspot table. Notice that **CAM_01** shows an exposure-normalized hotspot score of **340.0** and a conflict rate of **32.0 conflicts / 100 vehicle hours**.
  3. Explain the formula card:
     $$\text{Hotspot Score} = \frac{\text{Confirmed Severity} + w_{pending} \cdot \text{Pending Severity}}{\text{Exposure Hours}}$$
  4. Point out the Leaflet interactive map with the camera marker and hazard circle.
  5. Navigate to **"Safety Audit Report"** (`/reports`).
  6. Review the executive summary cards, the severity distribution bar chart, the conflict type interaction mix pie chart, and the Surveyor Calibration Certificate.
  7. Click **"Download Audit Report (.md)"** to demonstrate the exported safety audit document.

---

## Part 2: Backup Demo Plan (Contingency)

If live execution is delayed or server network stalls during the competition:
1. **Pre-Processed Database Backup**: The local SQLite database (`backend/safesight.db`) already contains 8 pre-computed, verified conflict events from `intersection_authorized.mp4`.
2. **Offline Mode**: All components run completely local without internet requirements.
3. **Evidence Video Fallback**: The pre-blurred evidence clips in `backend/storage/evidence_clips/` can be played directly in any standard video viewer if browser media codecs fail.
4. **Command Line Verification**: Run `python -m pytest app/tests/ -v` to show the jury instant green verification of all 15 unit and integration tests in under 8 seconds.

---

## Part 3: Comprehensive Jury Q&A Defense

### Q1: "Why does SafeSight AI explicitly refuse to claim crash prediction?"
> **Answer**:
> *"In civil and traffic safety engineering, crashes are extremely rare, stochastic events with complex causal chains (driver impairment, mechanical failure, sudden distraction). Any system claiming to predict future crashes from short CCTV clips is mathematically ungrounded and prone to dangerous false precision.*  
> *Instead, SafeSight AI adheres strictly to established surrogate safety assessment methodology: detecting observable near-miss surrogate indicators (TTC, PET) that diagnose dangerous intersection geometry. A detected conflict is an explainable screening signal for human review, not a claim that an accident was bound to occur."*

### Q2: "How do you calculate Time-to-Collision (TTC) without 3D LiDAR sensors?"
> **Answer**:
> *"We use ground-plane homography calibration calibrated against real physical reference points. By mapping bottom-center bounding box footprints into ground coordinates (meters), we represent road users as class-specific oriented rectangles (e.g. 4.5m x 1.8m for cars, 0.6m x 0.6m for pedestrians) aligned with their velocity vector.*  
> *We forward-simulate these footprints at 0.1-second intervals up to 5.0 seconds under a constant-velocity assumption. TTC is the earliest timestamp where the footprints intersect. To prevent false positives, we enforce an approach condition ($\vec{r}_{rel} \cdot \vec{v}_{rel} < 0$), a crossing angle filter, and a 3-frame persistence filter with hysteresis."*

### Q3: "Why do you separate Severity from Confidence instead of combining them into one number?"
> **Answer**:
> *"Combining severity and confidence into a single score leads to critical blind spots. For instance, a life-threatening near miss between a turning bus and a pedestrian captured on a blurry, rainy camera would receive a medium score and be overlooked. By keeping them separate, SafeSight AI flags this event as 'High Severity, Low Confidence', routing it immediately to an expert human reviewer for prioritized manual scrutiny."*

### Q4: "How does SafeSight AI prevent raw traffic volume from biasing hotspot identification?"
> **Answer**:
> *"If you only count raw near-miss events, high-volume intersections with 10,000 cars per hour will always rank as the worst hotspots, even if they have excellent lane design. SafeSight AI normalizes all severity scores by camera exposure hours:*
> $$\text{Hotspot Score} = \frac{\text{Confirmed Severity} + w_{pending} \cdot \text{Pending Severity}}{\text{Exposure Hours}}$$
> *This identifies genuine geometric hazards and infrastructure design flaws rather than simply measuring traffic congestion."*

### Q5: "How does your system address citizen privacy and regulatory compliance?"
> **Answer**:
> *"SafeSight AI is built under a strict Privacy-by-Design architecture:*
> 1. *Evidence clips automatically apply localized Gaussian blurring over pedestrian facial zones (upper 35% of bounding boxes) and vehicle license plates (lower bumper areas).*
> 2. *We do not perform facial recognition or vehicle identity indexing.*
> 3. *Evidence clip URLs use HMAC-SHA256 signed, time-limited tokens to prevent unauthorized scraping.*
> 4. *Every single reviewer decision is stored in an immutable audit log with a mandatory justification reason.*
> 5. *The system is strictly decision support for traffic engineers; it never issues automated citations or penalties."*
