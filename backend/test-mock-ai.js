const mongoose = require('mongoose');
const AIService = require('./src/lib/ai-service');

// Mock the callOpenAI method to simulate successful translation
const originalCallOpenAI = AIService.callOpenAI;
AIService.callOpenAI = async function(messages, options = {}) {
    console.log('Mock AI called with messages:', messages);
    
    // Simulate a translation response
    const userMessage = messages.find(msg => msg.role === 'user');
    if (userMessage && userMessage.content.includes('翻译')) {
        return {
            choices: [{
                message: {
                    content: '这是一个测试漏洞描述。'
                }
            }]
        };
    }
    
    // Default response for other requests
    return {
        choices: [{
            message: {
                content: 'Mock AI response'
            }
        }]
    };
};

async function testMockTranslation() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27016/pwndoc');
    console.log('Connected to MongoDB');

    // 刷新AI服务设置
    await AIService.refreshSettings();
    console.log('AI settings refreshed');

    // 检查AI服务状态
    const isEnabled = await AIService.isEnabled();
    console.log('AI Service enabled:', isEnabled);

    if (isEnabled) {
      // 测试翻译功能
      console.log('Testing translation with mock AI...');
      const testText = 'This is a test vulnerability description.';
      const translatedText = await AIService.translateContent(testText, 'zh');
      console.log('Original:', testText);
      console.log('Translated:', translatedText);
    } else {
      console.log('AI service is not enabled');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testMockTranslation();