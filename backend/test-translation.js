const mongoose = require('mongoose');
const AIService = require('./src/lib/ai-service');

async function testTranslation() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27017/pwndoc');
    console.log('Connected to MongoDB');

    // 刷新AI服务设置
    await AIService.refreshSettings();
    console.log('AI settings refreshed');

    // 检查AI服务状态
    const isEnabled = await AIService.isEnabled();
    console.log('AI Service enabled:', isEnabled);

    if (isEnabled) {
      // 测试翻译功能
      console.log('Testing translation...');
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

testTranslation();