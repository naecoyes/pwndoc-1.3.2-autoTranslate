import { Notify } from 'quasar';
import { api } from 'boot/axios';

export default {
    // Check if AI service is available
    checkStatus: () => {
        return api.get('/ai/status');
    },

    // Check AI status with proper response handling
    checkAIStatus: async () => {
        try {
            const response = await api.get('/ai/status');
            // Backend wraps data in {status: "success", datas: actualData}
            return response.data.datas || response.data;
        } catch (error) {
            return { enabled: false };
        }
    },

    // Complete a field using AI
    completeField: (payload) => {
        return api.post('/ai/complete-field', payload);
    },

    // Translate content
    translateContent: (payload) => {
        return api.post('/ai/translate', payload);
    },

    // Translate audit results
    translateAuditResults: (auditId, targetLanguage) => {
        return api.post(`/ai/translate-audit/${auditId}`, {
            targetLanguage: targetLanguage
        });
    },

    // Translate entire audit to English
    translateAuditToEnglish: (auditId) => {
        return api.post(`/ai/translate-audit/${auditId}`, {
            targetLanguage: 'en'
        });
    }
};