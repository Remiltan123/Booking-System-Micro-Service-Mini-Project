const os = require("os");
const { Eureka } = require("eureka-js-client");

const PORT = parseInt(process.env.PORT || 5001);
const EUREKA_HOST = process.env.EUREKA_HOST || "localhost";
const EUREKA_PORT = parseInt(process.env.EUREKA_PORT || 8761);

function getContainerIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

const IP_ADDR = getContainerIp();

const client = new Eureka({
  instance: {
    app: "NOTIFICATION-SERVICE",
    instanceId: `NOTIFICATION-SERVICE-${IP_ADDR}-${PORT}`,

    hostName: IP_ADDR,
    ipAddr: IP_ADDR,
    preferIpAddress: true,

    statusPageUrl: `http://${IP_ADDR}:${PORT}`,
    homePageUrl: `http://${IP_ADDR}:${PORT}`,

    port: {
      $: PORT,        
      "@enabled": true,
    },

    vipAddress: "notification-service",

    dataCenterInfo: {
      "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      name: "MyOwn",
    },

    // Dev-only: shorter lease so a dead replica drops out of the registry
    // in seconds instead of Eureka's ~90s default. Must stay in sync with
    // eureka.heartbeatInterval below (heartbeat faster than durationInSecs).
    leaseInfo: {
      renewalIntervalInSecs: parseInt(process.env.EUREKA_LEASE_RENEWAL_INTERVAL || 30),
      durationInSecs: parseInt(process.env.EUREKA_LEASE_EXPIRATION_DURATION || 90),
    },
  },

  eureka: {
    host: EUREKA_HOST,
    port: EUREKA_PORT,
    servicePath: "/eureka/apps/",
    heartbeatInterval: parseInt(process.env.EUREKA_HEARTBEAT_INTERVAL || 30000),
    registryFetchInterval: parseInt(process.env.EUREKA_REGISTRY_FETCH_INTERVAL || 30000),
  },
});

module.exports = client;
