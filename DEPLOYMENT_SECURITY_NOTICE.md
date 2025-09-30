# 部署安全注意事项

在将此应用程序部署到公网之前，请务必注意以下安全事项：

## 1. 密钥和凭证管理

- **JWT密钥**: 应用程序会在首次启动时自动生成新的JWT密钥，请确保这些密钥安全存储
- **数据库凭证**: 不要在代码中硬编码数据库凭证，应使用环境变量
- **API密钥**: 所有第三方API密钥应通过环境变量配置

## 2. 环境变量配置

在生产环境中，应设置以下环境变量：

```bash
# 数据库配置
DB_SERVER=your_production_db_server
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password

# JWT密钥（应使用强随机生成的密钥）
JWT_SECRET=your_strong_jwt_secret_key
JWT_REFRESH_SECRET=your_strong_jwt_refresh_secret_key
```

## 3. HTTPS配置

- 确保启用HTTPS以加密传输中的数据
- 使用有效的SSL证书
- 配置适当的HTTP安全头

## 4. 网络安全

- 配置防火墙规则，仅允许必要的端口访问
- 使用反向代理（如Nginx）作为额外的安全层
- 限制对管理界面的访问

## 5. 定期维护

- 定期更新依赖包以修复安全漏洞
- 监控应用程序日志以检测异常活动
- 定期轮换密钥和凭证

## 6. 备份策略

- 实施定期数据库备份
- 确保备份文件安全存储并加密
- 定期测试备份恢复过程

请在部署前仔细检查以上所有项目，确保应用程序的安全性。