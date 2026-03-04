const { ipcRenderer } = require("electron");
const axios = require("axios");

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let currentImagePath = null;
let detections = [];
let confidenceThreshold = 0.5;

const importBtn = document.getElementById("importBtn");
const replaceBtn = document.getElementById("replaceBtn");
const exportBtn = document.getElementById("exportBtn");
const slider = document.getElementById("confidenceSlider");

importBtn.onclick = async () => {
  const filePath = await ipcRenderer.invoke("select-image");
  if (!filePath) return;
  currentImagePath = filePath;
  loadImage(filePath);
};

replaceBtn.onclick = async () => {
  const filePath = await ipcRenderer.invoke("select-image");
  if (!filePath) return;
  currentImagePath = filePath;
  loadImage(filePath);
};

slider.oninput = () => {
  confidenceThreshold = parseFloat(slider.value);
  drawDetections();
};

exportBtn.onclick = async () => {
  const dataUrl = canvas.toDataURL("image/png");
  await ipcRenderer.invoke("save-image", dataUrl);
};

function loadImage(filePath) {
  img.src = filePath;
  img.onload = async () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    await scanImage(filePath);
  };
}

async function scanImage(filePath) {
  const fs = require("fs");
  const imageBase64 = fs.readFileSync(filePath, { encoding: "base64" });

  try {
    const response = await axios({
      method: "POST",
      url: "https://serverless.roboflow.com/malignant-nodules-cegoe-6fl0i/5",
      params: { api_key: "GuDmYcrewviLBtZqZddr" },
      data: imageBase64,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    detections = response.data.predictions || [];
    drawDetections();
  } catch (err) {
    console.error(err);
  }
}

function drawDetections() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  detections.forEach(pred => {
    if (pred.confidence >= confidenceThreshold) {
      ctx.fillStyle = "rgba(255,0,0,0.3)";
      ctx.fillRect(pred.x, pred.y, pred.width, pred.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(pred.x, pred.y, pred.width, pred.height);
    }
  });
}
