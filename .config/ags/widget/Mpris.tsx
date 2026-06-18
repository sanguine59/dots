import { createPoll } from "ags/time"
import { Gtk, Gdk, Astal } from "ags/gtk4"
import AstalMpris from "gi://AstalMpris?version=0.1"
import GdkPixbuf from "gi://GdkPixbuf?version=2.0"

const FALLBACK = "/home/sanguine/Pictures/pfp3.png"
const ART = 240
const BAR = 264

// nerd-font transport glyphs
const PREV = ""
const PLAY = ""
const PAUSE = ""
const NEXT = ""

export default function MprisWidget({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const mpris = AstalMpris.Mpris.get_default()

    const getPlayer = () =>
        mpris.players.find(p => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING)
        ?? mpris.players[0]
        ?? null

    // Firefox only exposes a 60×60 thumbnail, so we use the fallback as the cover.
    // Center-crop to an exact square at source resolution (downscale only → sharp).
    const pic = new Gtk.Picture()
    pic.add_css_class("album-art")
    pic.widthRequest = ART
    pic.heightRequest = ART
    pic.halign = Gtk.Align.CENTER
    try {
        const src = GdkPixbuf.Pixbuf.new_from_file(FALLBACK)
        const w = src.get_width(), h = src.get_height()
        const scale = ART / Math.min(w, h)
        const sw = Math.round(w * scale), sh = Math.round(h * scale)
        const scaled = src.scale_simple(sw, sh, GdkPixbuf.InterpType.BILINEAR)!
        const cropped = scaled.new_subpixbuf(
            Math.floor((sw - ART) / 2), Math.floor((sh - ART) / 2), ART, ART,
        )
        pic.set_paintable(Gdk.Texture.new_for_pixbuf(cropped))
    } catch { /* leave empty */ }

    const title = createPoll<string>("Nothing Playing", 1000, () => getPlayer()?.title || "Nothing Playing")
    const artist = createPoll<string>("", 1000, () => getPlayer()?.artist || "")
    const progress = createPoll<number>(0, 1000, () => {
        const p = getPlayer()
        return p && p.length > 0 ? p.position / p.length : 0
    })
    const playing = createPoll<boolean>(false, 500, () =>
        getPlayer()?.playbackStatus === AstalMpris.PlaybackStatus.PLAYING)

    // draggable seek bar — change-value only fires on user drag, so the poll
    // (which sets .value programmatically) never triggers a seek loop
    const seek = new Astal.Slider({ hexpand: true })
    seek.add_css_class("seek")
    seek.min = 0
    seek.max = 1
    seek.value = progress.peek()
    progress.subscribe(() => (seek.value = progress.peek()))
    seek.connect("change-value", (_s: any, _scroll: any, value: number) => {
        const p = getPlayer()
        if (p && p.length > 0) p.set_position(value * p.length)
        return false
    })

    const Ctrl = (glyph: any, onClicked: () => void, big = false) => (
        <button cssClasses={["ctrl"]} onClicked={onClicked}>
            <label cssClasses={big ? ["ctrl-icon", "play"] : ["ctrl-icon"]} label={glyph} />
        </button>
    )

    return (
        <box cssClasses={["cell"]} orientation={Gtk.Orientation.VERTICAL} spacing={14} widthRequest={300}>
            <label cssClasses={["micro"]} label="NOW PLAYING" halign={Gtk.Align.START} />

            {pic}

            <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
                <label cssClasses={["mpris-title"]} label={title} halign={Gtk.Align.START} maxWidthChars={26} ellipsize={3} />
                <label cssClasses={["mpris-artist"]} label={artist} halign={Gtk.Align.START} maxWidthChars={30} ellipsize={3} />
            </box>

            <box widthRequest={BAR} halign={Gtk.Align.CENTER}>
                {seek}
            </box>

            <box cssClasses={["controls"]} orientation={Gtk.Orientation.HORIZONTAL} spacing={18} halign={Gtk.Align.CENTER}>
                {Ctrl(PREV, () => getPlayer()?.previous())}
                {Ctrl(playing.as(p => (p ? PAUSE : PLAY)), () => getPlayer()?.play_pause(), true)}
                {Ctrl(NEXT, () => getPlayer()?.next())}
            </box>
        </box>
    )
}
