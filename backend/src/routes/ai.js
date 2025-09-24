module.exports = function(app) {

    var Response = require('../lib/httpResponse.js');
    var AIService = require('../lib/ai-service.js');
    var acl = require('../lib/auth').acl;

    // Complete vulnerability field using AI
    app.post("/api/ai/complete-field", acl.hasPermission('audits:update'), async function(req, res) {
        if (!req.body.title || !req.body.fieldType) {
            Response.BadParameters(res, 'Missing required parameters: title and fieldType');
            return;
        }

        try {
            const { title, currentContent, fieldType, language } = req.body;
            
            // Validate fieldType
            const allowedFields = ['description', 'observation', 'remediation'];
            if (!allowedFields.includes(fieldType)) {
                Response.BadParameters(res, `Invalid fieldType. Allowed values: ${allowedFields.join(', ')}`);
                return;
            }

            const completedContent = await AIService.completeVulnerabilityField(
                title, 
                currentContent, 
                fieldType, 
                language || 'en'
            );

            Response.Ok(res, { content: completedContent });
        } catch (error) {
            console.error('AI completion error:', error);
            if (error.message.includes('not enabled')) {
                Response.Forbidden(res, 'AI service is not enabled');
            } else if (error.message.includes('API key')) {
                Response.Internal(res, 'AI service configuration error');
            } else {
                Response.Internal(res, `AI completion failed: ${error.message}`);
            }
        }
    });

    // Translate content using AI
    app.post("/api/ai/translate", acl.hasPermission('audits:update'), async function(req, res) {
        if (!req.body.content) {
            Response.BadParameters(res, 'Missing required parameter: content');
            return;
        }

        try {
            const { content, targetLanguage } = req.body;
            
            const translatedContent = await AIService.translateContent(
                content, 
                targetLanguage || 'en'
            );

            Response.Ok(res, { content: translatedContent });
        } catch (error) {
            console.error('AI translation error:', error);
            if (error.message.includes('not enabled')) {
                Response.Forbidden(res, 'AI service is not enabled');
            } else if (error.message.includes('API key')) {
                Response.Internal(res, 'AI service configuration error');
            } else {
                Response.Internal(res, `AI translation failed: ${error.message}`);
            }
        }
    });

    // Translate entire audit findings
    app.post("/api/ai/translate-audit/:auditId", acl.hasPermission('audits:update'), async function(req, res) {
        try {
            const Audit = require('../models/audit');
            const auditId = req.params.auditId;
            const { targetLanguage } = req.body;

            // Get audit with findings
            const audit = await Audit.findById(auditId).populate('findings.title');
            if (!audit) {
                Response.NotFound(res, 'Audit not found');
                return;
            }

            // Extract findings data for translation
            const findingsData = audit.findings.map(finding => ({
                title: finding.title?.name || '',
                description: finding.description || '',
                observation: finding.observation || '',
                remediation: finding.remediation || '',
                poc: finding.poc || ''
            }));

            const translatedFindings = await AIService.translateAuditFindings(
                findingsData, 
                targetLanguage || 'en'
            );

            // Update audit findings with translated content
            for (let i = 0; i < audit.findings.length; i++) {
                if (translatedFindings[i]) {
                    audit.findings[i].description = translatedFindings[i].description;
                    audit.findings[i].observation = translatedFindings[i].observation;
                    audit.findings[i].remediation = translatedFindings[i].remediation;
                    audit.findings[i].poc = translatedFindings[i].poc;
                }
            }

            await audit.save();

            Response.Ok(res, { 
                message: 'Audit findings translated successfully',
                translatedCount: translatedFindings.length
            });
        } catch (error) {
            console.error('Audit translation error:', error);
            if (error.message.includes('not enabled')) {
                Response.Forbidden(res, 'AI service is not enabled');
            } else if (error.message.includes('API key')) {
                Response.Internal(res, 'AI service configuration error');
            } else {
                Response.Internal(res, `Audit translation failed: ${error.message}`);
            }
        }
    });

    // Check AI service status
    app.get("/api/ai/status", acl.hasPermission('audits:read'), async function(req, res) {
        try {
            const isEnabled = await AIService.isEnabled();
            const settings = await AIService.getSettings();
            
            Response.Ok(res, {
                enabled: isEnabled,
                provider: settings.llm?.public?.provider || null,
                model: settings.llm?.public?.model || null
            });
        } catch (error) {
            console.error('AI status check error:', error);
            Response.Internal(res, 'Failed to check AI service status');
        }
    });

};