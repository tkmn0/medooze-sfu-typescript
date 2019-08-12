# Medooze SFU server for Typescript

## Feature
- Simple WebRTC SFU example with medooze written in typescript.
- File Source implementation.
- Includes super simple client app based on electron.

## Platforms
- OSX
- Linux

## Dependency
- python 2.7
- node 11.x.x
- [media-server-node](https://github.com/medooze/media-server-node)
(for webrtc sfu)
- [ws](https://github.com/websockets/ws) (for signaling)

### Getting Started

```bash 
# install
npm install

# run 
npm run debug
```
websocket server will start port at 3000.

Check [config file](./src/config/config.ts). You can change some settings.

### Docker
WIP

# Licence
MIT
