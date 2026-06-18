import { Gtk, Gdk } from "ags/gtk4"
import Vte from "gi://Vte?version=3.91"
import GLib from "gi://GLib?version=2.0"

export default function Cava({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const term = new Vte.Terminal()

    term.set_size(40, 4)                 // columns × rows → cava resolution
    term.set_cursor_blink_mode(Vte.CursorBlinkMode.OFF)
    term.set_scroll_on_output(false)
    term.set_scrollback_lines(0)
    term.set_clear_background(false)     // let the cell background show through

    term.spawn_async(
        Vte.PtyFlags.DEFAULT,
        null,
        ["cava"],
        null,
        GLib.SpawnFlags.SEARCH_PATH,
        null, -1, null, null
    )

    return (
        <box
            cssClasses={["cava-cell"]}
            orientation={Gtk.Orientation.VERTICAL}
            heightRequest={80}
            hexpand={true}
        >
            {term}
        </box>
    )
}
