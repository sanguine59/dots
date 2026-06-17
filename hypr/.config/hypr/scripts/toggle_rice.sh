#!/bin/bash
notify-send "DEBUG"
# Check if one of the widgets (e.g., bonsai) is already running
if pgrep -f "kitty --class rice_bonsai" > /dev/null; then
    # --- TOGGLE OFF (Close Everything) ---
    # We match the specific names so we don't kill your main terminal
    pkill -f "kitty --class rice_bonsai"
    pkill -f "kitty --class rice_fetch"
    pkill -f "kitty --class rice_cava"
    pkill -f "kitty --class rice_glow"
    
    # Optional: Send a notification
    notify-send "Rice Widgets" "Hidden"

else
    # --- TOGGLE ON (Launch Everything) ---
    
    # 1. Launch Apps
    # Bonsai (Top Right)
    kitty --class rice_bonsai -e cbonsai --live --infinite &

    # Fastfetch (Bottom Left)
    kitty --class rice_fetch --hold -e fastfetch --config ~/.config/fastfetch/rice-config.jsonc &

    # Cava (Bottom Right)
    kitty --class rice_cava -e cava &

    # Glow (Top Left)
    kitty --class rice_glow --hold -o cursor_blink_interval=0 -e glow -s dark -w 50 "$HOME/rice_glow.md" &
    
    notify-send "Rice Widgets" "Activated"
fi
