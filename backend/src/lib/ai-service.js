const axios = require('axios');
const Settings = require('../models/settings');

class AIService {
    constructor() {
        this.settings = null;
    }

    async getSettings() {
        if (!this.settings) {
            this.settings = await Settings.getPublic();
        }
        return this.settings;
    }

    async refreshSettings() {
        this.settings = await Settings.getPublic();
    }

    async isEnabled() {
        const settings = await this.getSettings();
        return settings.llm && settings.llm.enabled;
    }

    async callOpenAI(messages, options = {}) {
        const settings = await this.getSettings();
        
        if (!settings.llm || !settings.llm.enabled) {
            throw new Error('LLM service is not enabled');
        }

        const llmConfig = settings.llm;
        const privateSettings = await Settings.findOne().select('llm.private');
        
        if (!privateSettings || !privateSettings.llm || !privateSettings.llm.private) {
            throw new Error('LLM private settings not found');
        }
        
        const apiEndpoint = privateSettings.llm.private.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
        
        // Skip API key check for local Ollama endpoints
        const isLocalOllama = apiEndpoint && (apiEndpoint.includes('localhost') || apiEndpoint.includes('127.0.0.1') || apiEndpoint.includes('11434'));
        if (!privateSettings.llm.private.apiKey && !isLocalOllama) {
            throw new Error('API key is not configured');
        }
        
        const requestData = {
            model: llmConfig.public.model || 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: options.maxTokens || llmConfig.public.maxTokens || 2000,
            temperature: options.temperature || llmConfig.public.temperature || 0.7,
            ...options
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        // Only add Authorization header if API key is provided (not for local Ollama)
        if (privateSettings.llm.private.apiKey) {
            headers['Authorization'] = `Bearer ${privateSettings.llm.private.apiKey}`;
        }

        if (privateSettings.llm.private.organizationId) {
            headers['OpenAI-Organization'] = privateSettings.llm.private.organizationId;
        }

        try {
            console.log(`Calling LLM API at ${apiEndpoint} with model ${requestData.model}`);
            const response = await axios.post(apiEndpoint, requestData, {
                headers: headers,
                timeout: 30000 // 30 seconds timeout
            });

            return response.data;
        } catch (error) {
            console.error('LLM API Error:', error.message);
            if (error.response) {
                throw new Error(`OpenAI API Error: ${error.response.status} - ${error.response.data.error?.message || 'Unknown error'}`);
            } else if (error.request) {
                throw new Error('Network error: Unable to reach OpenAI API');
            } else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }

    async completeVulnerabilityField(title, currentContent, fieldType, language = 'en') {
        if (!await this.isEnabled()) {
            throw new Error('AI service is not enabled');
        }

        const prompts = {
            description: {
                en: `You are a cybersecurity expert. Based on the vulnerability title "${title}", provide a detailed technical description of this vulnerability. Focus on:
- What the vulnerability is
- How it occurs
- Technical details about the flaw
- Potential attack vectors

Current content: ${currentContent || 'None'}

Provide only the description content, no additional formatting or explanations.`,
                zh: `你是网络安全专家。基于漏洞标题"${title}"，提供该漏洞的详细技术描述。重点包括：
- 漏洞是什么
- 如何发生的
- 缺陷的技术细节
- 潜在的攻击向量

当前内容：${currentContent || '无'}

只提供描述内容，不要额外的格式或解释。`
            },
            observation: {
                en: `You are a cybersecurity expert. Based on the vulnerability title "${title}", provide detailed observations about this vulnerability including:
- Evidence of the vulnerability
- How it was discovered
- Specific indicators or symptoms
- Technical proof or demonstration

Current content: ${currentContent || 'None'}

Provide only the observation content, no additional formatting or explanations.`,
                zh: `你是网络安全专家。基于漏洞标题"${title}"，提供关于该漏洞的详细观察，包括：
- 漏洞的证据
- 如何发现的
- 具体指标或症状
- 技术证明或演示

当前内容：${currentContent || '无'}

只提供观察内容，不要额外的格式或解释。`
            },
            remediation: {
                en: `You are a cybersecurity expert. Based on the vulnerability title "${title}", provide comprehensive remediation steps including:
- Immediate mitigation steps
- Long-term fixes
- Best practices to prevent recurrence
- Configuration recommendations

Current content: ${currentContent || 'None'}

Provide only the remediation content, no additional formatting or explanations.`,
                zh: `你是网络安全专家。基于漏洞标题"${title}"，提供全面的修复步骤，包括：
- 即时缓解措施
- 长期修复方案
- 防止再次发生的最佳实践
- 配置建议

当前内容：${currentContent || '无'}

只提供修复内容，不要额外的格式或解释。`
            }
        };

        const prompt = prompts[fieldType]?.[language] || prompts[fieldType]?.en;
        if (!prompt) {
            throw new Error(`Unsupported field type: ${fieldType}`);
        }

        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];

        const response = await this.callOpenAI(messages);
        return response.choices[0]?.message?.content || '';
    }

    async translateContent(content, targetLanguage = 'en') {
        if (!await this.isEnabled()) {
            throw new Error('AI service is not enabled');
        }

        const prompts = {
            en: `You are a cybersecurity expert translator. Translate ONLY the Chinese text in the following content to English while:
1. Preserving ALL HTML tags exactly as they are
2. Only translating Chinese characters to English
3. Using professional cybersecurity terminology
4. Keeping all English text unchanged
5. Maintaining the exact structure and formatting

Content to translate:
${content}

Provide only the translated content with preserved HTML tags, no additional explanations.`,
            zh: `你是网络安全专家翻译员。将以下内容中的英文翻译成中文，同时：
1. 完全保留所有HTML标签
2. 只翻译英文字符为中文
3. 使用专业的网络安全术语
4. 保持所有中文文本不变
5. 维持确切的结构和格式

要翻译的内容：
${content}

只提供保留HTML标签的翻译内容，不要额外的解释。`
        };

        const prompt = prompts[targetLanguage];
        if (!prompt) {
            throw new Error(`Unsupported target language: ${targetLanguage}`);
        }

        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];

        const response = await this.callOpenAI(messages);
        return response.choices[0]?.message?.content || '';
    }

    async translateAuditFindings(findings, targetLanguage = 'en') {
        if (!await this.isEnabled()) {
            throw new Error('AI service is not enabled');
        }

        const translatedFindings = [];
        
        for (const finding of findings) {
            const translatedFinding = { ...finding };
            
            // Translate specific fields
            const fieldsToTranslate = ['title', 'description', 'observation', 'remediation', 'poc'];
            
            for (const field of fieldsToTranslate) {
                if (finding[field] && typeof finding[field] === 'string' && finding[field].trim()) {
                    try {
                        translatedFinding[field] = await this.translateContent(finding[field], targetLanguage);
                        // Add small delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error(`Error translating field ${field}:`, error.message);
                        // Keep original content if translation fails
                        translatedFinding[field] = finding[field];
                    }
                }
            }
            
            translatedFindings.push(translatedFinding);
        }
        
        return translatedFindings;
    }
}

module.exports = new AIService();