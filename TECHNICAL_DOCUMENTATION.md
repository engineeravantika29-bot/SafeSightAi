# SafeSight AI — Technical Documentation
**Round 3 Prototype for PRASUNEX INNOVATHON 2026**  
*Calibrated, Explainable, Human-Verified Near-Miss Intelligence*

---

## 1. Executive Summary & Non-Crash-Prediction Commitment
**SafeSight AI is NOT a crash prediction system.** It strictly refrains from claiming to predict accidents. In civil traffic engineering, collisions are rare, high-stochasticity events. SafeSight AI detects surrogate safety metrics (near-miss conflicts) using calibrated spatial computer vision, physics-based trajectory forward simulation, and human verification to diagnose hazardous road geometry before severe crashes occur.

A detected conflict is a **screening signal for human review**, not proof that a crash would have occurred.

---

## 2. System Architecture
SafeSight AI is structured as a modular, queue-backed, privacy-preserving microservices architecture:

```
[Authorized Video Source (MP4/AVI)]
                │
                ▼
      ┌──────────────────┐
      │   Quality Gate   │ ◄── Laplacian Blur, Brightness, FPS, Resolution
      └─────────┬────────┘
                │ (Accepted / Flagged)
                ▼
      ┌──────────────────┐
      │ Two-Pass Manager │
      └────┬────────┬────┘
           │        │
  (Pass 1: ~5 FPS)  │ (Pass 2: Native 30 FPS on Candidate Windows)
           ▼        ▼
┌────────────────────────────────────────────────────────┐
│ AI Perception Engine                                   │
│  ├─ Ultralytics YOLOv8 (640px, Conf 0.25, NMS 0.45)    │
│  ├─ ByteTrack Multi-Object Tracker (Max 5-frame gap)   │
│  └─ Parquet Trajectory Persistence Engine              │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Calibrated Spatial Geometry Engine                     │
│  ├─ Ground-Plane Homography (Image Pixels -> Meters)   │
│  ├─ Leave-One-Out Held-Out Error Validator (<0.5m)     │
│  ├─ Valid-Region Road Surface Mask                     │
│  └─ 3-Frame Moving Average Trajectory Smoother         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Conflict Diagnostic Engine                             │
│  ├─ Constant-Velocity TTC (Footprint Intersection)     │
│  ├─ Shared Conflict-Zone PET (Entry/Exit Delta)        │
│  ├─ Class-Specific Conflict Rules & Angle Filter       │
│  └─ 3-Frame Persistence & Hysteresis (2.5s / 3.5s)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Intelligence & Verification Engine                     │
│  ├─ Separate Severity vs Statistical Confidence        │
│  ├─ Automated Face & License Plate Privacy Blurring    │
│  ├─ Reviewer Verification (Mandatory Audit Reasons)    │
│  ├─ Exposure-Normalized Hotspot Scorer                 │
│  └─ Downloadable Safety Audit Report Generator         │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Per-Module Methodology

### 3.1 Video Quality Gate (`app/ai/quality_gate.py`)
Videos must pass minimum sensor quality checks before entering automated conflict pipelines:
1. **Resolution Score**: Evaluates spatial dimensions ($1920\times 1080 \rightarrow 1.0$, $1280\times 720 \rightarrow 0.9$, $960\times 540 \rightarrow 0.75$, $<640\times 480 \rightarrow 0.25$).
2. **Frame Rate Score**: Evaluates temporal fidelity ($\ge 25\text{ FPS} \rightarrow 1.0$, $20-25\text{ FPS} \rightarrow 0.85$, $15-20\text{ FPS} \rightarrow 0.60$, $<15\text{ FPS} \rightarrow 0.30$).
3. **Laplacian Blur Variance**: Computes $\sigma^2 = \text{Var}(\nabla^2 I_{gray})$. Values $<45$ represent heavy blur/out-of-focus optics.
4. **Illumination / Brightness**: Evaluates mean grayscale intensity. Standard surveillance window is $[50, 190]$. Under-exposed ($<40$) or over-exposed ($>220$) frames receive heavy penalties.
5. **Camera Stability**: Frame-to-frame mean absolute difference detects uncalibrated wind-shake or transmission jitter.
- **Composite Score**:
  $$Q = 0.25 \cdot S_{res} + 0.20 \cdot S_{fps} + 0.25 \cdot S_{blur} + 0.20 \cdot S_{bright} + 0.10 \cdot S_{stab}$$
- **Status Classification**: `accepted` ($Q \ge 0.65$), `flagged` ($0.40 \le Q < 0.65$), `rejected` ($Q < 0.40$).

### 3.2 Detection and ByteTrack Multi-Object Tracking (`app/ai/detector_tracker.py`)
- **YOLOv8**: Operates on COCO classes 0 (`person`), 1 (`bicycle`), 2 (`car`), 3 (`motorcycle`), 5 (`bus`), and 7 (`truck`). Confidence threshold 0.25, NMS IoU 0.45, input resolution 640px.
- **ByteTrack Tracking**: Associates detections across frames using low-score detection recycling.
- **Short Occlusion Gap Interpolation**: Interpolates track coordinates linearly for gaps $\le 5$ frames. Gaps $>5$ frames break track identity.
- **Short Track Rejection**: Tracks with $<10$ frames total duration are pruned to eliminate false-positive flicker.
- **Parquet Storage**: Complete trajectory frames $(frame, timestamp, track\_id, class, bbox, ground\_x, ground\_y, v_x, v_y, speed\_kmh)$ are written to Apache Parquet files in `storage/tracks/`.

### 3.3 Homography Calibration & Held-Out Error (`app/calibration/homography.py`)
Converts bottom-center 2D pixel coordinates $(u, v)$ to real-world ground coordinates $(X, Y)$ in meters:
$$
\begin{bmatrix} X \\ Y \\ 1 \end{bmatrix} \sim H \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}
$$
- **Held-Out Validation**: Employs leave-one-out cross validation across $N$ reference points. For point $i$, $H_{-i}$ is estimated using all points except $i$, and Euclidean projection error $e_i = \|(X_i, Y_i) - H_{-i}(u_i, v_i)\|$ is computed.
- **Validation Target**: Median held-out error $\le 0.50$ meters. `CAM_01` achieved **0.061 meters**, exceeding standards.
- **Valid-Region Mask**: Polygon defining the surveyed asphalt pavement. Detections outside the valid polygon are either masked out or assigned a calibration penalty.

### 3.4 Constant-Velocity TTC Engine (`app/conflict/ttc.py`)
- **Footprint Dimensions**:
  - Person: $0.6\text{m} \times 0.6\text{m}$
  - Bicycle: $1.8\text{m} \times 0.6\text{m}$
  - Motorcycle: $2.0\text{m} \times 0.8\text{m}$
  - Car: $4.5\text{m} \times 1.8\text{m}$
  - Bus: $12.0\text{m} \times 2.5\text{m}$
  - Truck: $10.0\text{m} \times 2.5\text{m}$
- **Orientation**: Footprint oriented along instantaneous heading angle $\theta = \text{atan2}(v_y, v_x)$.
- **Approach Condition**: Evaluates dot product of relative position and relative velocity:
  $$\vec{r}_{rel} \cdot \vec{v}_{rel} < -0.05$$
  If vehicles are diverging, TTC is null ($\infty$).
- **Forward Simulation**: Predicts bounding footprints forward at $\Delta t = 0.1$s intervals up to $5.0$ seconds. Earliest intersection point is the instantaneous TTC.
- **Persistence & Hysteresis**: Requires at least 3 consecutive frames with $TTC \le 2.5$s to trigger a conflict event. Conflict terminates when $TTC > 3.5$s or vehicles diverge.
- **Disclaimer**: Constant-velocity projection assumption. Braking estimation is not claimed.

### 3.5 Shared-Zone PET Engine (`app/conflict/pet.py`)
- For predefined conflict zone polygon in ground plane (e.g. crosswalk or left-turn pocket):
  $$\text{PET} = t_{\text{entry, second}} - t_{\text{exit, first}}$$
- If both road users occupy the zone simultaneously, $\text{PET} = 0.0$ seconds.
- Normal car-following is explicitly excluded from PET conflict classification.

### 3.6 Strict Separation of Severity and Confidence (`app/conflict/severity_confidence.py`)
SafeSight AI maintains strict mathematical separation between physical hazard and statistical reliability:
1. **Severity (Hazard Magnitude)**:
   - Evaluates minimum conflict metric ($\min(TTC, PET)$), maximum closing speed ($v_{rel}$ km/h), road user vulnerability (VRU interaction mix), crossing angle ($45^\circ-135^\circ$), and conflict zone type. Classified as `low`, `medium`, or `high`.
2. **Confidence (Sensing Reliability)**:
   $$confidence = 0.30 \cdot S_{cal} + 0.30 \cdot S_{trk} + 0.20 \cdot S_{det} + 0.20 \cdot S_{vis}$$
   All components normalized $[0.0, 1.0]$. A severe conflict with low camera quality receives High Severity, Low Confidence (routed to dedicated reviewer scrutiny).

### 3.7 Exposure-Normalized Hotspots (`app/services/hotspot_service.py`)
Raw conflict counts misrepresent risk by penalizing high-volume intersections:
$$\text{Hotspot Score} = \frac{\text{Confirmed Severity Score} + w_{pending} \cdot \text{Pending Severity Score}}{\text{Exposure Hours}}$$
- **Pending Weight ($w_{pending}$)**: Fixed at $0.50$ until 20 reviewer decisions exist. Once $\ge 20$ decisions exist, updated dynamically:
  $$w_{pending} = \frac{\text{Confirmed Decisions}}{\text{Total Decisions}}$$
- **Ranking Rule**: Locations require $\ge 2.0$ hours of analysed footage and $\ge 5$ candidate events to receive official ranking; otherwise labeled "camera-level pilot screening".

### 3.8 Privacy-Aware Evidence Storage (`app/services/privacy_service.py`)
- Evidence clips extract a 5-second window centered around the near-miss event.
- Automated Gaussian blurring is applied to upper 35% of detected persons (faces) and lower 25% of vehicles (license plates).
- No facial recognition is performed.
- Evidence video streaming is authenticated via HMAC-SHA256 time-limited signed tokens (`/api/events/{id}/evidence?token=...`).

---

## 4. Database Schema
SafeSight AI supports dual storage engines: PostgreSQL 16 + PostGIS in containerized deployments, with SQLite + pure-Python Shapely geometry for zero-dependency standalone execution.

| Table | Description |
|---|---|
| `users` | Roles (`admin`, `reviewer`, `viewer`), audit tracking |
| `videos` | Uploaded video metadata, duration, resolution, quality score, quality status |
| `processing_jobs` | Background pipeline tracking, progress percent, stage name, error messages |
| `calibrations` | Camera ID, homography matrix 3x3, reference points, held-out median error, valid region polygon |
| `conflict_zones` | Geometric ground polygons for crosswalks, turn pockets, intersection boxes |
| `tracks` | Parquet track pointer, road user class, track duration |
| `conflict_events` | Detected conflicts, TTC, PET, closing speed, crossing angle, severity, confidence breakdown |
| `review_audit_logs` | Immutable audit trail: reviewer ID, action, previous status, new status, mandatory reason |
| `hotspot_aggregates` | Camera ID, location, exposure hours, confirmed/pending scores, hotspot score, conflict rate |

---

## 5. API Reference
- `POST /api/videos`: Multipart upload with instant quality gate evaluation and job enqueuing.
- `GET /api/videos/{video_id}`: Video metadata and latest processing job status.
- `GET /api/jobs/{job_id}`: Job execution stage and percentage progress.
- `GET /api/events`: Filtered list of conflict events (status, severity, camera, confidence).
- `GET /api/events/{event_id}`: Event details, trajectory speeds, TTC/PET history, audit logs, and signed evidence URL.
- `POST /api/events/{event_id}/review`: Commit reviewer verification (`confirm`, `reject`, `reclassify`) with mandatory reason.
- `GET /api/events/{event_id}/evidence`: Time-limited signed evidence clip video streaming.
- `GET /api/hotspots`: Exposure-normalized hotspot rankings.
- `GET /api/reports/{location_id}`: Detailed safety audit intelligence report (JSON).
- `GET /api/reports/{location_id}/download`: Downloadable formatted markdown report.
- `GET /api/calibrations/{camera_id}`: Active calibration matrix and held-out validation error.
