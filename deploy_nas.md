# Deploying BlitzDeck to NAS

This guide explains how to deploy BlitzDeck on your NAS using Docker Compose.

## Prerequisites
-   **Docker** installed on your NAS (Container Manager on Synology, Container Station on QNAP).

## Deployment Instructions

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
    # Run as root to avoid permission issues if binding low ports or accessing system resources
    user: root
    environment:
      - NODE_ENV=production
      # Database Connection
      - DATABASE_URL=postgresql://postgres:password@blitz-deck-db:5432/blitzdeck
      # SECURITY: You MUST change this secret!
      # To generate a good secret, run `openssl rand -base64 32` in your terminal
      # or use a password manager to generate a long random string.
      - AUTH_SECRET=change_me_to_a_long_random_string
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    container_name: blitz-deck-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: blitzdeck
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Step 2: Run
Run this command in the folder where you saved the file:
```bash
docker-compose up -d
```
(Or use your NAS's "Container Manager" to create a project from this YAML).


### Step 3: Initialize Database (One-time setup)
The database starts empty. You need to run the seed script to create the `admin` and `learner` users and load the content.

Run this command (replace `blitz-deck` with your container name if different):
```bash
docker exec blitz-deck npm run seed
```
*(If checking database schema updates is needed in the future, you can also run `docker exec blitz-deck npm run db:push`)*

### How to Update
When you push new code to GitHub, the image will automatically rebuild. To update your NAS:
1.  Navigate to your project folder.
2.  Run:
    ```bash
    docker-compose pull
    docker-compose up -d
    ```

### Accessing the App
Open `http://<YOUR-NAS-IP>:3000` in your browser. You should see BlitzDeck running!
