const { Eureka } = require("eureka-js-client");

const client = new Eureka({
  instance: {
    app: "NOTIFICATION-SERVICE",   
    instanceId: `NOTIFICATION-SERVICE-${process.env.PORT || 5001}`,

    hostName: "localhost",
    ipAddr: "127.0.0.1",

    statusPageUrl: "http://localhost:5001",
    homePageUrl: "http://localhost:5001",

    port: {
      $: 5001,        
      "@enabled": true,
    },

    vipAddress: "notification-service",

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