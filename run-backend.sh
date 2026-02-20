#!/bin/bash
# Run the iron_man backend (https://github.com/AryanKhokale/iron_man)
cd "$(dirname "$0")/backend/iron_man"
uvicorn main:app --reload --host 127.0.0.1 --port 8000
