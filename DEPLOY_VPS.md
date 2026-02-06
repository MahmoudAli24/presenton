# Deploy Presenton on a VPS

Deploy the pre-built Presenton Docker image (`ghcr.io/presenton/presenton:latest`) on a VPS with OpenAI as the LLM provider. No GPU required.

## Prerequisites

- A VPS with SSH access (Ubuntu/Debian recommended, minimum 2GB RAM)
- A domain name (optional but recommended for HTTPS)
- An OpenAI API key

## Steps

### 1. Install Docker on the VPS

SSH into your server and install Docker:

```bash
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for the group change to take effect
```

### 2. Create the data directory

```bash
mkdir -p ~/presenton/app_data
cd ~/presenton
```

### 3. Run Presenton with Docker

```bash
docker run -d \
  --name presenton \
  --restart unless-stopped \
  -p 5000:80 \
  -v "./app_data:/app_data" \
  -e LLM=openai \
  -e OPENAI_API_KEY=sk-your-key-here \
  ghcr.io/presenton/presenton:latest
```

Key flags:
- `-d` -- Run in background (detached)
- `--restart unless-stopped` -- Auto-restart on crash or server reboot
- `-p 5000:80` -- Expose on port 5000 (change as needed)
- `-v "./app_data:/app_data"` -- Persistent data storage
- `-e LLM=openai` -- Set OpenAI as the provider
- `-e OPENAI_API_KEY=...` -- Your OpenAI API key

### 4. (Optional) Set up reverse proxy with HTTPS

If you have a domain, set up Nginx + Let's Encrypt on the host:

```bash
# Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx config for your domain
sudo tee /etc/nginx/sites-available/presenton <<'EOF'
server {
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        client_max_body_size 100M;
        proxy_read_timeout 1800s;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/presenton /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 5. Open firewall ports

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# If not using a reverse proxy, also allow 5000:
# sudo ufw allow 5000/tcp
```

### 6. Verify deployment

- Without domain: Visit `http://your-server-ip:5000`
- With domain: Visit `https://your-domain.com`

## Optional Environment Variables

These can be added as additional `-e` flags to the `docker run` command:

| Variable | Description |
|---|---|
| `OPENAI_MODEL=gpt-4.1` | Change the OpenAI model (default: gpt-4.1) |
| `PEXELS_API_KEY=...` | Enable Pexels stock images |
| `CAN_CHANGE_KEYS=true` | Allow changing API keys from the UI |
| `DISABLE_ANONYMOUS_TRACKING=true` | Disable telemetry |

For a full list of environment variables, see `docker-compose.yml`.

## Management Commands

```bash
# View logs
docker logs -f presenton

# Stop
docker stop presenton

# Start
docker start presenton

# Update to latest version
docker pull ghcr.io/presenton/presenton:latest
docker stop presenton && docker rm presenton
# Then re-run the docker run command from Step 3

# Check status
docker ps
```

## Verification

1. Run `docker ps` to confirm the container is running.
2. Run `docker logs presenton` to check for startup errors.
3. Visit the app URL in a browser.
4. Create a test presentation to verify OpenAI integration works.
