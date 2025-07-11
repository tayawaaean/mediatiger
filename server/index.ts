import express, { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("Loaded ENV:", process.env); // Debug env variables

const app = express();
app.use(express.json());

interface MusicItem {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  favorite: boolean;
  category: string[];
  music: string;
}

interface ApiResponse {
  success: boolean;
  response_code?: number;
  datas: any[];
  page_data: { next: string[] };
  message?: string;
}

app.use((req: Request, res: Response, next) => {
  console.log(`Incoming request: ${req.method} ${req.url} from ${req.ip}`);
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    console.log("OPTIONS request handled");
    res.status(200).end();
    return;
  }
  next();
});

app.post("/api/music", async (req: Request, res: Response) => {
  console.log("Received POST request at /api/music", req.body);
  if (!process.env.PLAYIST_API_KEY || !process.env.PLAYIST_API_URL) {
    console.log("Missing env variables:", {
      PLAYIST_API_KEY: process.env.PLAYIST_API_KEY,
      PLAYIST_API_URL: process.env.PLAYIST_API_URL,
    });
    res
      .status(500)
      .json({ error: "Missing API key or URL in environment variables" });
    return;
  }

  try {
    const { page = 1, size = 15 } = req.body || {};

    console.log(
      `Calling Playist API: ${process.env.PLAYIST_API_URL} with page=${page}, size=${size}`
    );
    const response = await axios.get<ApiResponse>(
      process.env.PLAYIST_API_URL ||
        "https://api.playist.studio/public/v1/music/list",
      {
        headers: {
          "ZS-API-Auth": process.env.PLAYIST_API_KEY,
          "Accept-Language": "en",
        },
        params: {
          page,
          size,
        },
      }
    );

    console.log("Playist API response:", response.data);
    if (response.data.success && response.data.response_code === 0) {
      const tracks: MusicItem[] = response.data.datas.map((item: any) => ({
        id: item.isrc,
        title: item.name,
        artist: item.artist,
        cover: item.thumbnail || "https://via.placeholder.com/100",
        duration: "0:00",
        favorite: false,
        category: item.tags
          ? item.tags.map((tag: any) => tag.name.toLowerCase())
          : [],
        music: item.music || "",
      }));

      res.status(200).json({
        success: true,
        tracks,
        hasMore: response.data.page_data.next.length > 0,
      });
    } else {
      res.status(400).json({
        error: response.data.message || "Failed to fetch music tracks",
      });
    }
  } catch (error) {
    console.error("Error fetching music:", error);
    let message = "Failed to fetch music from API";
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      message = "Rate limit exceeded. Please try again later.";
    } else if (axios.isAxiosError(error) && error.response?.status === 403) {
      message = "Access denied. Check IP whitelisting.";
    } else if (axios.isAxiosError(error)) {
      message = `API error: ${error.response?.status} - ${error.message}`;
    }
    res.status(500).json({ error: message });
  }
});

const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
