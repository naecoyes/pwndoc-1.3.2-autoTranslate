import { Notify } from 'quasar';
import { api } from 'boot/axios';

export default {
    // Check if AI service is available
    checkStatus: () => {
        return api.get('/api/ai/status');
    },

    // Check AI status with proper response handling
    checkAIStatus: async () => {
        try {
            const response = await api.get('/api/ai/status');
            return response.data;
        } catch (error) {
            return { enabled: false };
        }
    },

    // Complete a field using AI
    completeField: (payload) => {
        return api.post('/api/ai/complete-field', payload);
    },

    // Translate content
    translateContent: (payload) => {
        return api.post('/api/ai/translate', payload);
    },

    // Translate audit results
    translateAuditResults: (auditId, targetLanguage) => {
        return api.post(`/api/ai/translate-audit/${auditId}`, {
            targetLanguage: targetLanguage
        });
    },

    // Translate entire audit to English
    translateAuditToEnglish: (auditId) => {
        return api.post(`/api/ai/translate-audit/${auditId}`, {
            targetLanguage: 'en'
        });
    }
};