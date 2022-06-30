# Keep-warm-fc Plugin
![image](https://img.alicdn.com/imgextra/i1/O1CN01MtBYtc1aRoSTAtZ4p_!!6000000003327-2-tps-1810-688.png)
<p align="center" class="flex justify-center">
  <a href="https://nodejs.org/en/" class="ml-1">
    <img src="https://img.shields.io/badge/node-%3E%3D%2010.8.0-brightgreen" alt="node.js version">
  </a>
  <a href="https://github.com/devsapp/website-fc/blob/master/LICENSE" class="ml-1">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="license">
  </a>
</p>

本插件帮助您通过 [Serverless-Devs](https://github.com/Serverless-Devs/Serverless-Devs/) 工具和 [FC组件](https://github.com/devsapp/fc/) 实现实例预热，降低冷启动的概率。

- [快速开始](快速开始)
  - [冷启动优化](./codeStart.md)
  - [作用](#作用)
  - [快速上手](#快速上手)
  - [参数说明](#参数说明)
  - [注意事项](#注意事项)
  - [源码参考](https://github.com/devsapp/start-plugin/tree/master/keep-warm-fc/src)
- [工作原理](#工作原理)
- [关于我们](#关于我们)
## 快速开始
### 作用
本插件主要通过[定时触发器预热函数](./codeStart.md#使用定时触发器预热函数)达到有效`降低冷启动的概率`目的

### 快速上手
`website-fc`本质是针对[FC组件](https://serverless-devs.com/fc/readme)进行增强。
还是遵循FC组件的[Yaml规范](https://serverless-devs.com/fc/yaml/readme)

> 通过`s init start-keep-warm-fc` 快速体验`keep-warm-fc`插件

在执行部署钩子`post-deploy`之后声明插件, 同时声明Http函数的访问链接
```
actions:
  post-deploy: # 在deploy之后运行
    - plugin: keep-warm-fc
      args:
        url: http://start-fc-http-nodejs14.hello-world-service.1694024725952210.cn-hangzhou.fc.devsapp.net
```

### 参数说明
| 参数名称 | 默认值 | 参数含义 | 必填 |
| --- | --- | --- |--- |
| url  | - |  Http函数的访问地址    | true |
| method  | head |  Timer请求方法    | false |
| cronExpression  | 2m |  请求的频率(默认2分钟)   | false |
| enable  | true |  定时函数是否开启    | false |

> 特别提醒：默认的请求`method`为`head`生效的前提是trigger以及domain支持head方法。配置如下：
```
triggers:
  - name: httpTrigger
    type: http
    config:
      authType: anonymous
      methods:
        - GET
        - HEAD # 这里需要支持HEAD方法，Timer触发器使用
customDomains:
  - domainName: auto
    protocol: HTTP
    routeConfigs:
      - path: /*
        methods:
          - GET
          - HEAD # 这里需要支持HEAD方法，Timer触发器使用
```

### 注意事项
1. 如果您需要关闭定时触发器，可以设置参数 `enable: false`, 或者删除定时函数
2. 如果您需要定时触发器生效，最佳实践是将`trigger`的`method`方法，添加上`HEAD`类型。这样的话，性能是相对最好的

## 工作原理
工作原理比较简单，就是在完成当前部署后。`post-deploy`的钩子函数中，部署一个[定时触发器](https://help.aliyun.com/document_detail/68172.html)的辅助函数，函数名格式为`_FC_PLUGIN_keep-warm-${serviceName}-${functionName}`，这个函数每隔`2m`（默认是2分钟，用户可以通过`cronExpression`参数配置）会触发一次主函数(`Http函数`)中的URL，达到降低冷启动概率的目的。
![](https://img.alicdn.com/imgextra/i2/O1CN01Rlx1J01LM7JOZ1pp4_!!6000000001284-2-tps-1096-596.png)

### 实现代码
```
def handler(event, context):
  url = os.environ['KEEP_WARM_FC_URL']
  res = requests.head(url)
  return res.status_code
```

# 关于我们
- Serverless Devs 工具：
    - 仓库：[https://www.github.com/serverless-devs/serverless-devs](https://www.github.com/serverless-devs/serverless-devs)    
      > 欢迎帮我们增加一个 :star2: 
    - 官网：[https://www.serverless-devs.com/](https://www.serverless-devs.com/)
- 阿里云函数计算组件：
    - 仓库：[https://github.com/devsapp/fc](https://github.com/devsapp/fc)
    - 帮助文档：[https://www.serverless-devs.com/fc/readme](https://www.serverless-devs.com/fc/readme)
- 钉钉交流群：33947367    
