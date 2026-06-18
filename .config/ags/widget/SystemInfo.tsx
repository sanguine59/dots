import { Gtk, Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import GTop from "gi://GTop?version=2.0"

const BAR = 400 // fixed bar/row width inside the cell

interface Memory { total: number; used: number; free: number }
interface Disk { total: number; used: number; free: number }

export default function SystemInfo({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {

    function toGB(bytes: number): number {
        return bytes / 1024 / 1024 / 1024
    }

    function fetchMem(mem: GTop.glibtop_mem): Memory {
        const total = toGB(mem.total)
        const used = toGB(mem.user)
        return { total, used, free: total - used }
    }

    function fetchDisk(path: string): Disk {
        const disk = new GTop.glibtop_fsusage()
        GTop.glibtop_get_fsusage(disk, path)
        const total = disk.blocks * disk.block_size
        const free = disk.bavail * disk.block_size
        const used = total - free
        return { total: toGB(total), used: toGB(used), free: toGB(free) }
    }

    const cpuUsage = (prev: GTop.glibtop_cpu, curr: GTop.glibtop_cpu): number => {
        const totalDelta = curr.total - prev.total
        const idleDelta = curr.idle - prev.idle
        return totalDelta > 0 ? ((totalDelta - idleDelta) / totalDelta) * 100 : 0
    }

    let prevCpu = new GTop.glibtop_cpu()
    GTop.glibtop_get_cpu(prevCpu)

    const cpu = createPoll(0, 2000, () => {
        const curr = new GTop.glibtop_cpu()
        GTop.glibtop_get_cpu(curr)
        const usage = cpuUsage(prevCpu, curr)
        prevCpu = curr
        return usage
    })

    const mem = createPoll<Memory>({ total: 0, used: 0, free: 0 }, 3000, () => {
        const m = new GTop.glibtop_mem()
        GTop.glibtop_get_mem(m)
        return fetchMem(m)
    })

    const disk = createPoll<Disk>({ total: 0, used: 0, free: 0 }, 10000, () => fetchDisk("/"))

    // one metric block: micro-label + value on a justified row, thin bar below
    function Metric(label: string, value: any, fraction: any) {
        return (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} widthRequest={BAR} halign={Gtk.Align.START}>
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                    <label cssClasses={["micro"]} label={label} halign={Gtk.Align.START} />
                    <box hexpand={true} />
                    <label cssClasses={["value-sm"]} label={value} halign={Gtk.Align.END} />
                </box>
                <box cssClasses={["bar-track"]} widthRequest={BAR}>
                    <box cssClasses={["bar-fill"]} widthRequest={fraction} />
                </box>
            </box>
        )
    }

    return (
        <box cssClasses={["cell"]} orientation={Gtk.Orientation.VERTICAL} spacing={16} hexpand={true}>
            {Metric("CPU",
                cpu.as(c => `${c.toFixed(1)}%`),
                cpu.as(c => Math.floor((Math.min(c, 100) / 100) * BAR)))}

            {Metric("MEMORY",
                mem.as(m => `${m.used.toFixed(1)} / ${m.total.toFixed(1)} GB`),
                mem.as(m => m.total > 0 ? Math.floor((m.used / m.total) * BAR) : 0))}

            {Metric("DISK",
                disk.as(d => `${d.used.toFixed(0)} / ${d.total.toFixed(0)} GB`),
                disk.as(d => d.total > 0 ? Math.floor((d.used / d.total) * BAR) : 0))}
        </box>
    )
}
