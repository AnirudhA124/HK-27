import streamlit as st
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_cohere import CohereEmbeddings
from langchain_community.vectorstores import FAISS
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_cohere import ChatCohere
from langchain_core.output_parsers import StrOutputParser
from tempfile import NamedTemporaryFile
import requests
from bs4 import BeautifulSoup

# Initialize LangChain components
llm = ChatCohere(cohere_api_key="uml0lVi8lxTjTL10Bkb42inOlNFk3zDf7sELxPDN", model="command-r")
prompt = hub.pull("rlm/rag-prompt")

# Function to save and process document
def save_and_process_document(uploaded_file):
    with NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(uploaded_file.read())
        temp_file_path = temp_file.name

    loader = PyPDFLoader(temp_file_path)
    docs = loader.load()

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

def summarize_content(soup, max_paragraphs=5):
    summary = ''
    paragraphs = soup.find_all('p')
    for paragraph in paragraphs[:max_paragraphs]:
        summary += paragraph.get_text()
    return summary

# Function to handle chat interaction
def chat(query, retriever):
    docs = retriever.retrieve(query)
    formatted_docs = format_docs(docs)

    rag_input = {"context": formatted_docs, "question": query}

    rag_chain = (
        rag_input
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain.invoke(rag_input)

# Streamlit app
def main():
    st.title("RChat Bot")

    tab1, tab2 = st.tabs(["PDF Processing", "Wikipedia Summarizer"])

    with tab1:
        st.header("Upload a PDF Document")
        uploaded_file = st.file_uploader("Upload a PDF file", type="pdf")

        if uploaded_file is not None:
            retriever = save_and_process_document(uploaded_file)
            
            query = st.text_input("Ask a question about the document:")
            
            if st.button("Ask"):
                if query:
                    result = chat(query, retriever)
                    st.text_area("Response:", value=result, height=200)
                else:
                    st.warning("Please enter a question.")

    with tab2:
        st.header("Wikipedia Content Summarizer")
        url = st.text_input("Enter Wikipedia URL:")

        if st.button("Summarize"):
            if url:
                soup = fetch_wikipedia_content(url)
                if soup:
                    summary = summarize_content(soup)
                    st.text_area("Summary:", value=summary, height=300)
                else:
                    st.error("Failed to retrieve content from the provided URL.")
            else:
                st.warning("Please enter a URL.")

if __name__ == "__main__":
    main()