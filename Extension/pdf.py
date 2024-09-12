from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_fireworks import ChatFireworks
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain import hub
from tempfile import NamedTemporaryFile

app = Flask(__name__)
CORS(app)

# Set your Cohere API key
llm = ChatFireworks(api_key="0YdGG4CL6KUAgR5v207G4kBb2rWvNkXoLDbyrHxc89ag3PVt", model="accounts/fireworks/models/llama-v3-70b-instruct")
prompt = hub.pull("chaiboi/pdf_text_prompt", api_key='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')
db = None  # Global variable to hold the database

@app.route('/')
def index():
    return "Hello world"

@app.route('/upload', methods=['POST'])
def upload():
    global db
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file:
        with NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name

            loader = PyPDFLoader(temp_file_path)
            docs = loader.load()

            embeddings_model = CohereEmbeddings(cohere_api_key="uml0lVi8lxTjTL10Bkb42inOlNFk3zDf7sELxPDN",
                                                model="embed-english-light-v3.0")

            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1100, chunk_overlap=150)
            splits = text_splitter.split_documents(docs)

            db = FAISS.from_documents(splits, embeddings_model)
            print(temp_file.name)
            return jsonify({'fileId': temp_file.name})


    return jsonify({'error': 'File upload failed'}), 500

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@app.route('/chat', methods=['POST'])
def chat():
    global db
    data = request.get_json()
    user_message = data.get('message', '')
    file_id = data.get('fileId', '')

    if not db:
        return jsonify({'response': "No documents uploaded or processed."}), 400
    # Handle the message and file_id
    retriever = db.as_retriever(kwargs={"score_threshold": 0.5})
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    try:
        bot_response = rag_chain.invoke(user_message)
    except Exception as e:
        print(f"Error: {e}")
        bot_response = "Sorry, I encountered an error while processing your request."

    return jsonify({'response': bot_response})

if __name__ == '__main__':
    app.run(debug=True)