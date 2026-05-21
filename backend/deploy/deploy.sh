#!/usr/bin/env bash
# deploy.sh — Deploy shine-app backend to VPS
# Run from local machine: bash backend/deploy/deploy.sh
# Prerequisites: SSH access to root@205.172.56.163

set -euo pipefail

VPS="root@205.172.56.163"
REMOTE_DIR="/root/shine-app"
BACKEND_DIR="$REMOTE_DIR/backend"

echo "=== Shine App Backend Deployment ==="

# 1. Create directory structure on VPS
echo "[1/7] Creating directory structure..."
ssh "$VPS" "mkdir -p $BACKEND_DIR/services $BACKEND_DIR/routers $BACKEND_DIR/tests"

# 2. Push code via git
echo "[2/7] Syncing code..."
ssh "$VPS" "
  if [ ! -d $REMOTE_DIR/.git ]; then
    echo 'ERROR: $REMOTE_DIR is not a git repo. Clone it first:'
    echo '  git clone https://github.com/YOUR_USER/shine-app.git $REMOTE_DIR'
    exit 1
  fi
  cd $REMOTE_DIR && git pull origin main
"

# 3. Copy actual vpn-bot services (replace stubs)
echo "[3/7] Copying vpn-bot services (replacing stubs)..."
ssh "$VPS" "
  cp ~/vpn-bot/services/db.py $BACKEND_DIR/services/db.py
  cp ~/vpn-bot/services/xui.py $BACKEND_DIR/services/xui.py
  echo 'Services copied. Checking env vars used in xui.py:'
  grep -E 'os\.(environ|getenv)' $BACKEND_DIR/services/xui.py || echo '(no os.environ/getenv calls found)'
"

# 4. Create virtualenv and install dependencies
echo "[4/7] Setting up Python virtualenv..."
ssh "$VPS" "
  cd $BACKEND_DIR
  python3 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
"

# 5. Create .env from .env.example (if not exists)
echo "[5/7] Checking .env..."
ssh "$VPS" "
  if [ ! -f $BACKEND_DIR/.env ]; then
    echo 'ERROR: $BACKEND_DIR/.env does not exist!'
    echo 'Create it from .env.example and fill in real values:'
    echo '  cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env'
    echo '  nano $BACKEND_DIR/.env'
    echo ''
    echo 'Required variables:'
    cat $BACKEND_DIR/.env.example
    exit 1
  fi
  # Secure permissions
  chmod 600 $BACKEND_DIR/.env
  echo '.env found and permissions set to 600'
"

# 6. Install systemd unit file
echo "[6/7] Installing systemd unit file..."
ssh "$VPS" "
  cp $BACKEND_DIR/deploy/shine-app-backend.service /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable shine-app-backend
  systemctl restart shine-app-backend
  sleep 3
  systemctl status shine-app-backend --no-pager
"

# 7. Verify health endpoint
echo "[7/7] Verifying health endpoint..."
ssh "$VPS" "curl -s http://127.0.0.1:8000/api/health"

echo ""
echo "=== Deployment complete ==="
echo "Run to check logs: ssh $VPS 'journalctl -u shine-app-backend -n 20 --no-pager'"
