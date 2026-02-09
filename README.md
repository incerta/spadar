> ⚠️ **This is an alpha version of Spadar.** APIs, commands, and configuration are subject to breaking changes.

# Spadar

Software engineer AI helper — a CLI tool that orchestrates AI adapter modules for various transformations (text-to-text, text-to-image, etc.) through a unified interface.

## Core Concepts

- **Adapter Module** — a plugin that implements one or more connectors to a specific AI vendor. Generated and managed via `spadar generate` and `spadar adapter` commands.
- **Connector** — a unit within an adapter that defines supported transformations, IO schemas, model options, and required API keys.
- **Mediator** — runtime layer that resolves available adapters and exposes a normalized API surface.
- **Expert** — a named prompt preset (stored as JSON in `~/.spadar/experts`) that can be invoked during chat sessions.

## Installation

Clone the repository and run:

```sh
npm install
npm install -g jiti
```

Since the module has not yet been published, we use `jiti` to run the CLI from source. Add the following to your shell config (`.bashrc`, `.zshrc`, etc.):

```sh
export SPADAR_RESOURCES_DIR="~/.spadar"
export SPADAR_CLI_PATH="/path/to/spadar"

function spadar() {
  local pipeData

  if [ -p /dev/stdin ]; then
    while IFS= read -r line
    do
      pipeData="$pipeData$line"
    done
  fi

  if [[ -z "$pipeData" ]]; then
    jiti "$SPADAR_CLI_PATH/src/cli" "$@"
  else
    echo $pipeData | jiti "$SPADAR_CLI_PATH/src/cli" "$@"
  fi
}
```

## Usage

```sh
spadar --help                       # General help
spadar --version                    # Print version
```

### Chat

```sh
spadar chat                         # Start interactive chat
spadar chat --initialMessage "Hi"   # Start chat with initial message
echo "Hi" | spadar chat             # Pipe input into chat
```

### Adapter Management

```sh
spadar adapter --help
spadar adapter --use $PATH          # Register an adapter module
spadar adapter --unuse $NAME        # Unregister an adapter by name
spadar adapter --list               # List registered adapters
```

### Code Generation

```sh
spadar generate --help
spadar generate --adapterModule $PATH       # Scaffold a new adapter module
spadar generate --adapterConnectors $PATH   # Generate connector files from schema
spadar generate --adapterAPI $PATH          # Build final adapter entrypoint
```

## Adapter Module Structure

After generation, an adapter module has the following layout:

```
my-adapter/
├── package.json
└── src/
    ├── schema.ts                              # Connector schemas (source of truth)
    ├── adapter.ts                             # Generated entrypoint (do not edit)
    ├── index.ts                               # Public export (editable)
    └── connectors/
        ├── <connector-id>.typings.ts          # Generated types (do not edit)
        ├── <connector-id>.signature.ts        # Generated signatures (do not edit)
        └── <connector-id>.connector.ts        # Your implementation (edit this)
```

## License

MIT
