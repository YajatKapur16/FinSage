import os
import re
import json
import pdfplumber
import pytesseract
from PIL import Image
import numpy as np
from typing import List, Dict, Any
from dataclasses import dataclass
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor, as_completed
from utils.logging import logger
import datetime
import traceback

@dataclass
class DocumentContent:
    file_name: str
    text: str
    metadata: Dict[str, Any]
    tables: List[List[str]]

class AdvancedDocumentProcessor:
    def __init__(self, output_dir: str = "processed_documents"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        logger.info(f"Initialized AdvancedDocumentProcessor")
        logger.info(f"Output directory set to: {self.output_dir}")

    def extract_content(self, file_path: str) -> DocumentContent:
        logger.info(f"Processing file: {file_path}")
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return self.extract_pdf_content(file_path)
        elif file_extension == '.txt':
            return self.extract_txt_content(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
    def extract_pdf_content(self, pdf_path: str) -> DocumentContent:
        with pdfplumber.open(pdf_path) as pdf:
            metadata = pdf.metadata
            text = ""
            tables = []
            for page in pdf.pages:
                text += page.extract_text() or ""
                tables.extend(page.extract_tables())
            if not text.strip():
                text = self.ocr_page(page)
                
            text = self._basic_formatting(text)
        return DocumentContent(file_name=os.path.basename(pdf_path), text=text, metadata=metadata, tables=tables)
    
    # def extract_pdf_content(self, pdf_path: str) -> DocumentContent:
    #     with pdfplumber.open(pdf_path) as pdf:
    #         metadata = pdf.metadata
            
    #         with ThreadPoolExecutor() as executor:
    #             futures = [executor.submit(self.extract_page_content, page) for page in pdf.pages]
    #             results = [future.result() for future in tqdm(as_completed(futures), total=len(pdf.pages), desc=f"Processing {os.path.basename(pdf_path)}")]
        
    #     text = "".join([r[0] for r in results])
    #     tables = [table for r in results for table in r[1]]
        
    #     logger.info(f"Extracted {len(text)} characters and {len(tables)} tables from {pdf_path}")
    #     return DocumentContent(file_name=os.path.basename(pdf_path), text=text, metadata=metadata, tables=tables)

    def extract_page_content(self, page):
        text = page.extract_text()
        tables = [table for table in page.extract_tables()]
        
        # If no text is extracted, use OCR
        if not text.strip():
            text = self.ocr_page(page)
        
        # Basic formatting
        text = self._basic_formatting(text)
        
        return text, tables

    def ocr_page(self, page):
        with page.to_image() as img:
            img = img.original.convert('L') 
            img = Image.fromarray(255 - np.array(img))
            return pytesseract.image_to_string(img)

    def _basic_formatting(self, text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
        
        return text.strip()

    def extract_txt_content(self, txt_path: str) -> DocumentContent:
        with open(txt_path, 'r', encoding='utf-8') as file:
            text = file.read()
        
        text = self._basic_formatting(text)
        
        tables = self.extract_tables_from_text(text)
        
        logger.info(f"Extracted {len(text)} characters and {len(tables)} tables from {txt_path}")
        return DocumentContent(
            file_name=os.path.basename(txt_path),
            text=text,
            metadata={},
            tables=tables
        )
        
    def clean_text(self, content: DocumentContent) -> DocumentContent:
        logger.info(f"Cleaning extracted text from {content.file_name}")
        
        cleaned_text = self._basic_cleaning(content.text)
        cleaned_text = self._remove_headers_footers(cleaned_text)
        cleaned_text = self._handle_hyphenation(cleaned_text)
        cleaned_text = self._normalize_whitespace(cleaned_text)
        cleaned_text = self._remove_duplicate_sentences(cleaned_text)
        cleaned_text = self._handle_special_characters(cleaned_text)
        cleaned_text = self._preserve_tables(cleaned_text, content.tables)
        
        content.text = cleaned_text
        logger.info(f"Cleaned text from {content.file_name}. New length: {len(cleaned_text)} characters")
        return content

    def _basic_cleaning(self, text: str) -> str:
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\S*@\S*\s?', '', text)
        text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
        return text

    def _remove_headers_footers(self, text: str) -> str:
        lines = text.split('\n')
        cutoff = max(3, int(len(lines) * 0.1))
        top_lines = set(lines[:cutoff])
        bottom_lines = set(lines[-cutoff:])
        repeated_lines = top_lines.intersection(bottom_lines)
        cleaned_lines = [line for line in lines if line.strip() and line not in repeated_lines]
        return '\n'.join(cleaned_lines)

    def _handle_hyphenation(self, text: str) -> str:
        return re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)

    def _normalize_whitespace(self, text: str) -> str:
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()

    def _remove_duplicate_sentences(self, text: str) -> str:
        sentences = sent_tokenize(text)
        unique_sentences = []
        seen = set()
        for sentence in sentences:
            normalized = re.sub(r'\s+', ' ', sentence.lower().strip())
            if normalized not in seen:
                seen.add(normalized)
                unique_sentences.append(sentence)
        return ' '.join(unique_sentences)

    def _handle_special_characters(self, text: str) -> str:
        ligatures = {
            'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl',
            'Ꜳ': 'AA', 'Æ': 'AE', 'Ꜵ': 'AO', 'Ꜷ': 'AU', 'Ꜹ': 'AV', 'Ꜻ': 'AV', 'Ꜽ': 'AY',
            'ꜳ': 'aa', 'æ': 'ae', 'ꜵ': 'ao', 'ꜷ': 'au', 'ꜹ': 'av', 'ꜻ': 'av', 'ꜽ': 'ay'
        }
        for lig, replacement in ligatures.items():
            text = text.replace(lig, replacement)
        text = text.replace('•', '* ')
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        return text

    def _preserve_tables(self, text: str, tables: List[List[str]]) -> str:
        for table in tables:
            table_text = '\n'.join(['\t'.join(row) for row in table])
            text += f"\n\nTABLE:\n{table_text}\n"
        return text
    
    def save_to_json(self, content: DocumentContent) -> str:
        logger.info(f"Saving processed content to JSON: {content.file_name}")
        output_file = os.path.join(self.output_dir, f"{os.path.splitext(content.file_name)[0]}.json")
        
        content_dict = {
            "file_name": content.file_name,
            "text": content.text,
            "metadata": content.metadata,
            "tables": content.tables,
            "processed_at": datetime.now().isoformat()
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(content_dict, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"Saved processed content to {output_file}")
        return output_file

    def process_single_file(self, file_path: str) -> str:
        try:
            content = self.extract_content(file_path)
            json_path = self.save_to_json(content)
            return json_path
        except Exception as e:
            logger.error(f"Failed to process {file_path}: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
        return None

    def process_directory(self, directory: str) -> List[str]:
        logger.info(f"Processing directory: {directory}")
        files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith(('.pdf', '.txt'))]
        
        logger.info(f"Found {len(files)} PDF and TXT files in directory: {directory}")
        
        processed_files = []
        for file in tqdm(files, desc="Overall Progress"):
            result = self.process_single_file(file)
            if result:
                processed_files.append(result)
        
        logger.info(f"Processed {len(processed_files)} files from {directory}")
        return processed_files
    
    def extract_tables_from_text(self, text: str) -> List[List[str]]:
        tables = []
        lines = text.split('\n')
        current_table = []
        in_table = False
        
        for line in lines:
            if '|' in line or '\t' in line:  # Assume lines with | or tabs are part of a table
                if not in_table:
                    in_table = True
                current_table.append(line.split('|' if '|' in line else '\t'))
            elif in_table:
                if current_table:
                    tables.append(current_table)
                current_table = []
                in_table = False
        
        if current_table:  # Add the last table if exists
            tables.append(current_table)
        
        return tables

class DocumentProcessingPipeline:
    def __init__(self, input_dir: str, output_dir: str):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.document_processor = AdvancedDocumentProcessor(output_dir=output_dir)
        self.processed_files_cache = os.path.join(output_dir, "processed_files.json")

    def _load_processed_files(self):
        if os.path.exists(self.processed_files_cache):
            with open(self.processed_files_cache, 'r') as f:
                return set(json.load(f))
        return set()

    def _save_processed_files(self, processed_files):
        with open(self.processed_files_cache, 'w') as f:
            json.dump(list(processed_files), f)

    def run(self) -> List[str]:
        files = [os.path.join(self.input_dir, f) for f in os.listdir(self.input_dir) if f.endswith(('.pdf', '.txt'))]
        processed_files = self._load_processed_files()
        newly_processed_files = []
        
        files_to_process = [f for f in files if f not in processed_files]
        
        with tqdm(total=len(files_to_process), desc="Processing Files") as pbar:
            for file in files_to_process:
                result = self.document_processor.process_single_file(file)
                if result:
                    newly_processed_files.append(result)
                    processed_files.add(file)
                pbar.update(1)
        
        self._save_processed_files(processed_files)
        
        logger.info(f"Processed {len(newly_processed_files)} new files. "
                    f"Total processed files: {len(processed_files)}")
        
        return newly_processed_files