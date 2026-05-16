import express from "express";
import cors from "cors";
import { analyzeRequestHandler } from "./routes/analyzeRequest.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/analyze-request", analyzeRequestHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
