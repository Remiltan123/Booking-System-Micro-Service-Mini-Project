const { Eureka } = require("eureka-js-client");

const client = new Eureka({
  instance: {
    app: "BOOKING-SERVICE",
    instanceId: `BOOKING-SERVICE-${process.env.PORT || 5003}`,

    hostName: "localhost",
    ipAddr: "127.0.0.1",

    statusPageUrl: `http://localhost:${process.env.PORT || 5003}`,
    homePageUrl: `http://localhost:${process.env.PORT || 5003}`,

    port: {
      $: parseInt(process.env.PORT) || 5003,
      "@enabled": true,
    },

    vipAddress: "booking-service",

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
