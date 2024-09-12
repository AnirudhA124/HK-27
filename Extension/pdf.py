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
from pptx import Presentation
from langchain_core.documents import Document  # Assuming you're using Document from Langchain.



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
        # Determine file type based on file extension
        file_extension = file.filename.split('.')[-1].lower()
        print(file_extension)
        # Save the file to a temporary location
        if file_extension in ['pdf', 'ppt', 'pptx']:
            with NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name
                print(temp_file_path)
                # Handle PDF files
                if file_extension == 'pdf':
                    loader = PyPDFLoader(temp_file_path)
                    docs = loader.load()
                    print(docs)
                
                # Handle PowerPoint files
                elif file_extension in ['ppt', 'pptx']:
                    docs = load_ppt_text(temp_file_path)

                # Process the documents (both PDF and PPT use the same logic)
                embeddings_model = CohereEmbeddings(cohere_api_key="uml0lVi8lxTjTL10Bkb42inOlNFk3zDf7sELxPDN",
                                                    model="embed-english-light-v3.0")
                text_splitter = RecursiveCharacterTextSplitter(chunk_size=1100, chunk_overlap=150)
                splits = text_splitter.split_documents(docs)

                db = FAISS.from_documents(splits, embeddings_model)
                return jsonify({'fileId': temp_file.name})

        return jsonify({'error': 'Unsupported file type'}), 400

    return jsonify({'error': 'File upload failed'}), 500

# Helper function to load text from a PowerPoint file
def load_ppt_text(ppt_path):
    """Extract text from a PowerPoint file and return as document objects."""
    prs = Presentation(ppt_path)
    docs = []
    
    # Iterate over each slide in the PowerPoint
    for idx, slide in enumerate(prs.slides):
        slide_text = []
        # Extract text from each shape in the slide
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                slide_text.append(shape.text)
        
        # Combine all text on the slide
        full_slide_text = "\n".join(slide_text)
        
        # Append the slide text as a Document object, with metadata for the slide number and file path
        docs.append(Document(metadata={'source': ppt_path, 'page': idx}, page_content=full_slide_text))
    
    return docs

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