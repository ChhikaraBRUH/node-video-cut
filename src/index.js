import express from "express";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Video Cut server running!");
});

app.post("/cut", (req, res) => {
  const { videoUrl, startTime, duration } = req.body;

  res.setHeader("Content-disposition", "attachment; filename=output.webm");
  res.setHeader("Content-type", "video/webm");

  ffmpeg(videoUrl)
    .videoCodec("copy")
    .noAudio()
    .setStartTime(startTime)
    .setDuration(duration)
    .toFormat("webm")
    .output(res, { end: true }) // Stream output to response
    .on("end", () => {
      res.end();
    })
    .on("error", (err) => {
      res.status(500).send(err.message);
      res.end();
    })
    .run();
});

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `👾 Express Server is running at http://localhost:${
      process.env.PORT || 3000
    }`
  );
});
