require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const chatWithAssistant = async (message) => {
    const prompt = `You are a helpful flight booking assistant. The user says: "${message}".

If the user is searching for a flight (mentions cities, airports, or travel intent), respond ONLY with this JSON:
{ "type": "search_intent", "data": { "departureAirport": "city name", "arrivalAirport": "city name", "date": "YYYY-MM-DD or empty string", "maxPrice": null } }

If it is a general travel question, respond ONLY with this JSON:
{ "type": "answer", "data": "your helpful answer here" }

Respond only with valid JSON. No markdown fences, no extra text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(text);
};

const getTravelRecommendations = async (destination, departureDate) => {
    const prompt = `Provide brief travel recommendations for a trip to ${destination} departing ${departureDate}.
Respond ONLY with valid JSON, no markdown fences:
{
  "weather": "one sentence weather description",
  "visa": "one sentence visa requirement summary",
  "packing": ["item1", "item2", "item3", "item4", "item5"],
  "hotelAreas": ["area1", "area2", "area3"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(text);
};

const getPricingInsights = async (flights) => {
    if (!flights || flights.length === 0) return { insights: [] };

    const flightList = flights.map(f => `ID:${f.flightId} | $${f.price} | ${f.route}`).join('\n');

    const prompt = `Analyze these flight prices and give a buying verdict for each.
Flights:
${flightList}

Respond ONLY with valid JSON, no markdown fences:
{
  "insights": [
    { "flightId": "exact ID from above", "verdict": "Book Now", "reason": "one sentence reason" }
  ]
}
Verdict must be exactly one of: "Book Now", "Good Deal", "Wait if Flexible"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\s*|\s*```$/g, '');
    return JSON.parse(text);
};

module.exports = { chatWithAssistant, getTravelRecommendations, getPricingInsights };
