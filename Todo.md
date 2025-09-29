# Todo
## 1.在settings中添加llm配置功能
https://127.0.0.1:18443/settings
后续使用接口调用settings中的配置
可以调用chatgpt api接口格式

## 2.根据漏洞标题和漏洞描述调用ai接口补全description和observation and remediation
https://127.0.0.1:18443/audits/68cd31672ac093f8a2db58f3/findings/68ccfdd7c102ce3324f0b489
每个漏洞在数据库中存储的格式：
``` json
 "findings" : [
                {
                        "identifier" : 7,
                        "title" : "CVE-2021-26084 远程命令执行",
                        "references" : [ ],
                        "status" : 0,
                        "customFields" : [ ],
                        "_id" : ObjectId("68ccfdd7c102ce3324f0b489"),
                        "paragraphs" : [ ],
                        "description" : "",
                        "observation" : "",
                        "poc" : "<p>执行数学计算确认漏洞存在</p><img src=\"68ccfde9c102ce3324f0b4b2\" alt=\"image.png\"><pre><code>POST /pages/createpage-entervariables.action HTTP/1.1\nHost: 10.21.0.100:8090\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/118.0\nContent-Length: 47\nContent-Type: application/x-www-form-urlencoded\nAccept-Encoding: gzip, deflate, br\nConnection: keep-alive\n\nqueryString=aaaa\\u0027%2b#{16*8787}%2b\\u0027bbb</code></pre><p></p>",
                        "remediation" : "",
                        "scope" : "<p>https://10.21.0.100:8090</p>",
                        "cvssv3" : "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L"
                },
```
## 3.audits 展示报告列表添加一键翻译英文按钮

https://127.0.0.1:18443/audits
进入mongodb docker容器

```json
mongo
show dbs
use pwndoc
show collections
db.audits.find().pretty()

# 删除id那行
db.audits.insertOne({
    "name" : "Platform",
    "auditType" : "Web Application",
    "collaborators" : [ ],
    "reviewers" : [ ],
    "language" : "ZH",
    "creator" : ObjectId("67d91 
    )
    
```

将启动title、description、observation、remediation、poc中出现的中文翻译为英文，不要修改html标签，只修改中文,使用网络安全术语

 curl -X POST http://192.168.2.2:11434/v1/chat/completions -H "Content-Type: application/json" -d '{"model": "llama3.1:8b", "messages": [{"role": "user", "content": "Hello"}], "max_tokens": 10}'
