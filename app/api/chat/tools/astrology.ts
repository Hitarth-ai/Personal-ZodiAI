import { tool } from "ai";
import { z } from "zod";

// Make sure you have these in your .env / Vercel env
const ASTROLOGY_USER_ID = process.env.ASTROLOGY_USER_ID!;
const ASTROLOGY_API_KEY = process.env.ASTROLOGY_API_KEY!;

const ASTROLOGY_BASE_URL = "https://json.astrologyapi.com/v1";

/**
 * Helper to call AstrologyAPI with Basic Auth.
 */
async function callAstrologyApi(
  endpoint: string,
  payload: Record<string, unknown>
) {
  const authHeader =
    "Basic " +
    Buffer.from(`${ASTROLOGY_USER_ID}:${ASTROLOGY_API_KEY}`).toString("base64");

  const res = await fetch(`${ASTROLOGY_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AstrologyAPI error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * Geo lookup using AstrologyAPI's geo_details.
 * Input: user-typed place like "Mumbai" or "Junagadh, Gujarat, India"
 */
async function lookupGeo(place: string) {
  const authHeader =
    "Basic " +
    Buffer.from(`${ASTROLOGY_USER_ID}:${ASTROLOGY_API_KEY}`).toString("base64");

  const res = await fetch(
    `https://json.astrologyapi.com/v1/geo_details?place=${encodeURIComponent(
      place
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Geo details error ${res.status}: ${text}`);
  }

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `I couldn't find any location for "${place}". Try 'Mumbai, India' or another nearby city.`
    );
  }

  const best = data[0];
  return {
    lat: best.latitude,
    lon: best.longitude,
    timezone: best.timezone_id,
  };
}

/**
 * The actual AI tool definition.
 * NOTE: tool() gets a SINGLE object with inputSchema + execute.
 */
export const astrologyTool = tool({
  description:
    "Look up Vedic astrology details (birth chart or daily prediction) using AstrologyAPI based on the user's birth details.",
  // SCHEMA the model will use to supply arguments:
  inputSchema: z.object({
    name: z.string().describe("User's name."),
    day: z
      .number()
      .int()
      .min(1)
      .max(31)
      .describe("Day of birth (1–31)."),
    month: z
      .number()
      .int()
      .min(1)
      .max(12)
      .describe("Month of birth (1–12)."),
    year: z
      .number()
      .int()
      .min(1900)
      .max(2100)
      .describe("Year of birth."),
    hour: z
      .number()
      .int()
      .min(0)
      .max(23)
      .describe("Hour of birth in 24h format (0–23)."),
    minute: z
      .number()
      .int()
      .min(0)
      .max(59)
      .describe("Minute of birth (0–59)."),
    place: z
      .string()
      .describe(
        "Birth place, ideally 'City, State, Country' (e.g. 'Junagadh, Gujarat, India' or 'Mumbai, India')."
      ),
    queryType: z
      .enum(["birth_chart", "daily_prediction"])
      .describe(
        "What the user wants: 'birth_chart' for natal chart, 'daily_prediction' for today's prediction."
      ),
  }),

  // IMPORTANT: execute lives inside this same object – NOT as a separate argument.
  async execute(input) {
    const { name, day, month, year, hour, minute, place, queryType } = input;

    // 1) GEO LOOKUP: lat, lon, timezone
    const { lat, lon, timezone } = await lookupGeo(place);

    // 2) Common birth_details payload
    const birthDetails = {
      day,
      month,
      year,
      hour,
      min: minute,
      lat,
      lon,
      tzone: 0, // AstrologyAPI still wants this, but we can keep it 0 when using timezone_id endpoints
    };

    if (queryType === "birth_chart") {
      // You can swap "horo_chart/1" with other chartId endpoints
      const rawBirth = await callAstrologyApi("astro_details", birthDetails);

      return {
        type: "birth_chart",
        name,
        location: place,
        timezone,
        rawBirth,
      };
    }

    if (queryType === "daily_prediction") {
      const today = new Date();
      const payload = {
        ...birthDetails,
        timezone,
        date: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
      };

      const rawPrediction = await callAstrologyApi(
        "daily_nakshatra_prediction",
        payload
      );

      return {
        type: "daily_prediction",
        name,
        location: place,
        timezone,
        rawPrediction,
      };
    }

    // Fallback – should never hit because queryType is enum:
    return {
      type: "error",
      message:
        "I couldn't understand what you wanted (birth_chart vs daily_prediction).",
    };
  },
});
