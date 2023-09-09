import express from "express";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Crop server running");
});

app.post("/crop", (req, res) => {
  const { videoUrl, startTime, duration } = req.body;

  ffmpeg(videoUrl)
    .setStartTime(startTime)
    .setDuration(duration)
    .output("output.webm")
    .on("end", () => res.send("Video processing finished"))
    .on("error", (err) => res.status(500).send(err.message))
    .run();
});

app.listen(8001, () => {
  console.log("🦊 Express Server is running at http://localhost:8001");
});
