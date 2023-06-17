import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('debug-duplicate.duplicate', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
		  const selection = editor.selection;
		  const selectedLine = editor.document.lineAt(selection.start.line).text.trim();
      let debugWithVatiableInside = /^System\.debug\(\w.*\).*/gi;
      let variableDeclaration = /.+=.+;.*/g;
      let methodDeclaration = /(public|private|protected).+\(.*/gi;

      let duplicatedLine = "";
      if(selectedLine.match(debugWithVatiableInside)) {
        duplicatedLine = selectedLine.replace(/^System\.debug\((.+)\).*/gi, `System.debug('$1')`);
      } else if (selectedLine.match(variableDeclaration)) {
        let selectedLineSplit = selectedLine.split('=');
        let declarationPart = selectedLineSplit[0].trim();
        let declarationPartSplit = declarationPart.split(/\s+/);
        let variableName;
        if(declarationPartSplit.length > 1) {
          variableName = declarationPartSplit[declarationPartSplit.length - 1].trim();
        } else {
          variableName = declarationPartSplit[0].trim();
        }
        duplicatedLine = `System.debug(${variableName});`;
      } else if(selectedLine.match(methodDeclaration)) {
        let methodDeclarationSplit = selectedLine.split('(');
        let methodSignature = methodDeclarationSplit[0].trim();
        let methodSignatureSplit = methodSignature.split(/\s+/);
        let methodName = methodSignatureSplit[methodSignatureSplit.length - 1];
        duplicatedLine = `System.debug('${methodName}()');`;
      } else {
        duplicatedLine = `System.debug('${selectedLine}');`;
      }
		  
		  editor.edit((editBuilder) => {
			  editBuilder.insert(new vscode.Position(selection.end.line, selection.end.character), `\n${duplicatedLine}`);
		  });
		}
	  });
	
	  context.subscriptions.push(disposable);
}

export function deactivate() {}
