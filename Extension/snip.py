from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import pytesseract
import io
import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_fireworks import ChatFireworks
from langchain_core.output_parsers import StrOutputParser
from tempfile import NamedTemporaryFile

app = Flask(__name__)
CORS(app)

# Initialize LangChain components
llm = ChatFireworks(api_key="0YdGG4CL6KUAgR5v207G4kBb2rWvNkXoLDbyrHxc89ag3PVt", model="accounts/fireworks/models/llama-v3-70b-instruct")
embeddings = CohereEmbeddings(cohere_api_key="uml0lVi8lxTjTL10Bkb42inOlNFk3zDf7sELxPDN", model="embed-english-light-v3.0")
prompt = hub.pull("chaiboi/snip_prompt", api_key='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')

# Global variable to store retriever
retriever = None

def image_to_text(image_file):
    image = Image.open(image_file)
    text = pytesseract.image_to_string(image)
    return text

def process_text(text):
    with NamedTemporaryFile(delete=False, mode='w', encoding='utf-8', suffix='.txt') as temp_file:
        temp_file.write(text)
        temp_file_path = temp_file.name

    loader = TextLoader(temp_file_path, encoding='utf-8')
    docs = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1100, chunk_overlap=150)
    splits = text_splitter.split_documents(docs)

    db = FAISS.from_documents(splits, embeddings)
    global retriever
    retriever = db.as_retriever(search_kwargs={"k": 4})

    os.unlink(temp_file_path)  # Delete the temporary file

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def chat(query, retriever):
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain.invoke(query)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    try:
        text = image_to_text(image_file)
        process_text(text)
        return jsonify({"message": "Image processed successfully", "text": text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat_route():
    global retriever
    data = request.get_json()
    question = data.get('message', '')
    
    if question and retriever:
        response = chat(question, retriever)
        return jsonify({'response': response})
    
    return jsonify({'error': 'No question provided or data not available'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)