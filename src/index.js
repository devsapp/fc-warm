const core = require("@serverless-devs/core");
const path = require("path");
const { lodash, Logger, loadComponent } = core;
const logger = new Logger("keep-warm-fc");

/**
 * Plugin 插件入口
 * @param inputs 组件的入口参数
 * @param args 插件的自定义参数 {url: 请求的url, method: 请求方式(默认head), interval: 请求的频率（默认2m）}
 * @return inputs
 */

module.exports = async function index(inputs, args = {}) {
  logger.debug(`inputs params: ${JSON.stringify(inputs)}`);
  logger.debug(`args params: ${JSON.stringify(args)}`);
  if (lodash.isEmpty(args.url)) {
    throw new Error("missing url parameter in keep-warm-fc plugin.");
  }
  const instance = await loadComponent("devsapp/fc");
  const service = lodash.get(inputs, "props.service");
  const serviceFunction = lodash.get(inputs, "props.function");

  const WARM_FC_FUNCTION_NAME = `_FC_PLUGIN_keep-warm-${lodash.get(service, 'name')}-${lodash.get(serviceFunction, 'name')}`;

  const newInputs = lodash.assign({}, inputs, {
    props: {
      service,
      region: lodash.get(inputs, "props.region"),
      function: {
        name: WARM_FC_FUNCTION_NAME,
        description: `当前定时函数由Serverless Devs自动创建，用于定时预热函数【${lodash.get(serviceFunction, 'name')}】`,
        codeUri: path.join(__dirname, "helper"),
        runtime: "python3",
        timeout: 3,
        memorySize: 128,
        instanceConcurrency: 10,
        environmentVariables: {
          FUNCTION_NAME: args.functionName,
          KEEP_WARM_FC_URL: args.url,
          KEEP_WARM_FC_METHOD: lodash.toLower(
            lodash.get(args, "method", "head")
          ),
        },
      },
      triggers: [
        {
          name: "timerTrigger",
          type: "timer",
          config: {
            payload: "{}",
            cronExpression: `@every ${lodash.get(args, "interval", "4m")}`,
            enable: lodash.isUndefined(args.enable) ? true : args.enable,
          },
        },
      ],
    },
  });
  await instance.deploy(newInputs);
  await instance.invoke(
    lodash.assign({}, newInputs, {
      args: "",
      argsObj: [],
    })
  );
  return inputs;
};
