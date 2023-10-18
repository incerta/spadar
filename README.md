# How to install

Clone repository and run following commands in the project root directory:

```sh
npm install
npm install -g jiti
```

We need globally installed `jiti` cli tool in order to run our app. While the project is still in early development phase it is not time yet to make `spadar` cli tool that could be installed from `npm` directly.

Copy `.env.example` to `.env` which is in `.gitignore` and fill in required API keys

# How to use

For convenience we recommend to add following function in your shell config (`.bashrc` for example):

```sh
SPADAR_CLI_PATH="CLONED_SPADAR_REPO_PATH"

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

Usage:
spadar chat [flags...]

Flags:
-c, --from-clipboard Start conversation with AI where first message is a text from clipboard
-h, --help Show help

## Image generation prototype feature

While in conversation with AI one can request image generation through a special `[img:$SIZE]` marker. Where `$SIZE` has three possible options for image generation:

- `sm` for 256x256 resolution
- `md` for 512x512 resolution
- `lg` for 1024x1024 resolution

Example:

```
green field and blue sky [img:sm]
```

The image prompt is `green field and blue sky` and resulting image size `256x256`. After image is generated user will be provided with image URL (available for one hour) which is copied to the clipboard automatically.

# What is all about? (TODO)

It's an experimentation platform for software development automation boundaries definition using AI language models. The ultimate goal is to have ability generate humanly readable statically typed documented and well tested frontend/backend codebase with infrastructure config by the simple request like "build me twitter using typescript" with ability to effectively change the generated or humanly written app by automation.

We are going to do it through creation of numerous cli tools powered by AI language model API. We want to develop unified manner of using this cli tools which should be convenient in their orchestration. We prioritizing the goal of simplification of frontend development job and reducing it to just requirements clarification and generated solution refinement – checking if everything is clear, working and humanly readable.
