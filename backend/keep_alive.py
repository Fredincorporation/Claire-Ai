import time
import urllib.request
import os
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

PING_URL = os.getenv("RENDER_EXTERNAL_URL", "http://localhost:8000") + "/api/v1/keep-alive"
PING_INTERVAL_SECONDS = 13 * 60  # Ping every 13 minutes (infrequent 12-14 min window to conserve Render free hours)

def ping_health():
    try:
        req = urllib.request.Request(PING_URL, headers={"User-Agent": "ClaireAI-KeepAlive/1.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                logging.info(f"Keep-alive ping successful: {PING_URL}")
            else:
                logging.warning(f"Keep-alive returned status {response.status}")
    except Exception as e:
        logging.error(f"Keep-alive ping failed: {e}")

if __name__ == "__main__":
    logging.info(f"Starting Claire AI keep-alive worker for target: {PING_URL}")
    while True:
        ping_health()
        time.sleep(PING_INTERVAL_SECONDS)
