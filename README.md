# PHP Type Hints

Display parameter names and return types as inlay hints for PHP, powered by Intelephense.

## Features

- **Parameter Hints**: Shows parameter names before arguments in function and method calls
- **Return Type Hints**: Displays return types for function declarations
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
    // Enable or disable all type hints
    "phpTypeHints.enabled": true,

    // Show parameter name hints for function calls
    "phpTypeHints.showParameterHints": true,

    // Show return type hints for function declarations
    "phpTypeHints.showReturnTypeHints": true,

    // Hide hint when variable name matches parameter name
    "phpTypeHints.hideWhenArgumentMatchesName": true,

    // Show hints for built-in PHP functions
    "phpTypeHints.showForBuiltInFunctions": true
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
