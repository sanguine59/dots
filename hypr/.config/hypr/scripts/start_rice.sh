#!/bin/bash

# Kill previous instances to prevent duplicates
killall kitty
killall cava

# Launch the apps with custom class names (Order does not matter anymore)
# 1. Bonsai (Top Right)
kitty --class rice_bonsai -e cbonsai --live --infinite &

# 2. Fastfetch (Bottom Left)
kitty --class rice_fetch --hold -e fastfetch --config ~/.config/fastfetch/rice-config.jsonc &

# 3. Cava (Bottom Right)
kitty --class rice_cava -o -e cava &

# 4 Glow (Top Left)
kitty --class rice_glow --hold -o cursor_blink_interval=0 -e glow -s dark -w 50 ~/rice_glow.md &
