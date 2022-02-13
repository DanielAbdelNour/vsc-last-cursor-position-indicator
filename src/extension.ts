// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const startExtension = (context: vscode.ExtensionContext) => {
  // The code you place here will be executed every time your command is executed

  console.log("last cursor position is activated");
  const minDist = vscode.workspace.getConfiguration("last-cursor-position-indicator").get("newPositionMinDistance") as number

  let timeout: NodeJS.Timer | undefined = undefined;

  // create a decorator type that we use to annotate last cursor position
  const lastPositionDecoratorType =
    vscode.window.createTextEditorDecorationType({
      overviewRulerColor: "blue",
      overviewRulerLane: vscode.OverviewRulerLane.Right,
    });

  let activeEditor = vscode.window.activeTextEditor;
  let prevPosition =
    activeEditor?.selection.active ?? new vscode.Position(0, 0);

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    const position = activeEditor.selection.active;

    // return if the position hasn't changed by more than the minDist lines
    if (Math.abs(position.line - prevPosition.line) < minDist) {
      return;
    }

    activeEditor.setDecorations(lastPositionDecoratorType, [
      { range: new vscode.Range(prevPosition, prevPosition) },
    ]);
    prevPosition = position;
  }

  function triggerUpdateDecorations(throttle: boolean = false) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (throttle) {
      timeout = setTimeout(updateDecorations, 500);
    } else {
      updateDecorations();
    }
  }

  if (activeEditor) {
    //triggerUpdateDecorations();
  }

  vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      if (
        activeEditor &&
        event.textEditor === activeEditor &&
        event.kind === vscode.TextEditorSelectionChangeKind.Mouse
      ) {
        triggerUpdateDecorations(true);
      }
    },
    null,
    context.subscriptions
  );
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // const disposable = vscode.commands.registerCommand(
  //   "last-cursor-position-indicator.activateLastCursorPosition",
  //   () => startExtension(context)
  // );
  startExtension(context);
  //context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
