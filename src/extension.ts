import * as vscode from 'vscode';
import Parser = require('tree-sitter');
import Python = require('tree-sitter-python');
import * as ts from 'typescript';

let decorationType: vscode.TextEditorDecorationType;

function createDecorationType() {
	decorationType = vscode.window.createTextEditorDecorationType({
		after: {
            margin: '0px 10px 0px 0px',
			color: 'grey',
		},
	});
}

const parser = new Parser();
parser.setLanguage(Python);

function calculateCyclomaticComplexity(node: Parser.SyntaxNode): number {
	let complexity = 1;

	function count(node: Parser.SyntaxNode) {
		if (
			node.type === 'if_statement' ||
			node.type === 'for_statement' ||
			node.type === 'while_statement' ||
			node.type === 'with_statement' ||
			node.type === 'try_statement' ||
			node.type === 'except_clause' ||
			node.type === 'elif_clause' ||
			node.type === 'else_clause' ||
			node.type === 'and_operator' ||
			node.type === 'or_operator' ||
			node.type === 'conditional_expression' ||
			node.type === 'case_clause'
		) {
			complexity++;
		}

		for (const child of node.children) {
			count(child);
		}
	}

	count(node);

	return complexity;
}
function analyzePythonCode(tree: Parser.Tree, document: vscode.TextDocument) {
	const functions: Array<{
		name: string;
		range: vscode.Range;
		lineCount: number;
		complexity: number;
	}> = [];

	function visit(node: Parser.SyntaxNode) {
		if (node.type === 'function_definition') {
			const nameNode = node.childForFieldName('name');
			const name = nameNode ? nameNode.text : 'anonymous';
			const startPos = new vscode.Position(
				node.startPosition.row,
				node.startPosition.column
			);
			const endPos = new vscode.Position(
				node.endPosition.row,
				node.endPosition.column
			);
			const range = new vscode.Range(startPos, endPos);
			const lineCount = endPos.line - startPos.line + 1;

			const complexity = calculateCyclomaticComplexity(node);

			functions.push({
				name,
				range,
				lineCount,
				complexity,
			});
		}

		for (const child of node.children) {
			visit(child);
		}
	}

	visit(tree.rootNode);

	return functions;
}
function calculateCyclomaticComplexityJS(node: ts.Node): number {
	let complexity = 1;

	function count(node: ts.Node) {
		if (
			ts.isIfStatement(node) ||
			ts.isForStatement(node) ||
			ts.isWhileStatement(node) ||
			ts.isDoStatement(node) ||
			(ts.isCaseClause(node) && node.statements.length > 0) ||
			ts.isConditionalExpression(node) ||
			(ts.isBinaryExpression(node) &&
				(node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
					node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken))
		) {
			complexity++;
		}
		ts.forEachChild(node, count);
	}

	count(node);

	return complexity;
}

function analyzeJavaScriptCode(sourceFile: ts.SourceFile, document: vscode.TextDocument) {
	const functions: Array<{
		name: string;
		range: vscode.Range;
		lineCount: number;
		complexity: number;
	}> = [];

	function visit(node: ts.Node) {
		if (
			ts.isFunctionDeclaration(node) ||
			ts.isMethodDeclaration(node) ||
			ts.isArrowFunction(node) ||
			ts.isFunctionExpression(node)
		) {
			const name = node.name ? node.name.getText() : 'anonymous';
			const start = node.getStart();
			const end = node.getEnd();
			const startPos = document.positionAt(start);
			const endPos = document.positionAt(end);
			const range = new vscode.Range(startPos, endPos);
			const lineCount = endPos.line - startPos.line + 1;

			const complexity = calculateCyclomaticComplexityJS(node);

			functions.push({
				name,
				range,
				lineCount,
				complexity,
			});
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	return functions;
}

function analyzeDocument(document: vscode.TextDocument) {
	const sourceCode = document.getText();

	// Check the file type based on languageId
	if (document.languageId === 'python') {
		// Parse Python code with tree-sitter
		const tree = parser.parse(sourceCode);
		return analyzePythonCode(tree, document);
	} else if (document.languageId === 'javascript' || document.languageId === 'typescript') {
		// Parse JavaScript/TypeScript code with TypeScript Compiler API
		const sourceFile = ts.createSourceFile(
			document.fileName,
			sourceCode,
			ts.ScriptTarget.Latest,
			true
		);
		return analyzeJavaScriptCode(sourceFile, document);
	}

	return [];
}
function updateDecorations() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	const functions = analyzeDocument(editor.document);
	if (!functions || functions.length === 0) {
		editor.setDecorations(decorationType, []);
		return;
	}

	const decorations: vscode.DecorationOptions[] = functions.map((func) => {
		return {
			range: new vscode.Range(func.range.start, func.range.start),
			renderOptions: {
				after: {
					contentText: `Lines: ${func.lineCount}, Complexity: ${func.complexity}`,
				},
			},
		};
	});

	editor.setDecorations(decorationType, decorations);
}

export function activate(context: vscode.ExtensionContext) {
	createDecorationType();

	if (vscode.window.activeTextEditor) {
		updateDecorations();
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				updateDecorations();
			}
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (
				vscode.window.activeTextEditor &&
				event.document === vscode.window.activeTextEditor.document
			) {
				updateDecorations();
			}
		})
	);
}

export function deactivate() {
	if (decorationType) {
		decorationType.dispose();
	}
}