const { Eureka } = require("eureka-js-client");

const client = new Eureka({
  instance: {
    app: "USER-SERVICE",   
    instanceId: `USER-SERVICE-${process.env.PORT}`, 
    hostName: "localhost",
    ipAddr: "127.0.0.1",

    statusPageUrl: "http://localhost:5000",
    homePageUrl: "http://localhost:5000",

    port: {
      $: 5000,
      "@enabled": true,
    },

    vipAddress: "user-service",

    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },

  eureka: {
    host: "localhost",
    port: 8761,
    servicePath: "/eureka/apps/",
  },
});

module.exports = client;