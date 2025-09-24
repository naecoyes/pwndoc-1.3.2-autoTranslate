const mongoose = require('mongoose');
const AIService = require('./src/lib/ai-service');
const Settings = require('./src/models/settings');

async function testAIStatus() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/pwndoc', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('Connected to MongoDB');
        
        // Get current settings
        const settings = await Settings.getPublic();
        console.log('Current settings:', JSON.stringify(settings.llm, null, 2));
        
        // Check AI service status
        const isEnabled = await AIService.isEnabled();
        console.log('AI Service enabled:', isEnabled);
        
        // Get AI service settings
        const aiSettings = await AIService.getSettings();
        console.log('AI Service settings:', JSON.stringify(aiSettings.llm, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testAIStatus();