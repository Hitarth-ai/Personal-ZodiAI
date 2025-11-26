// app/api/chat/tools/astrology.ts
import { tool } from 'ai';
import { z } from 'zod';

/**
 * ZodiAI Astrology Tool
 * The model will call this when it needs a Vedic astrology prediction.
 */
export const astrologyTool = tool(
  {
    description:
      'Call the Indian Astrology API to generate a slightly ominous but still friendly prediction for the user based on their birth details and question.',
    // NOTE: keep the name `inputSchema` (or `parameters`) the same as in web-search.ts
    inputSchema: z.object({
      name: z.string().describe('Full name of the user'),
      day: z.number().int().min(1).max(31).describe('Day of birth'),
      month: z.number().int().min(1).max(12).describe('Month of birth'),
      year: z.number().int().min(1900).max(2100).describe('Year of birth'),
      hour: z
        .number()
        .int()
        .min(0)
        .max(23)
        .describe('Hour of birth in 24-hour format'),
      minute: z
        .number()
        .int()
        .min(0)
        .max(59)
        .describe('Minute of birth'),

      // For now we let the model pass a city string; you can later add lat/lon
      place: z
        .string()
        .describe('Birth place / city as text. Do NOT include country code.'),

      // What kind of prediction they want
      queryType: z
        .enum(['daily_horoscope', 'love', 'career', 'health', 'general'])
        .describe('Type of question the user is asking.'),
    }),
  },

  // 👇 SECOND ARGUMENT = the execute function
  async (input) => {
    const {
      name,
      day,
      month,
      year,
      hour,
      minute,
      place,
      queryType,
    } = input;

    // Read your AstrologyAPI credentials from environment variables
    // Set these in Vercel as:
    // ASTROLOGY_API_USER_ID = 647810
    // ASTROLOGY_API_KEY    = your test API key (do NOT hardcode in Git)
    const userId = process.env.ASTROLOGY_API_USER_ID;
    const apiKey = process.env.ASTROLOGY_API_KEY;

    if (!userId || !apiKey) {
      // This result will be shown in the Tool UI if something is misconfigured
      return {
        type: 'error',
        message:
          'Astrology API credentials are missing. Please set ASTROLOGY_API_USER_ID and ASTROLOGY_API_KEY in environment variables.',
      };
    }

    // Build Basic Auth header
    const authHeader =
      'Basic ' + Buffer.from(`${userId}:${apiKey}`).toString('base64');

    // CHOOSE an AstrologyAPI endpoint you like; example:
    // - /v1/vedic/astro_details
    // - /v1/vedic/daily_predictions
    //
    // Here I’ll assume something like a generic “basic horoscope” endpoint.
    // You can swap the URL with the exact one from their docs.
    const endpoint = 'https://json.astrologyapi.com/v1/basic_horoscope';

    // AstrologyAPI expects x-www-form-urlencoded body
    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('day', day.toString());
    formData.append('month', month.toString());
    formData.append('year', year.toString());
    formData.append('hour', hour.toString());
    formData.append('min', minute.toString());
    formData.append('place', place);
    formData.append('question_type', queryType);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return {
          type: 'error',
          message: `Astrology API error: ${res.status} ${res.statusText} – ${text}`,
        };
      }

      const data = (await res.json()) as any;

      // Shape this for the model: slightly spooky but not terrifying.
      const rawPrediction =
        data?.prediction ||
        data?.summary ||
        data?.message ||
        JSON.stringify(data);

      return {
        type: 'success',
        name,
        location: place,
        timezone: data?.timezone || 'unknown',
        rawBirth: {
          day,
          month,
          year,
          hour,
          minute,
          place,
        },
        rawPrediction,
      };
    } catch (err: any) {
      return {
        type: 'error',
        message: `Failed to call Astrology API: ${err?.message ?? String(err)}`,
      };
    }
  }
);
