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

    // 检测API提供商类型
    detectApiProvider(apiEndpoint) {
        if (!apiEndpoint) return 'openai';
        
        const endpoint = apiEndpoint.toLowerCase();
        
        if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1') || endpoint.includes('11434')) {
            return 'ollama';
        } else if (endpoint.includes('modelscope.cn') || endpoint.includes('dashscope.aliyuncs.com')) {
            return 'modelscope';
        } else if (endpoint.includes('openai.com')) {
            return 'openai';
        } else if (endpoint.includes('api.deepseek.com')) {
            return 'deepseek';
        } else if (endpoint.includes('api.anthropic.com')) {
            return 'anthropic';
        } else if (endpoint.includes('api.groq.com')) {
            return 'groq';
        } else if (endpoint.includes('api.together.xyz')) {
            return 'together';
        }
        
        // 默认按OpenAI格式处理
        return 'openai';
    }

    // 获取推荐的API端点
    getRecommendedEndpoint(provider) {
        const endpoints = {
            'openai': 'https://api.openai.com/v1/chat/completions',
            'modelscope': 'https://api-inference.modelscope.cn/v1/chat/completions',
            'ollama': 'http://localhost:11434/v1/chat/completions',
            'deepseek': 'https://api.deepseek.com/v1/chat/completions',
            'anthropic': 'https://api.anthropic.com/v1/messages',
            'groq': 'https://api.groq.com/openai/v1/chat/completions',
            'together': 'https://api.together.xyz/v1/chat/completions'
        };
        
        return endpoints[provider] || endpoints['openai'];
    }

    // 获取推荐的默认模型
    getRecommendedModel(provider) {
        const models = {
            'openai': 'gpt-3.5-turbo',
            'modelscope': 'Qwen/Qwen2.5-Coder-32B-Instruct',
            'ollama': 'llama2',
            'deepseek': 'deepseek-chat',
            'anthropic': 'claude-3-sonnet-20240229',
            'groq': 'llama2-70b-4096',
            'together': 'meta-llama/Llama-2-7b-chat-hf'
        };
        
        return models[provider] || models['openai'];
    }

    // 根据API提供商调整请求参数
    adjustRequestForProvider(requestData, provider) {
        const adjusted = { ...requestData };
        
        switch (provider) {
            case 'ollama':
                // Ollama特定调整
                if (!adjusted.model) {
                    adjusted.model = this.getRecommendedModel('ollama');
                }
                // Ollama可能不支持某些参数，移除不兼容的参数
                if (adjusted.max_tokens) {
                    // Ollama使用num_predict而不是max_tokens
                    adjusted.options = adjusted.options || {};
                    adjusted.options.num_predict = adjusted.max_tokens;
                    delete adjusted.max_tokens;
                }
                break;
            case 'modelscope':
                // ModelScope特定调整
                // 确保模型名称格式正确
                if (!adjusted.model || adjusted.model === 'gpt-3.5-turbo') {
                    adjusted.model = this.getRecommendedModel('modelscope');
                } else if (adjusted.model && !adjusted.model.includes('/')) {
                    // 如果没有指定命名空间，使用默认的Qwen模型
                    adjusted.model = 'Qwen/Qwen2.5-Coder-32B-Instruct';
                }
                break;
            case 'deepseek':
                // DeepSeek特定调整
                if (!adjusted.model || adjusted.model === 'gpt-3.5-turbo') {
                    adjusted.model = this.getRecommendedModel('deepseek');
                }
                break;
            case 'anthropic':
                // Anthropic Claude特定调整
                if (!adjusted.model || adjusted.model === 'gpt-3.5-turbo') {
                    adjusted.model = this.getRecommendedModel('anthropic');
                }
                // Claude使用max_tokens而不是max_tokens
                break;
            case 'groq':
                // Groq特定调整
                if (!adjusted.model || adjusted.model === 'gpt-3.5-turbo') {
                    adjusted.model = this.getRecommendedModel('groq');
                }
                break;
            case 'together':
                // Together AI特定调整
                if (!adjusted.model || adjusted.model === 'gpt-3.5-turbo') {
                    adjusted.model = this.getRecommendedModel('together');
                }
                break;
            case 'openai':
            default:
                // OpenAI格式，无需特殊调整
                if (!adjusted.model) {
                    adjusted.model = this.getRecommendedModel('openai');
                }
                break;
        }
        
        return adjusted;
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
        
        // 智能端点配置和修复
        let apiEndpoint = privateSettings.llm.private.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
        
        // 自动修复常见的端点配置错误
        if (apiEndpoint.includes('api-inference.modelscope.cn/v1/') && !apiEndpoint.includes('/chat/completions')) {
            apiEndpoint = 'https://api-inference.modelscope.cn/v1/chat/completions';
        }
        
        // 检测API提供商类型
        const provider = this.detectApiProvider(apiEndpoint);
        const isLocalOllama = provider === 'ollama';
        
        // API密钥验证
        if (!privateSettings.llm.private.apiKey && !isLocalOllama) {
            throw new Error(`API key is required for ${provider} provider`);
        }
        
        // 构建请求数据
        let requestData = {
            model: llmConfig.public.model || (provider === 'ollama' ? 'llama2' : 'gpt-3.5-turbo'),
            messages: messages,
            max_tokens: options.maxTokens || llmConfig.public.maxTokens || 2000,
            temperature: options.temperature || llmConfig.public.temperature || 0.7,
            ...options
        };

        // 根据提供商调整请求参数
        requestData = this.adjustRequestForProvider(requestData, provider);

        const headers = {
            'Content-Type': 'application/json'
        };

        // 根据不同提供商设置认证头
        if (privateSettings.llm.private.apiKey) {
            switch (provider) {
                case 'openai':
                    headers['Authorization'] = `Bearer ${privateSettings.llm.private.apiKey}`;
                    if (privateSettings.llm.private.organizationId) {
                        headers['OpenAI-Organization'] = privateSettings.llm.private.organizationId;
                    }
                    break;
                case 'modelscope':
                    headers['Authorization'] = `Bearer ${privateSettings.llm.private.apiKey}`;
                    break;
                case 'deepseek':
                    headers['Authorization'] = `Bearer ${privateSettings.llm.private.apiKey}`;
                    break;
                case 'anthropic':
                    headers['x-api-key'] = privateSettings.llm.private.apiKey;
                    headers['anthropic-version'] = '2023-06-01';
                    break;
                default:
                    headers['Authorization'] = `Bearer ${privateSettings.llm.private.apiKey}`;
                    break;
            }
        }

        try {
            console.log(`Calling ${provider.toUpperCase()} API at ${apiEndpoint} with model ${requestData.model}`);
            const response = await axios.post(apiEndpoint, requestData, {
                headers: headers,
                timeout: 30000 // 30 seconds timeout
            });

            return response.data;
        } catch (error) {
            console.error(`${provider.toUpperCase()} API Error:`, error.message);
            
            // 增强错误处理
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                let errorMessage = `${provider.toUpperCase()} API Error: ${status}`;
                
                // 根据不同提供商解析错误信息
                if (errorData) {
                    if (errorData.error?.message) {
                        errorMessage += ` - ${errorData.error.message}`;
                    } else if (errorData.message) {
                        errorMessage += ` - ${errorData.message}`;
                    } else if (typeof errorData === 'string') {
                        errorMessage += ` - ${errorData}`;
                    } else {
                        errorMessage += ' - Unknown error';
                    }
                }
                
                throw new Error(errorMessage);
            } else if (error.request) {
                throw new Error(`Network error: Unable to reach ${provider.toUpperCase()} API at ${apiEndpoint}`);
            } else {
                throw new Error(`Request error: ${error.message}`);
            }
        }
    }

    async completeVulnerabilityField(title, currentContent, fieldType, language = 'en', proofs = '') {
        if (!await this.isEnabled()) {
            throw new Error('AI service is not enabled');
        }

        // 检测语言：如果title或proofs包含中文字符，自动使用中文
        const containsChinese = /[\u4e00-\u9fff]/.test(title + proofs);
        const targetLanguage = containsChinese ? 'zh' : language;

        const prompts = {
            description: {
                en: `You are a cybersecurity expert. Analyze the vulnerability "${title}"${proofs ? ` with the following proof of concept evidence:\n\n${proofs}\n\n` : ' '}and provide a comprehensive technical description.

${proofs ? 'Based on the specific proof of concept provided above, ' : ''}focus on:
- What the vulnerability is and its classification
- Root cause analysis of how it occurs
- Technical details about the underlying flaw
- Attack vectors and exploitation methods${proofs ? '\n- Direct analysis of the provided proof of concept' : ''}
- Security implications and potential impact

${proofs ? 'Ensure your description directly references and explains the proof of concept evidence provided. ' : ''}Keep the response professional and detailed but concise (2-4 paragraphs). Use precise technical terminology.

Current content: ${currentContent || 'None'}

Provide only the description content, no additional formatting or explanations.`,
                zh: `你是网络安全专家。分析漏洞"${title}"${proofs ? `，结合以下概念验证证据：\n\n${proofs}\n\n` : '，'}提供全面的技术描述。

${proofs ? '基于上述提供的具体概念验证，' : ''}重点包括：
- 漏洞是什么及其分类
- 发生原因的根本分析
- 底层缺陷的技术细节
- 攻击向量和利用方法${proofs ? '\n- 对提供的概念验证的直接分析' : ''}
- 安全影响和潜在后果

${proofs ? '确保你的描述直接引用并解释提供的概念验证证据。' : ''}保持回复专业且详细但简洁（2-4段）。使用精确的技术术语。

当前内容：${currentContent || '无'}

只提供描述内容，不要额外的格式或解释。`
            },
            observation: {
                en: `You are a cybersecurity expert conducting a security assessment. Based on the vulnerability "${title}"${proofs ? ` and the following proof of concept:\n\n${proofs}\n\n` : ' '}provide detailed technical observations.

${proofs ? 'Analyze the specific proof of concept provided and ' : ''}include:
- Concrete evidence of the vulnerability's existence
- Step-by-step analysis of the exploitation process${proofs ? '\n- Detailed breakdown of the provided proof of concept' : ''}
- Observable symptoms and indicators
- Technical artifacts and traces left by the vulnerability
- Verification methods and testing results
- Impact assessment based on observed behavior

${proofs ? 'Your observations should directly correlate with and explain the proof of concept evidence. ' : ''}Be specific and technical in your analysis (2-4 paragraphs).

Current content: ${currentContent || 'None'}

Provide only the observation content, no additional formatting or explanations.`,
                zh: `你是进行安全评估的网络安全专家。基于漏洞"${title}"${proofs ? `和以下概念验证：\n\n${proofs}\n\n` : '，'}提供详细的技术观察。

${proofs ? '分析提供的具体概念验证并' : ''}包括：
- 漏洞存在的具体证据
- 利用过程的逐步分析${proofs ? '\n- 对提供的概念验证的详细分解' : ''}
- 可观察的症状和指标
- 技术痕迹和漏洞留下的证据
- 验证方法和测试结果
- 基于观察行为的影响评估

${proofs ? '你的观察应该直接关联并解释概念验证证据。' : ''}在分析中要具体和技术性（2-4段）。

当前内容：${currentContent || '无'}

只提供观察内容，不要额外的格式或解释。`
            },
            remediation: {
                en: `You are a cybersecurity expert providing remediation guidance. Based on the vulnerability "${title}"${proofs ? ` and the following proof of concept:\n\n${proofs}\n\n` : ' '}provide comprehensive remediation strategies.

${proofs ? 'Considering the specific attack method demonstrated in the proof of concept, ' : ''}provide:
- Immediate containment and mitigation steps
- Root cause remediation and permanent fixes
- Security controls to prevent similar vulnerabilities${proofs ? '\n- Specific countermeasures addressing the demonstrated attack vector' : ''}
- Implementation guidelines and best practices
- Verification steps to confirm remediation effectiveness
- Long-term security improvements

${proofs ? 'Ensure your remediation directly addresses the specific attack method shown in the proof of concept. ' : ''}Structure your response with clear, actionable steps (2-4 paragraphs).

Current content: ${currentContent || 'None'}

Provide only the remediation content, no additional formatting or explanations.`,
                zh: `你是提供修复指导的网络安全专家。基于漏洞"${title}"${proofs ? `和以下概念验证：\n\n${proofs}\n\n` : '，'}提供全面的修复策略。

${proofs ? '考虑到概念验证中演示的具体攻击方法，' : ''}提供：
- 即时遏制和缓解步骤
- 根本原因修复和永久性修复
- 防止类似漏洞的安全控制${proofs ? '\n- 针对演示攻击向量的具体对策' : ''}
- 实施指南和最佳实践
- 确认修复有效性的验证步骤
- 长期安全改进

${proofs ? '确保你的修复直接针对概念验证中显示的具体攻击方法。' : ''}用清晰、可操作的步骤构建你的回复（2-4段）。

当前内容：${currentContent || '无'}

只提供修复内容，不要额外的格式或解释。`
            }
        };

        const prompt = prompts[fieldType]?.[targetLanguage] || prompts[fieldType]?.en;
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

        // System prompts to enforce target output language strictly
        const systemPrompts = {
            en: `You are a professional cybersecurity translator. Your output MUST be entirely in English only. Do not include any Chinese characters. Preserve all HTML tags, code blocks, URLs, numbers and structure exactly as in the input. Do not add explanations, quotes, or wrappers. Return only the translated content.`,
            zh: `你是一名专业的网络安全翻译员。你的输出必须完全为中文。不要包含英文原句复述或多余解释。必须完全保留输入中的所有HTML标签、代码块、URL、数字和结构。只返回翻译后的内容。`
        };

        const prompts = {
            en: `You are a cybersecurity expert translator. Translate ONLY the Chinese text in the following content to English while:
1. Preserving ALL HTML tags exactly as they are
2. Only translating Chinese characters to English
3. Using professional cybersecurity terminology
4. Keeping all English text unchanged
5. Maintaining the exact structure and formatting
6. The final output must be 100% English and contain NO Chinese characters

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
            { role: 'system', content: systemPrompts[targetLanguage] },
            { role: 'user', content: prompt }
        ];

        const response = await this.callOpenAI(messages);
        let translated = response.choices[0]?.message?.content || '';

        // If translating to English but output still contains Chinese characters, retry once with stricter instruction
        const containsChinese = /[\u4e00-\u9fff]/.test(translated);
        if (targetLanguage === 'en' && containsChinese) {
            const retryMessages = [
                { role: 'system', content: systemPrompts.en },
                { role: 'user', content: `STRICT MODE: The previous output contained Chinese characters. Translate the following content to English and ensure the output contains NO Chinese characters. Preserve all HTML tags exactly.\n\nContent:\n${content}\n\nReturn only the translated content.` }
            ];
            try {
                const retryResp = await this.callOpenAI(retryMessages);
                const retryText = retryResp.choices[0]?.message?.content || '';
                if (retryText) translated = retryText;
            } catch (e) {
                // keep first translation if retry fails
            }
        }

        return translated;
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