const express = require("express");
const fs = require("fs");
const ytdl = require("ytdl-core");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000; 

app.disabled("x-powered-by");
app.use(cors());
app.use(express.json());

app.post("/convert-url", async (req, res) => {
  const { videoUrl } = req.body;
  const outputFormat = "mp3";

  if (!videoUrl) {
    return res.status(400).json({
      message: "No se proporcionó una URL de video válida.",
    });
  }

  try {
    
    if (!ytdl.validateURL(videoUrl)) {
      return res.status(400).json({
        message: "La URL del video no es válida.",
      });
    }

    const video = ytdl(videoUrl, {
      filter: "audioonly",
      quality: "lowestaudio",
    });

    const outputPath = `public/temp_input_${Date.now()}.${outputFormat}`;
    const videoConverter = video.pipe(fs.createWriteStream(outputPath));

    videoConverter.on("finish", () => {                  
      
      res.download(outputPath, `audio.${outputFormat}`, (err) => {
        if (err) {
          console.error("Error al descargar el archivo:", err);
          return res.status(500).json({ message: "Error al descargar el archivo." });
        } else {
          
          fs.unlinkSync(outputPath);
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al procesar la URL del video." });
  }
});

app.listen(port, () => {
  console.log(`El servidor está escuchando en el puerto ${port}`);
});
