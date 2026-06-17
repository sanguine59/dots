#!/bin/bash

# 1. Kill old instance
pkill -f "kitty --class rice_glow"

# 2. Wait for it to die completely
sleep 0.2

# 3. Launch new instance with LOGGING
# We point to a log file so if it crashes, we know why.
kitty --class rice_glow --hold -o cursor_blink_interval=0 -e glow -s dark -w 50 "$HOME/rice_glow.md" > /tmp/rice_debug.log 2>&1 &

# 4. Detach process so closing the script doesn't kill the window
disown

