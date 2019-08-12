# Simple Client app

## Set up
- download [video](http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4) & move video at `./src/media`

```bash
npm install
```

## Run
```bash
npx electron ./src
```
electron app will start.
After electron window appeared, click connect button.
Then, run another electron app again, and click connect button.
The two client will connect via sfu server.