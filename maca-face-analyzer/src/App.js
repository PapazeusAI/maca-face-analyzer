
import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function App() {
  const videoRef = useRef(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Gagal memuat model:", error);
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Gagal mengakses kamera:", error);
    }
  };

  const analyzeFace = async () => {
    if (!modelsLoaded) {
      alert("Model belum siap. Mohon tunggu sebentar dan coba lagi.");
      return;
    }
    if (!videoRef.current) return;

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (detection) {
      const expressions = detection.expressions;
      const dominantExpression = Object.entries(expressions).reduce((a, b) => (a[1] > b[1] ? a : b));

      let recommendation = "";
      if (dominantExpression[0] === "sad") {
        recommendation = "Maca Face: untuk mencerahkan kulit kusam.";
      } else if (dominantExpression[0] === "angry") {
        recommendation = "Maca Acne: membantu mengatasi jerawat akibat stres.";
      } else if (dominantExpression[0] === "surprised") {
        recommendation = "Maca Serum: menjaga kolagen untuk tampilan awet muda.";
      } else {
        recommendation = "Maca Facial Wash: menjaga kebersihan kulit harian Anda.";
      }

      setAnalysisResult({
        expression: dominantExpression[0],
        recommendation,
      });
    } else {
      setAnalysisResult({
        expression: "Tidak terdeteksi",
        recommendation: "Coba ulangi analisis dalam kondisi pencahayaan yang lebih baik.",
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Analisis Wajah & Produk MACA</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="100%"
        style={{ borderRadius: 10, marginBottom: 20 }}
      />
      <div style={{ marginBottom: 20 }}>
        <button onClick={startCamera} style={{ marginRight: 10 }}>Aktifkan Kamera</button>
        <button onClick={analyzeFace}>Analisa Wajah</button>
      </div>
      {analysisResult && (
        <div style={{ padding: 15, border: "1px solid #ccc", borderRadius: 10 }}>
          <p><strong>Ekspresi:</strong> {analysisResult.expression}</p>
          <p><strong>Rekomendasi:</strong> {analysisResult.recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
