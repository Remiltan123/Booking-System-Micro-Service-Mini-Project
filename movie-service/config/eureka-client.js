const { Eureka } = require("eureka-js-client");

const client = new Eureka({
  instance: {
    app: "MOVIE-SERVICE",
    instanceId: `MOVIE-SERVICE-${process.env.PORT || 5001}`,
    hostName: "localhost",
    ipAddr: "127.0.0.1",
    statusPageUrl: `http://localhost:${process.env.PORT || 5001}`,
    homePageUrl: `http://localhost:${process.env.PORT || 5001}`,
    port: {
      $: parseInt(process.env.PORT || 5001),
      "@enabled": true,
    },
    vipAddress: "movie-service",
    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },
  },
  eureka: {
    host: process.env.EUREKA_HOST || "localhost",
    port: parseInt(process.env.EUREKA_PORT || 8761),
    servicePath: "/eureka/apps/",
  },
});

module.exports = client;
