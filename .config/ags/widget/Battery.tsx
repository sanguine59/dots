import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { Gtk, Gdk } from "ags/gtk4"

interface BatteryInfo { capacity: number; status: string; watts: number }

export default function Battery({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const battery = createPoll<BatteryInfo>(
        { capacity: 0, status: "Unknown", watts: 0 },
        5000,
        async () => {
            const [capacity, status, power] = await Promise.all([
                execAsync(["cat", "/sys/class/power_supply/BAT0/capacity"]),
                execAsync(["cat", "/sys/class/power_supply/BAT0/status"]),
                execAsync(["cat", "/sys/class/power_supply/BAT0/power_now"]).catch(() => "0"),
            ])
            return {
                capacity: parseInt(capacity.trim()),
                status: status.trim(),
                watts: Math.round((parseInt(power.trim()) / 1_000_000) * 10) / 10,
            }
        }
    )

    return (
        <box
            cssClasses={["cell"]}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={6}
            hexpand={true}
            vexpand={true}
        >
            <label cssClasses={["micro"]} label="BATTERY" halign={Gtk.Align.START} />
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2} valign={Gtk.Align.CENTER} vexpand={true}>
                <label cssClasses={["value-lg"]} label={battery.as(b => `${b.capacity}%`)} halign={Gtk.Align.CENTER} />
                <label
                    cssClasses={["sub"]}
                    label={battery.as(b => (b.status === "Charging" ? `↑ ${b.watts}W` : b.status))}
                    halign={Gtk.Align.CENTER}
                />
            </box>
        </box>
    )
}
