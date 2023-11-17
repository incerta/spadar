# How to install

Clone repository and run following commands in the project root directory:

```sh
npm install
npm install -g jiti
```

Copy `.env.example` to `.env` which is in `.gitignore` and fill in required API keys

We need globally installed `jiti` cli tool in order to run our app. While the project is still in early development phase it is not time yet to make `spadar` cli tool that could be installed from `npm` directly.

# How to use

For convenience we recommend to add following function in your shell config (`.bashrc` for example):

```sh
spadar() {
  cd $SPADAR_CLI_PATH
  jiti ./src/cli chat
}
```

# Currently supported features

## Conversation with AI through CLI

Just use `chat` parameter:

```sh
spadar chat
```

## Image generation prototype feature (DEPRECATED)

While in conversation with AI one can request image generation through a special `[img:$SIZE]` marker. Where `$SIZE` has three possible options for image generation:

- `sm` for 256x256 resolution
- `md` for 512x512 resolution
- `lg` for 1024x1024 resolution

Example:

```
green field and blue sky [img:sm]
```

The image prompt is `green field and blue sky` and resulting image size `256x256`. After image is generated user will be provided with image URL (available for one hour) which is copied to the clipboard automatically.
