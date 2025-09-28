# PwnDoc

PwnDoc is a pentest reporting application making it simple and easy to write your findings and generate a customizable Docx report.  
The main goal is to have more time to **Pwn** and less time to **Doc** by mutualizing data like vulnerabilities between users.

# Documentation
- [Installation](https://pwndoc.github.io/pwndoc/#/installation)
- [Data](https://pwndoc.github.io/pwndoc/#/data)
- [Vulnerabilities](https://pwndoc.github.io/pwndoc/#/vulnerabilities)
- [Audits](https://pwndoc.github.io/pwndoc/#/audits)
- [Templating](https://pwndoc.github.io/pwndoc/#/docxtemplate)


# Features

- Multiple Language support
- Multiple Data support
- **AI-Powered Translation** 🤖
  - Automatic audit translation with one click
  - Preserves HTML formatting and structure
  - Professional cybersecurity terminology
  - Support for multiple LLM providers (OpenAI, Azure, Ollama)
- Great Customizationßß
  - Manage reusable Audit and Vulnerability Data
  - Create Custom Sections
  - Add custom fields to Vulnerabilities
- Vulnerabilities Management
- Multi-User reporting
- Docx Report Generation
- Docx Template customization

# Demos

#### Multi-User reporting
![Shared Audit demo gif](https://raw.githubusercontent.com/pwndoc/pwndoc/master/demos/shared_audit_demo.gif)

#### Finding edition
![Finding edit demo gif](https://raw.githubusercontent.com/pwndoc/pwndoc/master/demos/audit_finding_demo.gif)

#### Vulnerability management workflow
![Create and update demo gif](https://raw.githubusercontent.com/pwndoc/pwndoc/master/demos/create_and_update_finding.gif)

---

## 🤖 AI Translation Feature

### English

This enhanced version of PwnDoc includes powerful AI-driven translation capabilities that streamline the process of creating multilingual security audit reports.

#### Key Features:
- **One-Click Translation**: Translate entire audit reports with a single button click
- **Smart Content Processing**: Automatically translates Chinese text to English while preserving HTML tags and formatting
- **Professional Terminology**: Uses cybersecurity-specific terminology for accurate technical translations
- **New Audit Creation**: Creates a new English audit instead of modifying the original, preserving your source content
- **Multiple LLM Support**: Compatible with OpenAI, Azure OpenAI, and local Ollama models

#### How to Use:
1. Navigate to the Audits list page
2. Click the "Translate to English" button next to any audit
3. The system will create a new audit with "(English Translation)" suffix
4. All findings (title, description, observation, remediation, POC) will be automatically translated
5. You'll be redirected to the new translated audit

#### Configuration:
Configure your AI service in the Settings page:
- **Provider**: Choose between OpenAI, Azure, or Custom (Ollama)
- **Model**: Select your preferred model (e.g., gpt-4, llama3.1:8b)
- **API Settings**: Configure endpoint and authentication

---

### 中文

此增强版本的 PwnDoc 包含强大的 AI 驱动翻译功能，简化了创建多语言安全审计报告的流程。

#### 主要功能：
- **一键翻译**：单击按钮即可翻译整个审计报告
- **智能内容处理**：自动将中文翻译为英文，同时保留 HTML 标签和格式
- **专业术语**：使用网络安全专业术语确保技术翻译的准确性
- **新建审计**：创建新的英文审计而不是修改原始内容，保护您的源内容
- **多 LLM 支持**：兼容 OpenAI、Azure OpenAI 和本地 Ollama 模型

#### 使用方法：
1. 导航到审计列表页面
2. 点击任意审计旁边的"Translate to English"按钮
3. 系统将创建一个带有"(English Translation)"后缀的新审计
4. 所有发现（标题、描述、观察、修复建议、POC）将自动翻译
5. 您将被重定向到新的翻译审计

#### 配置：
在设置页面配置您的 AI 服务：
- **提供商**：选择 OpenAI、Azure 或自定义（Ollama）
- **模型**：选择您偏好的模型（如 gpt-4、llama3.1:8b）
- **API 设置**：配置端点和身份验证

#### 技术特性：
- 保留所有 HTML 标签和格式
- 智能识别中英文混合内容
- 专业的网络安全术语翻译
- 支持本地和云端 LLM 服务
- 错误处理和重试机制
