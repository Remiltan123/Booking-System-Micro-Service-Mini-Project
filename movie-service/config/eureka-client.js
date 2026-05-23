const { Eureka } = require("eureka-js-client");

const PORT = parseInt(process.env.PORT || 5002);
const HOSTNAME = process.env.EUREKA_INSTANCE_HOSTNAME || "localhost";

const client = new Eureka({
  instance: {
    app: "MOVIE-SERVICE",
    instanceId: `MOVIE-SERVICE-${PORT}`,
    hostName: HOSTNAME,
    ipAddr: HOSTNAME,
    statusPageUrl: `http://${HOSTNAME}:${PORT}`,
    homePageUrl: `http://${HOSTNAME}:${PORT}`,
    port: {
      $: PORT,
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
