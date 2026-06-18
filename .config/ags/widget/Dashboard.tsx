import { createState, type Accessor } from "gnim"
import { timeout } from "ags/time"
import Gtk from "gi://Gtk?version=4.0"
import Astal from "gi://Astal?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import SystemInfo from "./SystemInfo"
import MprisWidget from "./Mpris"
import CpuTemp from "./CpuTemp"
import Battery from "./Battery"
import Cava from "./Cava"

const STAGGER = 90 // ms between each cell

// transparent wrapper that fades + rises its child in/out
function Reveal({
    shown,
    children,
    expand = false,
    vexpand = false,
}: {
    shown: Accessor<boolean>
    children: any
    expand?: boolean
    vexpand?: boolean
}) {
    return (
        <box
            hexpand={expand}
            vexpand={vexpand}
            cssClasses={shown.as(s => ["reveal", s ? "reveal-shown" : "reveal-hidden"])}
        >
            {children}
        </box>
    )
}

export default function Dashboard(gdkmonitor: Gdk.Monitor) {
    // one reveal state per cell, in cascade order
    const cells = Array.from({ length: 5 }, () => createState(false))
    const [mpris, sysinfo, cpuTemp, battery, cava] = cells

    const run = () => cells.forEach(([, set], i) => timeout(i * STAGGER, () => set(true)))
    const reset = () => cells.forEach(([, set]) => set(false))

    return (
        <window
            name="dashboard"
            gdkmonitor={gdkmonitor}
            cssClasses={["Dashboard"]}
            layer={Astal.Layer.TOP}
            exclusivity={Astal.Exclusivity.NORMAL}
            visible={true}
            $={(self: Astal.Window) => {
                self.connect("notify::visible", () => (self.visible ? run() : reset()))
                if (self.visible) run()
            }}
        >
            <box
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                orientation={Gtk.Orientation.VERTICAL}
                cssClasses={["dashboard-inner"]}
                spacing={12}
                marginTop={24}
                marginBottom={24}
                marginStart={24}
                marginEnd={24}
                widthRequest={800}
            >
                {/* top row: mpris (fixed) | stats column (fills) */}
                <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
                    <Reveal shown={mpris[0]}>
                        <MprisWidget gdkmonitor={gdkmonitor} />
                    </Reveal>

                    <box orientation={Gtk.Orientation.VERTICAL} spacing={12} hexpand={true}>
                        <Reveal shown={sysinfo[0]} expand={true}>
                            <SystemInfo gdkmonitor={gdkmonitor} />
                        </Reveal>

                        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12} homogeneous={true} vexpand={true}>
                            <Reveal shown={cpuTemp[0]} expand={true} vexpand={true}>
                                <CpuTemp gdkmonitor={gdkmonitor} />
                            </Reveal>
                            <Reveal shown={battery[0]} expand={true} vexpand={true}>
                                <Battery gdkmonitor={gdkmonitor} />
                            </Reveal>
                        </box>
                    </box>
                </box>

                {/* cava full-width strip */}
                <Reveal shown={cava[0]} expand={true}>
                    <Cava gdkmonitor={gdkmonitor} />
                </Reveal>
            </box>
        </window>
    )
}
