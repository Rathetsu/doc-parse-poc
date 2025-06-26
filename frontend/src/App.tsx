import React from "react";
import "./App.css";
import DocumentAnalyzer from "./components/DocumentAnalyzer";

const App: React.FC = () => {
	return (
		<div className="App">
			<header className="App-header">
				<h1>📄 Document Parser with AI</h1>
				<p>Upload documents and get AI-powered analysis</p>
			</header>
			<main className="App-main">
				<DocumentAnalyzer />
			</main>
		</div>
	);
};

export default App;
