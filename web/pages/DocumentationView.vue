<template>
  <div class="documentation-container">
    <vue-markdown-render :source="documentationContent" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VueMarkdownRender from 'vue-markdown-render';

const documentationContent = ref('');

onMounted(async () => {
  try {
    const response = await fetch('/documentation/pages/documentation.md');
    let content = await response.text();
    
    // Correct image paths
    content = content.replace(/!\[Screenshot\]\(([^)]+)\)/g, (match, p1) => {
      return `![Screenshot](/documentation/pages/${p1})`;
    });
    
    // Remove file names
    content = content.replace(/^[A-Za-z]+\n+(?=# )/gm, '');
    
    documentationContent.value = content;
  } catch (error) {
    console.error('Error loading documentation:', error);
    documentationContent.value = 'Error loading documentation.';
  }
});
</script>

<style>
.documentation-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  font-family: "Times New Roman", Times, serif;
  font-size: 12pt;
  line-height: 1.5;
  color: #000000;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.documentation-container h1 {
  font-size: 24pt;
  font-weight: bold;
  margin-top: 24pt;
  margin-bottom: 12pt;
  color: #000000;
  border-bottom: 1px solid #000000;
  padding-bottom: 6pt;
}

.documentation-container h2 {
  font-size: 18pt;
  font-weight: bold;
  margin-top: 18pt;
  margin-bottom: 9pt;
  color: #000000;
}

.documentation-container h3 {
  font-size: 14pt;
  font-weight: bold;
  margin-top: 14pt;
  margin-bottom: 7pt;
  color: #000000;
}

.documentation-container p {
  margin-bottom: 12pt;
  text-align: justify;
}

.documentation-container img {
  max-width: 100%;
  height: auto;
  margin: 12pt 0;
  border: 1px solid #cccccc;
}

.documentation-container ul, .documentation-container ol {
  margin-bottom: 12pt;
  padding-left: 24pt;
}

.documentation-container li {
  margin-bottom: 6pt;
}

.documentation-container code {
  font-family: "Courier New", Courier, monospace;
  background-color: #f4f4f4;
  padding: 2pt 4pt;
  border-radius: 3px;
  font-size: 10pt;
}

.documentation-container pre {
  background-color: #f4f4f4;
  padding: 12pt;
  overflow-x: auto;
  border-radius: 3px;
  border: 1px solid #cccccc;
  margin-bottom: 12pt;
}

.documentation-container table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12pt;
}

.documentation-container th, .documentation-container td {
  border: 1px solid #cccccc;
  padding: 8pt;
  text-align: left;
}

.documentation-container th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.documentation-container blockquote {
  margin: 12pt 24pt;
  padding-left: 12pt;
  border-left: 4px solid #cccccc;
  font-style: italic;
}

.documentation-container hr {
  border: none;
  border-top: 1px solid #cccccc;
  margin: 24pt 0;
}

@media print {
  .documentation-container {
    box-shadow: none;
    padding: 0;
  }
}
</style>