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

### Setup
server
```bash 
npm install
```

### Run
server
```bash
npm run debug
```
websocket server will start port at 3000.

### Docker
WIP

# Licence
This software is released under the MIT License, see LICENSE.
