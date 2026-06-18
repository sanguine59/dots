import app from "ags/gtk4/app"
import style from "./style.scss"
import Dashboard from "./widget/Dashboard"

app.start({
  css: style,
  main() {
    app.get_monitors().map(Dashboard)

    // Quit when the focused workspace changes, so the dashboard only lives on the
    // workspace it was opened from. Dynamic import: skipped if libastal-hyprland-git
    // isn't installed. (Quitting also frees all resources — see toggle.sh model.)
    import("gi://AstalHyprland?version=0.1")
      .then(({ default: AstalHyprland }) => {
        const hypr = AstalHyprland.get_default()
        hypr.connect("notify::focused-workspace", () => app.quit())
      })
      .catch(() => {
        console.log("AstalHyprland not available — workspace auto-close disabled")
      })
  },
})
