const SocketServer: any = (window as any).SocketServer || {};
const ApiServer: any = (window as any).ApiServer || {};
const loopConfig: any = (window as any).loopConfig || {};
const noLogo: any = (window as any).noLogo || {};

export default {
  ServerSocket: {
    host: SocketServer.host,
    port: SocketServer.port
  },
  Api: {
    host: ApiServer.host,
    port: ApiServer.port
  },
  loopConfig: loopConfig,
  noLogo: noLogo

};
