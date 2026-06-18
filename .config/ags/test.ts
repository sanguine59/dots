import app from "ags/gtk4/app";
import { createPoll } from "ags/time";
import GTop from "gi://GTop?version=2.0";

app.start({
    main () {
        const cpu = new GTop.glibtop_cpu();
        GTop.glibtop_get_cpu(cpu);

        const mem = new GTop.glibtop_mem();
        GTop.glibtop_get_mem(mem);
        
        const fs = new GTop.glibtop_fsusage();
        GTop.glibtop_get_fsusage(fs, "/");

        function toGB(bytes: number): number {

            bytes = bytes / 1024 / 1024 / 1024

            return bytes;
        }

        const memTotal : any = toGB(mem.total).toFixed(2)
        const memUsed : any = toGB(mem.user).toFixed(2)
        const memFree  = (memTotal - memUsed).toFixed(2)
        console.log(memTotal)
        console.log(memUsed)
        console.log(memFree)


        const diskTotal = fs.blocks * fs.block_size;
        const diskFree = fs.bfree * fs.block_size;
        const diskAvai = fs.bavail * fs.block_size;
        const diskUsed = diskTotal - diskFree;

        const calcDiskTotal : any = toGB(diskTotal).toFixed(2);
        const calcDiskAvai : any = toGB(diskAvai).toFixed(2);
        const calcDiskUsed : any = toGB(diskUsed).toFixed(2);
        const avaiPercentage = (calcDiskAvai / calcDiskTotal) * 100;
        const usedPercentage = (calcDiskUsed / calcDiskTotal) * 100;


        console.log(calcDiskTotal + " GB");
        console.log(calcDiskAvai + " GB");
        console.log(calcDiskUsed + " GB");
        console.log(avaiPercentage.toFixed(2) + "%");
        console.log(usedPercentage.toFixed(2) + "%");


        app.quit()
    }
})