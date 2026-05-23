const { Eureka } = require("eureka-js-client");

const PORT = parseInt(process.env.PORT || 5001);
const HOSTNAME = process.env.EUREKA_INSTANCE_HOSTNAME || "localhost";
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = parseInt(process.env.EUREKA_PORT || 8761);

const client = new Eureka({
  instance: {
    app: "NOTIFICATION-SERVICE",   
    instanceId: `NOTIFICATION-SERVICE-${PORT}`,

    hostName: HOSTNAME,
    ipAddr: HOSTNAME,

    statusPageUrl: `http://${HOSTNAME}:${PORT}`,
    homePageUrl: `http://${HOSTNAME}:${PORT}`,

    port: {
      $: PORT,        
      "@enabled": true,
    },

    vipAddress: "notification-service",

    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },

  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,          
    servicePath: "/eureka/apps/",
  },
});

module.exports = client;
