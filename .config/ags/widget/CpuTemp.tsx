import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { Gtk, Gdk } from "ags/gtk4"

const TEMP_PATH = "/sys/class/thermal/thermal_zone9/temp" // x86_pkg_temp

export default function CpuTemp({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const temp = createPoll(0, 3000, async () => {
        const raw = await execAsync(["cat", TEMP_PATH])
        return Math.round(parseInt(raw.trim()) / 1000)
    })

    return (
        <box
            cssClasses={["cell"]}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={6}
            hexpand={true}
            vexpand={true}
        >
            <label cssClasses={["micro"]} label="CPU TEMP" halign={Gtk.Align.START} />
            <label
                cssClasses={["value-lg"]}
                label={temp.as(t => `${t}°`)}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                vexpand={true}
            />
        </box>
    )
}
