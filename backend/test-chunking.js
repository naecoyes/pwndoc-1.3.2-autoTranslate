// Test script for translation chunking functionality
const AIService = require('./src/lib/ai-service.js');

async function testChunking() {
    // Test content that's longer than the chunk size
    const longContent = `
    <h1>网络安全测试报告</h1>
    <p>这是一个非常长的段落，用于测试分片翻译功能。在网络安全领域，渗透测试（Penetration Testing）是一种重要的安全评估方法。
    它通过模拟真实攻击者的行为来识别系统中的安全漏洞。渗透测试通常包括信息收集、威胁建模、漏洞识别、漏洞利用和报告编写等阶段。</p>

    <h2>渗透测试方法论</h2>
    <p>渗透测试的方法论是确保测试有效性的关键。常用的方法论包括OWASP测试指南、PTES（Penetration Testing Execution Standard）
    和NIST SP 800-115等。这些方法论提供了标准化的测试流程和最佳实践，帮助测试人员系统性地识别和验证安全漏洞。</p>

    <h3>信息收集阶段</h3>
    <p>信息收集是渗透测试的第一步，也是最关键的一步。在这个阶段，测试人员会收集目标系统的所有相关信息，
    包括网络拓扑、域名信息、IP地址范围、操作系统版本、应用程序信息等。有效的信息收集可以大大提高后续测试的效率和成功率。</p>

    <h3>漏洞扫描</h3>
    <p>漏洞扫描是识别系统中已知安全漏洞的重要手段。常用的漏洞扫描工具包括Nessus、OpenVAS、Nexpose等。
    这些工具可以自动化地检测系统中的安全配置问题、软件漏洞和潜在的攻击向量。扫描结果需要人工验证以减少误报。</p>

    <h2>Web应用安全测试</h2>
    <p>Web应用安全测试是现代渗透测试的重要组成部分。随着Web应用的普及，针对Web应用的攻击也日益增多。
    常见的Web应用漏洞包括SQL注入、跨站脚本（XSS）、跨站请求伪造（CSRF）、文件包含漏洞等。
    测试人员需要熟悉OWASP Top 10中列出的最常见的Web应用安全风险。</p>

    <h3>SQL注入测试</h3>
    <p>SQL注入是一种常见的Web应用漏洞，攻击者可以通过构造恶意的SQL查询来绕过身份验证、读取敏感数据或修改数据库内容。
    防御SQL注入的最佳实践包括使用参数化查询、输入验证、最小权限原则和Web应用防火墙等。</p>

    <h3>跨站脚本测试</h3>
    <p>跨站脚本（XSS）漏洞允许攻击者在受害者的浏览器中执行恶意脚本。XSS分为存储型、反射型和DOM型三种类型。
    防御XSS的措施包括输出编码、内容安全策略（CSP）、输入验证和使用安全的JavaScript框架等。</p>

    <h2>报告编写</h2>
    <p>渗透测试报告是测试结果的最终呈现形式，也是客户了解安全状况和制定修复计划的重要依据。
    一份好的渗透测试报告应该包括执行摘要、技术细节、风险评级、修复建议和附录等内容。
    报告应该清晰、准确、可操作，并避免使用过于技术化的术语。</p>

    <p>执行摘要应该面向管理层，重点说明测试范围、发现的主要风险和整体安全状况。
    技术细节部分应该详细描述每个发现的漏洞，包括漏洞描述、影响分析、复现步骤和修复建议。
    风险评级应该基于漏洞的严重程度、利用难度和潜在影响进行综合评估。</p>

    <h2>总结</h2>
    <p>渗透测试是保障信息系统安全的重要手段。通过系统性的测试和评估，可以及时发现和修复安全漏洞，
    降低系统被攻击的风险。然而，渗透测试只是一个安全评估工具，不能替代其他安全措施，
    如安全开发、安全运维和安全意识培训等。</p>
    `.repeat(10); // Make it extra long

    console.log('Testing chunking translation...');
    console.log('Content length:', longContent.length);

    try {
        // Test chunking function
        const chunks = AIService.splitContentIntoChunks(longContent, 3000);
        console.log('Number of chunks:', chunks.length);
        console.log('Chunk sizes:', chunks.map(c => c.length));

        console.log('Chunking test completed successfully!');
    } catch (error) {
        console.error('Error in chunking test:', error.message);
    }
}

// Run the test
testChunking().catch(console.error);