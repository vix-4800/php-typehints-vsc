# PHP Parameter Hints

Display parameter names as inlay hints for PHP function calls, powered by Intelephense.

## Features

- **Automatic Parameter Hints**: Shows parameter names before arguments in function and method calls
- **Smart Detection**: Automatically hides hints for named arguments (PHP 8.0+)
- **Configurable**: Hide hints when variable names match parameter names
- **Built-in Function Support**: Works with PHP built-in functions and user-defined functions
- **Powered by Intelephense**: Uses Intelephense language server for accurate type information

## Screenshot

![alt text](image.png)

## Requirements

- [Intelephense](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client) extension
    must be installed and active

## Configuration

```jsonc
{
    // Enable or disable parameter hints
    "phpParameterHints.enabled": true,

    // Hide hint when variable name matches parameter name
    "phpParameterHints.hideWhenArgumentMatchesName": true,

    // Show hints for built-in PHP functions
    "phpParameterHints.showForBuiltInFunctions": true
}
```

## Development

### Install Dependencies

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Create VSIX Package

```bash
npm run package
```

## License

[MIT License](LICENSE)

## Alternatives

- [PhpStorm Parameter Hints in VScode](https://marketplace.visualstudio.com/items?itemName=MrChetan.phpstorm-parameter-hints-in-vscode)
