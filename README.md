# How to install

Clone repository and run following commands in the project root directory:

```sh
npm install
npm install -g jiti
```

While the module has not yet been published, we are using 'jiti' to run 'cli' from the source. In order for it to work, one needs to add 'SPADAR_RESOURCES_DIR' and the 'spadar' function into one's shell config:

```sh
export SPADAR_RESOURCES_DIR="~/.spadar"

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
