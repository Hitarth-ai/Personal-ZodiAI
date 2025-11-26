// app/api/chat/tools/astrology.ts

import { tool } from "ai";
import { z } from "zod";

/**
 * Helper: get AstrologyAPI credentials from env
 */
function getAstrologyAuthHeader() {
  const userId = process.env.ASTROLOGY_USER_ID;
  const apiKey = process.env.ASTROLOGY_API_KEY;

  if (!userId || !apiKey) {
    throw new Error(
      "Astrology API credentials are missing. Set ASTROLOGY_USER_ID and ASTROLOGY_API_KEY in your env."
    );
  }

  const base64 = Buffer.from(`${userId}:${apiKey}`, "utf-8").toString("base64");
  return `Basic ${base64}`;
}

/**
 * Helper: call AstrologyAPI JSON endpoints
 */
async function callAstrologyApi(endpoint: string, body: any) {
  const authHeader = getAstrologyAuthHeader();

  const res = await fetch(`https://json.astrologyapi.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      authorization: authHeader,
      "Content-Type": "application/json",
      "Accept-Language": "en",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `AstrologyAPI ${endpoint} failed with ${res.status}: ${text || "No body"}`
    );
  }

  return res.json();
}

/**
 * Helper: lookup lat/lon using OpenStreetMap Nominatim
 * (we completely bypass AstrologyAPI geo_details now)
 */
async function geocodePlace(place: string) {
  const query = place.trim();

  // Basic sanity check
  if (!query) {
    throw new Error("Empty place string");
  }

  // 1) Try Nominatim (OpenStreetMap)
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "ZodiAI-StudentProject/1.0 (contact: your-email@example.com)",
      Accept: "application/json",
    },
  });

  if (res.ok) {
    const data: any[] = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const best = data[0];

      const lat = parseFloat(best.lat);
      const lon = parseFloat(best.lon);

      // If result is in India → assume IST (+5.5)
      const countryCode = best.address?.country_code?.toLowerCase();
      const timezoneId =
        countryCode === "in" ? "Asia/Kolkata" : "UTC";
      const tzone = countryCode === "in" ? 5.5 : 0;

      return {
        lat,
        lon,
        timezoneId,
        tzone,
        resolvedPlace: best.display_name as string,
      };
    }
  }

  // 2) Fallback: some hard-coded Indian cities
  const lower = query.toLowerCase();

  const fallbackTable: Record<
    string,
    { lat: number; lon: number; timezoneId: string; tzone: number }
  > = {
    mumbai: {
      lat: 19.076,
      lon: 72.8777,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    "mumbai, india": {
      lat: 19.076,
      lon: 72.8777,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    junagadh: {
      lat: 21.5167,
      lon: 70.4667,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    "junagadh, india": {
      lat: 21.5167,
      lon: 70.4667,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    delhi: {
      lat: 28.6139,
      lon: 77.209,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    "new delhi": {
      lat: 28.6139,
      lon: 77.209,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    bangalore: {
      lat: 12.9716,
      lon: 77.5946,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    bengaluru: {
      lat: 12.9716,
      lon: 77.5946,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
    ahmedabad: {
      lat: 23.0225,
      lon: 72.5714,
      timezoneId: "Asia/Kolkata",
      tzone: 5.5,
    },
  };

  const fb = fallbackTable[lower];
  if (fb) {
    return {
      lat: fb.lat,
      lon: fb.lon,
      timezoneId: fb.timezoneId,
      tzone: fb.tzone,
      resolvedPlace: query,
    };
  }

  // If nothing works, throw a clear error – the model will surface this nicely
  throw new Error(`Could not resolve location for "${query}"`);
}

/**
 * ZodiAI Astrology Tool
 * - Takes basic birth details + place
 * - Resolves place → lat/lon/timezone
 * - Calls AstrologyAPI astro_details
 */
export const astrologyTool = tool({
  description:
    "Look up Vedic astrology information (like birth chart basics) using birth details and place of birth.",

  parameters: z.object({
    name: z
      .string()
      .describe("User's first name to personalise the reading."),
    day: z
      .number()
      .int()
      .min(1)
      .max(31)
      .describe("Day of birth, e.g., 6"),
    month: z
      .number()
      .int()
      .min(1)
      .max(12)
      .describe("Month of birth, 1-12"),
    year: z
      .number()
      .int()
      .min(1900)
      .max(2100)
      .describe("Year of birth, e.g., 2000"),
    hour: z
      .number()
      .int()
      .min(0)
      .max(23)
      .describe("Hour of birth in 24h format."),
    minute: z
      .number()
      .int()
      .min(0)
      .max(59)
      .describe("Minute of birth."),
    place: z
      .string()
      .describe(
        "Place of birth (city + country if possible, e.g., 'Junagadh, India' or 'Mumbai, India')."
      ),
    queryType: z
      .enum(["birth_chart", "basic_traits"])
      .default("birth_chart")
      .describe(
        "Type of astrology query. 'birth_chart' for chart + traits, 'basic_traits' for a lighter personality reading."
      ),
  }),

  /**
   * The AI SDK will call this when the model chooses this tool.
   */
  execute: async (input) => {
    const { name, day, month, year, hour, minute, place, queryType } = input;

    // 1) Resolve location → lat/lon/timezone
    let geo;
    try {
      geo = await geocodePlace(place);
    } catch (err: any) {
      // We return an error object; the model will convert this into a nice explanation for the user.
      return {
        type: "astrology_error",
        message: `I couldn't resolve the place of birth "${place}". Technical reason: ${
          err?.message || "unknown"
        }. Ask the user to try another nearby city or include country name.`,
      };
    }

    const { lat, lon, tzone, timezoneId, resolvedPlace } = geo;

    // 2) Call Vedic "astro_details" for basic birth chart traits
    let astroData: any;
    try {
      astroData = await callAstrologyApi("astro_details", {
        day,
        month,
        year,
        hour,
        min: minute,
        lat,
        lon,
        tzone,
      });
    } catch (err: any) {
      return {
        type: "astrology_error",
        message: `Astrology API failed while generating your chart. Reason: ${
          err?.message || "unknown"
        }`,
      };
    }

    // 3) Shape the response for the model
    if (queryType === "basic_traits") {
      return {
        type: "basic_traits",
        name,
        place: resolvedPlace,
        timezoneId,
        tzone,
        lat,
        lon,
        rawAstroDetails: astroData,
      };
    }

    // Default: full birth_chart-style payload (model will translate into user-friendly text)
    return {
      type: "birth_chart",
      name,
      place: resolvedPlace,
      timezoneId,
      tzone,
      lat,
      lon,
      rawAstroDetails: astroData,
    };
  },
});
