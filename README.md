# Code Metrics Inline - VSCode Extension

## Overview

**Code Metrics Inline** is a Visual Studio Code extension that helps developers maintain clean and maintainable code by displaying key code metrics, such as function complexity and line count, directly next to the function name. It supports JavaScript, TypeScript, and Python files, helping developers identify complex or lengthy functions that may need refactoring.

## Features

- **Function Line Count**: Displays the number of lines a function has.
- **Cyclomatic Complexity**: Shows the complexity of a function based on its control flow (loops, conditionals, etc.).
- **Supports Multiple Languages**: Works with JavaScript, TypeScript, and Python files.
- **Toggle On/Off**: Easily enable or disable the inline code metrics display via a command or keyboard shortcut.

## Installation

1. Download and install this extension from the VSCode marketplace (if published) or install it manually by following these steps:
   - Clone or download this repository.
   - Run `npm install` to install dependencies.
   - Open the extension folder in VSCode.
   - Press `F5` to open a new VSCode window with the extension running.

## Usage

1. Open a JavaScript, TypeScript, or Python file.
2. Inline code metrics will automatically appear next to function names if the extension is enabled.
3. To toggle the display of metrics on or off:
   - Open the **Command Palette** (`Ctrl + Shift + P`) and run `Toggle Code Metrics Inline`.
   - Alternatively, use the keyboard shortcut `Ctrl + Shift + T` to toggle the display.

## Commands

- **Toggle Code Metrics Inline**: Toggles the display of function line count and complexity on and off. You can access this command via the Command Palette (`Ctrl + Shift + P`) or use the keyboard shortcut `Ctrl + Shift + T`.

## How It Works

The extension uses two different parsers depending on the file type:

- **For JavaScript/TypeScript**: The extension uses the TypeScript Compiler API to parse the code, extract function definitions, and calculate complexity and line count.
- **For Python**: The extension uses `tree-sitter`, a fast and efficient parser, to extract function definitions and calculate metrics for Python files.

The metrics are displayed inline next to the function name using the VSCode decoration API.

## Configuration

Currently, this extension does not have additional configuration options, but it stores the on/off toggle state between sessions.

## Development

If you want to contribute or make modifications, follow these steps:

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Make your changes in the `src/extension.ts` file.
4. Run `npm run compile` to compile the TypeScript code.
5. Press `F5` in VSCode to launch the extension in a new VSCode window.

