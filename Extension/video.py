import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import assemblyai as aai
from moviepy.editor import VideoFileClip
import logging

# LangChain and RAG imports
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_fireworks import ChatFireworks
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain import hub

# Flask app and configuration
app = Flask(__name__)
CORS(app)

# Set your AssemblyAI and Cohere API keys
ASSEMBLYAI_API_KEY = '63523cf4483f46e880edaac2465f4811'
aai.settings.api_key = ASSEMBLYAI_API_KEY

# Initialize Cohere API key and model
llm = ChatFireworks(api_key="0YdGG4CL6KUAgR5v207G4kBb2rWvNkXoLDbyrHxc89ag3PVt", model="accounts/fireworks/models/llama-v3-70b-instruct")
prompt = hub.pull("chaiboi/pdf_text_prompt", api_key='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')


db = None  # Global variable to hold the FAISS database

ALLOWED_EXTENSIONS = {'mp4', 'mp3'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return "Hello world"

@app.route('/upload', methods=['POST'])
def upload_file():
    global db
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file and allowed_file(file.filename):
        try:
            # Process the file in-memory using BytesIO
            logging.debug(f"Processing file: {file.filename}")
            file_stream = io.BytesIO(file.read())

            # Save BytesIO stream to a temporary file for video
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video_file:
                temp_video_file.write(file_stream.getbuffer())
                temp_video_file_path = temp_video_file.name

            # Extract audio from video using MoviePy and save it to a temporary file
            with VideoFileClip(temp_video_file_path) as video:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio_file:
                    video.audio.write_audiofile(temp_audio_file.name)
                    temp_audio_file_path = temp_audio_file.name

            # Transcribe the audio file using AssemblyAI
            logging.debug("Transcribing audio file")
            transcriber = aai.Transcriber()
            transcript = transcriber.transcribe(temp_audio_file_path)

            # Get the transcription text
            transcription = transcript.text
            logging.debug(f"Transcription: {transcription}")

            # Save the transcription to a temporary text file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.txt') as temp_text_file:
                temp_text_file.write(transcription.encode('utf-8'))
                temp_text_file_path = temp_text_file.name

            # Process the transcription for RAG
            text_loader = TextLoader(temp_text_file_path)
            docs = text_loader.load()

            embeddings_model = CohereEmbeddings(cohere_api_key='uml0lVi8lxTjTL10Bkb42inOlNFk3zDf7sELxPDN', model="embed-english-light-v3.0")
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1100, chunk_overlap=150)
            splits = text_splitter.split_documents(docs)

            db = FAISS.from_documents(splits, embeddings_model)

            # Clean up temporary files
            os.remove(temp_video_file_path)
            os.remove(temp_audio_file_path)
            os.remove(temp_text_file_path)

            return jsonify({'transcription': transcription}), 200
        except Exception as e:
            logging.error(f"Error during transcription: {e}")
            return jsonify({'error': str(e)}), 500

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@app.route('/chat', methods=['POST'])
def chat():
    global db
    data = request.get_json()
    user_message = data.get('message', '')

    if not db:
        return jsonify({'response': "No document database available."}), 400

    if not user_message:
        return jsonify({'response': "No message provided."}), 400

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
        logging.error(f"Error during RAG processing: {e}")
        bot_response = "Sorry, I encountered an error while processing your request."

    return jsonify({'response': bot_response})

if __name__ == '__main__':
    app.run(debug=True)