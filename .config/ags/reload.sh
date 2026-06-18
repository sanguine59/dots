#!/bin/bash



pkill -9 -f ags &>/dev/null

echo "relaoding ags"

sleep 0.3

ags run ~/Projects/dots/.config/ags/app.ts &
disown