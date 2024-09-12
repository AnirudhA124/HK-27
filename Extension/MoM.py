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

# Initialize LangChain components
llm = ChatFireworks(api_key="0YdGG4CL6KUAgR5v207G4kBb2rWvNkXoLDbyrHxc89ag3PVt", model="accounts/fireworks/models/llama-v3-70b-instruct")
embeddings = CohereEmbeddings(cohere_api_key="uml0lVi8lxTjTL10Bkb42inOlNFk3zDf7sELxPDN", model="embed-english-light-v3.0")
prompt = hub.pull("chaiboi/text_file_prompt", api_key='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')

def process_extracted_data(extracted_data):
    texts = [entry['personTranscript'] for entry in extracted_data]
    combined_text = " ".join(texts)  # Combine all texts into a single string
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1100, chunk_overlap=150)
    splits = text_splitter.split_text(combined_text)

    # Initialize FAISS index
    db = FAISS.from_texts(splits, embeddings)
    retriever = db.as_retriever(search_kwargs={"k": 4})
    return retriever

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

@app.route('/receive_transcript', methods=['POST'])
def receive_transcript():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    
    if data is None:
        app.logger.error("Failed to parse JSON data")
        return jsonify({"error": "Invalid JSON"}), 400
    
    # Extracting the transcript information
    transcript_data = data.get('transcript', [])
    extracted_data = []

    for entry in transcript_data:
        timestamp = entry.get('timeStamp', 'N/A')
        person_name = entry.get('personName', 'Unknown')
        person_transcript = entry.get('personTranscript', '')
        
        extracted_data.append({
            'timestamp': timestamp,
            'personName': person_name,
            'personTranscript': person_transcript
        })

    # Process the extracted data for RAG
    retriever = process_extracted_data(extracted_data)
    
    # Generate response
    question = "Give MoM"
    response = chat(question, retriever)
    
    # Save response to file
    with open('mom_response.txt', 'w') as f:
        f.write(response)
    
    app.logger.info(f"Response generated and saved to mom_response.txt")
    return jsonify({"message": "Transcript received and processed successfully", "response": response}), 200

@app.route('/chat', methods=['POST'])
def chat_route():
    return jsonify({'message': 'Please use /receive_transcript endpoint to process transcripts and generate responses.'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Specify the port if needed