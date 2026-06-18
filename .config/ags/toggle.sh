#!/bin/bash

# Detect with anchored ^ags: the ags binary's command line starts with "ags",
# while this script's starts with "/bin/bash …/toggle.sh", so it never matches
# itself. Kill with the proven `pkill -9 -f ags` from kill.sh.
if pgrep -f '^ags' >/dev/null; then
    pkill -9 -f ags &>/dev/null
else
    ags run ~/Projects/dots/.config/ags/app.ts &
    disown
fi
