# Deploying BlitzDeck to NAS

There are two main ways to deploy:
1.  **Automated Web Install (Recommended)**: The NAS downloads the ready-made image from GitHub.
2.  **Manual Install**: You build the image yourself and upload it.

## Option 1: Automated Web Install (Recommended)

This method allows your NAS to pull the latest version directly from the web, just like any other Docker app.

### Prerequisites
-   **Docker** installed on your NAS (Container Manager on Synology, Container Station on QNAP).

### Step 1: Configure NAS
Create a `docker-compose.yml` on your NAS with the following content.

```yaml
version: '3'
services:
  blitz-deck:
    # This pulls from the web!
    image: ghcr.io/jaiminjoshi-at/blitz-deck:master
    container_name: blitz-deck
    restart: unless-stopped
    ports:
      - "3000:3000"
    # Run as root to avoid permission issues with reading NAS files
    user: root
    environment:
      - NODE_ENV=production
      - CONTENT_DIR=/app/content
    volumes:
      # You still need to provide the content files
      - ./packs:/app/content
```

### Step 2: Organize Your Content (Important!)
The application expects a specific nested structure for your content packs. **Do not just drop JSON files into the `packs` folder.**

1.  Create a folder named `packs` on your NAS (in the same place as your `docker-compose.yml`).
2.  Inside `packs`, create a folder for your course (e.g., `german-basics`).
3.  Inside `german-basics`, you must have the full hierarchy:
    ```text
    packs/
    └── german-basics/            <-- The Content Pack Folder
        ├── metadata.json         <-- Pack info
        └── course-1/             <-- A Pathway Folder
            ├── metadata.json     <-- Pathway info
            └── unit-1/           <-- A Unit Folder
                ├── metadata.json <-- Unit info
                └── lesson-1.json <-- The Lesson content
    ```

**Pro Tip**: The code repository on your computer already has working content in `src/content/packs`. The easiest way is to copy that entire `packs` folder to your NAS.

### Step 3: Run
Run this command in the folder where you saved the file:
```bash
docker-compose up -d
```
(Or use your NAS's "Container Manager" to create a project from this YAML).

### How to Update
When you push new code to GitHub, the image will automatically rebuild. To update your NAS:
1.  Navigate to your project folder.
2.  Run:
    ```bash
    docker-compose pull
    docker-compose up -d
    ```

---

## Option 2: Manual Offline Install (Old Method)

Use this if your NAS doesn't have internet access or if you don't want to use GitHub.

> [!NOTE]
> We recommend building the Docker image on your powerful computer and transferring it to the NAS. Building directly on the NAS can be very slow and may fail due to limited RAM.

### Step 1: Build the Image Locally
On your development machine (where the code is), run:

```powershell
# Build the image with the 'latest' tag
docker build -t blitz-deck:latest .
```

### Step 2: Save the Image to a File
Save the built image to a portable `.tar` file:

```powershell
docker save -o blitz-deck.tar blitz-deck:latest
```

### Step 3: Prepare the NAS Files
You need to create a folder on your NAS (e.g., `/volume1/docker/blitz-deck`) and place the following files there:
1.  `blitz-deck.tar` (The file you just created)
2.  `src/content/packs` (Copy this entire directory structure so your content exists on the NAS)
3.  `docker-compose.nas.yml` (Create this file with the content below)

#### docker-compose.nas.yml
Use this specific configuration for the NAS. It uses the pre-built image instead of trying to build it.

```yaml
version: '3'
services:
  blitz-deck:
    image: blitz-deck:latest
    container_name: blitz-deck
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      # This points to the mount path inside the container
      - CONTENT_DIR=/app/content
    volumes:
      # Map the local 'packs' folder on your NAS to the container
      - ./packs:/app/content
```

### Step 4: Load and Run on NAS

#### Option A: Via SSH (Recommended/Fastest)
1.  SSH into your NAS.
2.  Navigate to your folder: `cd /volume1/docker/blitz-deck`
3.  Load the image:
    ```bash
    docker load -i blitz-deck.tar
    ```
4.  Start the app:
    ```bash
    docker-compose -f docker-compose.nas.yml up -d
    ```

#### Option B: Via NAS GUI (Synology Container Manager)
1.  **Import Image**: Go to **Image** -> **Import** -> Select `blitz-deck.tar` from your NAS file system.
2.  **Create Project**: Go to **Project** -> **Create**.
    -   Name: `blitz-deck`
    -   Path: Select the folder where you put `docker-compose.nas.yml`.
    -   Source: Select "Create from existing docker-compose.yml".
3.  **Run**: Follow the wizard to start the project.

## Verifying
Open `http://<YOUR-NAS-IP>:3000` in your browser. You should see BlitzDeck running!
