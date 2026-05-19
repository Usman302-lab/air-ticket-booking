const AIService = require('../service/aiService');

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'message is required' });
        const response = await AIService.chatWithAssistant(message);
        res.status(200).json({ success: true, data: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'AI service unavailable' });
    }
};

const recommendations = async (req, res) => {
    try {
        const { destination, departureDate } = req.body;
        if (!destination) return res.status(400).json({ success: false, message: 'destination is required' });
        const response = await AIService.getTravelRecommendations(destination, departureDate || 'soon');
        res.status(200).json({ success: true, data: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'AI service unavailable' });
    }
};

const pricingInsight = async (req, res) => {
    try {
        const { flights } = req.body;
        if (!Array.isArray(flights)) return res.status(400).json({ success: false, message: 'flights array is required' });
        const response = await AIService.getPricingInsights(flights);
        res.status(200).json({ success: true, data: response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'AI service unavailable' });
    }
};

module.exports = { chat, recommendations, pricingInsight };
