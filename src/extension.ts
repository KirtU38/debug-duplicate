import * as vscode from 'vscode';

let counter = 1;

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('duplicate-and-debug.duplicate', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const selection = editor.selection;
    let selectedLineRaw = editor.document.lineAt(selection.start.line).text;
    let selectedLineRawSplit = selectedLineRaw.split(/\w/gi);
    let spacesToInsertBeforeTheDuplicatedLine = selectedLineRawSplit[0].match(/\s+/) ? selectedLineRawSplit[0] : "";
    let selectedLine = editor.document.lineAt(selection.start.line).text.trim();
    let debugWithVatiableInside = /^System\.debug\(\w.*\).*/gi;
    let variableDeclaration = /.+=.+(;|\)).*/g;
    let methodDeclaration = /(public|private|protected).+\(.*/gi;
    let ifStatement = /\s*if\s*\(.*/gi;
    let blankLine = /^\s*$/gi;

    let duplicatedLine = "";
    if (selectedLine.match(debugWithVatiableInside)) {
      console.log('selectedLine.match(debugWithVatiableInside)');
      duplicatedLine = selectedLine.replace(/^System\.debug\((.+)\).*/gi, `System.debug('$1');`);
    } else if (selectedLine.match(ifStatement)) {
      console.log('selectedLine.match(ifStatement)');
      let ifStatementWithoutCurlyBrace = selectedLine.replace('{', '').trim();
      spacesToInsertBeforeTheDuplicatedLine += ' '.repeat(4);
      ifStatementWithoutCurlyBrace = ifStatementWithoutCurlyBrace.replaceAll('\'', '');
      ifStatementWithoutCurlyBrace = ifStatementWithoutCurlyBrace.replaceAll('||', 'OR');
      duplicatedLine = `System.debug('--> ${ifStatementWithoutCurlyBrace}');`;
    } else if (selectedLine.match(methodDeclaration)) {
      console.log('selectedLine.match(methodDeclaration)');
      let methodDeclarationSplit = selectedLine.split('(');
      let methodSignature = methodDeclarationSplit[0].trim();
      let methodSignatureSplit = methodSignature.split(/\s+/);
      let methodName = methodSignatureSplit[methodSignatureSplit.length - 1];
      spacesToInsertBeforeTheDuplicatedLine += ' '.repeat(4);
      duplicatedLine = `System.debug('${methodName}()');`;
    } else if(selectedLine.match(variableDeclaration)) {
      console.log('selectedLine.match(variableDeclaration)');
      let selectedLineSplit = selectedLine.split('=');
      let declarationPart = selectedLineSplit[0].trim();
      let declarationPartSplit = declarationPart.split(/\s+/);
      let variableName;
      if (declarationPartSplit.length > 1) {
        variableName = declarationPartSplit[declarationPartSplit.length - 1].trim();
      } else {
        variableName = declarationPartSplit[0].trim();
      }
      duplicatedLine = `System.debug(${variableName});`;
    } else if(selectedLine.match(blankLine)) {
      console.log('selectedLine.match(blankLine)');
      duplicatedLine = `System.debug('Pointer: ${counter++}');`;
    } else {
      console.log('STANDARD');
      selectedLine = selectedLine.replaceAll('\'', '');
      duplicatedLine = `System.debug('${selectedLine}');`;
    }

    editor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(selection.end.line, selectedLineRaw.length), `\n${spacesToInsertBeforeTheDuplicatedLine}${duplicatedLine}`);
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
