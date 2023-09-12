import express from "express";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("video trimming Express server running!");
});

// This API send back the file in binary (for now)
app.post("/trim", (req, res) => {
  const { videoUrl, startTime, duration } = req.body;

  res.setHeader("Content-disposition", "attachment; filename=output.webm");
  res.setHeader("Content-type", "video/webm");

  const ffmpegInstance = new ffmpeg(videoUrl);

  ffmpegInstance
    .toFormat("webm")
    .noAudio()
    // .videoCodec("copy")  // Using "copy" here results in in-accurate processing
    .output(res, { end: true }) // Stream output to response
    .setStartTime(startTime)
    .setDuration(duration)
    .on("end", () => {
      res.end();
    })
    .on("error", (err) => {
      res.status(500).send(err.message);
      res.end();
    })
    .run();
});

// This API saves the trimmed video files in the root directory (for now; only works locally since no storage permission on server)
app.post("/multi-trim", (req, res) => {
  const { videoUrl, steps } = req.body;

  try {
    steps?.forEach(({ stepId, startTime, duration }) => {
      const startedAt = new Date().getTime();
      const ffmpegInstance = new ffmpeg(videoUrl);

      ffmpegInstance
        .toFormat("webm")
        .noAudio()
        // .videoCodec("copy")  // Using "copy" here results in in-accurate processing
        .output(`${stepId}.webm`)
        .setStartTime(startTime)
        .setDuration(duration)
        .on("end", () =>
          console.log(
            `${stepId} step video processed!`,
            new Date().getTime() - startedAt
          )
        )
        .on("error", (err) => {
          console.error(`Error processing ${stepId}: ${err.message}`);
          throw err;
        })
        .run();
    });
    res.status(201).send("Video Processing finished!");
  } catch (err) {
    res.status(500).send("Error Occured: ", err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `👾 Express Server is running at http://localhost:${
      process.env.PORT || 3000
    }`
  );
});
