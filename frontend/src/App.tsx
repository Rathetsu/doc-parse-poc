import React from "react";
import "./App.css";
import DocumentAnalyzer from "./components/DocumentAnalyzer";
import Footer from "./components/Footer";

const App: React.FC = () => {
	return (
		<div className="App">
			<header className="App-header">
				<h1>Docling POC for document parsing</h1>
				<p>Upload documents, and get structured output for AI analysis.</p>
			</header>
			<main className="App-main">
				<DocumentAnalyzer />
			</main>
			<Footer />
		</div>
	);
};

export default App;
