from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
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

llm = ChatFireworks(api_key="0YdGG4CL6KUAgR5v207G4kBb2rWvNkXoLDbyrHxc89ag3PVt", model="accounts/fireworks/models/llama-v3-70b-instruct")
prompt = hub.pull("chaiboi/pdf_text_prompt", api_key='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')

# Global variable to store responses
url_store = ""

def save_and_process_document(uploaded_file_path):
    # Load the document with specified encoding
    loader = TextLoader(uploaded_file_path, encoding='utf-8')
    docs = loader.load()
    print(docs)
    embeddings_model = CohereEmbeddings(cohere_api_key="uml0lVi8lxTjTL10Bkb42inOlNFk3zDf7sELxPDN",
                                        model="embed-english-light-v3.0")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1100, chunk_overlap=150)
    splits = text_splitter.split_documents(docs)

    db = FAISS.from_documents(splits, embeddings_model)
    retriever = db.as_retriever(kwargs={"score_threshold": 0.5})

    return retriever

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def fetch_wikipedia_content(url):
    response = requests.get(url)
    if response.status_code == 200:
        page_content = response.content
        soup = BeautifulSoup(page_content, 'html.parser')
        return soup
    else:
        return None

def summarize_content(soup):
    summary = ''
    paragraphs = soup.find_all('p')
    for paragraph in paragraphs:
        summary += paragraph.get_text()

    # Save the summary to a temporary file
    with NamedTemporaryFile(delete=False, suffix=".txt", mode='w', encoding='utf-8') as temp_file:
        temp_file.write(summary)
        temp_file_path = temp_file.name

    return temp_file_path

# Function to handle chat interaction
def chat(query, retriever):
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain.invoke(query)

@app.route('/')
def index():
    return "Hello world"


@app.route('/process_url', methods=['POST'])
def process_url():
    global url_store
    data = request.get_json()
    url = data.get('url')
    print(f"Received URL: {url}")  # Debug output
    if url:
        url_store=""
        url_store = url  # Store the URL
        return jsonify({'success': True, 'text': url})
    return jsonify({'success': False, 'text': ''}), 400

@app.route('/chat', methods=['POST'])
def chat_route():
    global url_store
    data = request.get_json()
    question = data.get('question')
    print(f"Received question: {question}")  # Debug output
    if question and url_store:
        # Fetch the content from the stored URL
        soup = fetch_wikipedia_content(url_store)
        if soup:
            temp_file_path = summarize_content(soup)
            retriever = save_and_process_document(temp_file_path)
            response = chat(question, retriever)
            print(f"Returning response: {response}")  # Debug output
            return jsonify({'answer': response})
    return jsonify({'error': 'No question provided or URL missing'}), 400

if __name__ == '__main__':
    app.run(debug=True)