# Quick Terminals

## Features

- Open multiple pre-configured terminals with a command
- Can open terminals on startup based on `quickTerminals.openOnStartup` setting

## Configure a terminal

```jsonc
// .vscode/settings.json

{
  "quickTerminals.terminals": [
    {
      "name": "Terminal 1",
      "command": "echo 'Hello World!'" // will run this command in the terminal
    },
    {
      "name": "Terminal 2",
      "command": "npm run dev", // will run this in the background
      "show": false
    }
  ]
}
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run the extension using `pnpm run dev`

> **Note**: If you are using VSCode, you can hit `F5` or use the `Run Extension` task to run the extension.

## License

Published under [MIT License](./LICENCE).
