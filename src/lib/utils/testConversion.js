/**
 * Test script for book conversion output validation
 * Tests the StructureAnalyzer text cleaning from ebfConverter
 */

import { StructureAnalyzer } from "../../../ebfConverter/structureAnalyzer/StructureAnalyzer.js";

// Sample raw text simulating PDF extraction (with artifacts)
const sampleRawText = `════════════════════════════════════════════════════════════
ЛЕГКАЯ ПОКЕРНАЯ МАТЕМАТИКА
════════════════════════════════════════════════════════════


────────────────────────────────────────
ВВЕДЕНИЕ
────────────────────────────────────────


••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••
         — Страница 1 из 36 —
••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••


────────────────────────────────────────
Математика покера – это не ракетостроение .
────────────────────────────────────────


────────────────────────────────────────
Основы вычисления шансов в покере на самом деле очень просты и , единственно ,
требуют знания сложения , вычитания , умножения и деления . И , если вы проходили
это в 5 классе , вы сможете научиться подсчитывать свои шансы в мгновение ока .
────────────────────────────────────────


    2


••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••
         — Страница 2 из 36 —
••• ••• ••• ••• ••• ••• ••• ••• ••• ••• •••


────────────────────────────────────────
ВЫЧИСЛЕНИЕ АУТОВ
────────────────────────────────────────


────────────────────────────────────────
Первый шаг в изучении покерной математики – научиться высчитывать " ауты ".
────────────────────────────────────────


────────────────────────────────────────
" Ауты " – это карты в колоде , которые могут дать вам выигрышную руку . К ним
относятся карты , которые могут выпасть на стол , собирая или улучшая вашу
комбинацию .
────────────────────────────────────────`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
	if (condition) {
		console.log(`  ✓ ${message}`);
		passed++;
	} else {
		console.log(`  ✗ ${message}`);
		failed++;
	}
}

function test(name, fn) {
	console.log(`\n📋 ${name}`);
	try {
		fn();
	} catch (e) {
		console.log(`  ✗ Exception: ${e.message}`);
		failed++;
	}
}

// Clean the sample text using StructureAnalyzer
const analyzer = new StructureAnalyzer();
const cleanText = analyzer.cleanDocumentText(sampleRawText);

// Test 1: Basic cleaning
test("Basic text cleaning", () => {
	assert(cleanText.length > 100, "Cleaned text has substantial content");
	assert(
		cleanText.length < sampleRawText.length,
		"Cleaned text is shorter than raw"
	);
});

// Test 2: Typography cleanup
test("Typography cleanup", () => {
	assert(!cleanText.includes(" ,"), "No spaces before commas");
	assert(!cleanText.includes(" ."), "No spaces before periods");
	assert(!cleanText.includes(" :"), "No spaces before colons");
	assert(!cleanText.includes(' " '), "No spaces inside quotes");
	assert(!cleanText.includes("═══"), "No decorative borders");
	assert(!cleanText.includes("───"), "No decorative borders");
	assert(!cleanText.includes("•••"), "No bullet separators");
	assert(!cleanText.includes("Страница"), "No page numbers");
});

// Test 3: Paragraph structure
test("Paragraph structure", () => {
	const paragraphs = cleanText.split("\n\n").filter((p) => p.trim());

	assert(paragraphs.length > 0, "Has paragraphs");

	// Check paragraph quality
	for (const para of paragraphs) {
		assert(
			para.length > 3,
			`Paragraph has reasonable length: ${para.length} chars`
		);
		assert(!para.includes("═══"), "No borders in paragraph");
		assert(!para.includes("•••"), "No bullets in paragraph");
	}
});

// Test 4: FB2 output simulation
test("FB2 output simulation", () => {
	const fb2Sections = analyzer.renderFb2Sections(cleanText);

	assert(fb2Sections.includes("<p>"), "Has paragraph tags");
	assert(!fb2Sections.includes("═══"), "No borders in FB2");
	assert(!fb2Sections.includes("•••"), "No bullets in FB2");
	assert(!fb2Sections.includes("Страница"), "No page numbers in FB2");
});

// Test 5: HTML output simulation
test("HTML output simulation", () => {
	const html = analyzer.renderHtml(cleanText);

	assert(html.includes("<p>"), "Has paragraph tags");
	assert(!html.includes("═══"), "No borders in HTML");
	assert(!html.includes("•••"), "No bullets in HTML");
});

// Test 6: TXT output
test("TXT output", () => {
	const text = analyzer.renderText(cleanText);

	assert(text.includes("\n\n"), "Has paragraph breaks");
	assert(!text.includes("═══"), "No borders in TXT");
	assert(!text.includes("•••"), "No bullets in TXT");
	assert(!text.includes("Страница"), "No page numbers in TXT");
});

// Summary
console.log("\n" + "=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(50));

if (failed > 0) {
	console.log("\n❌ Some tests failed");
	process.exit(1);
} else {
	console.log("\n✅ All tests passed!");
	process.exit(0);
}
