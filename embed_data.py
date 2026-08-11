import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(SCRIPT_DIR, "data")
KNOWLEDGE_DIR = os.path.join(SCRIPT_DIR, "knowledge")
CHROMA_DB_DIR = os.path.join(SCRIPT_DIR, "chroma_db")


def create_vector_db():

    documents = []

    # -----------------------------
    # Load all PDF files
    # -----------------------------
    print("Loading PDF documents...")

    if not os.path.exists(DATA_DIR):
        print("Error: data folder not found!")
        return

    pdf_count = 0

    for file in os.listdir(DATA_DIR):
        if file.endswith(".pdf"):
            pdf_path = os.path.join(DATA_DIR, file)

            print(f"Loading PDF: {file}")

            loader = PyPDFLoader(pdf_path)
            docs = loader.load()

            documents.extend(docs)
            pdf_count += 1

    print(f"Loaded {pdf_count} PDF file(s).")
    print(f"Total PDF pages loaded: {len(documents)}")

    # -----------------------------
    # Load all Markdown knowledge files
    # -----------------------------
    print("\nLoading knowledge files...")

    if not os.path.exists(KNOWLEDGE_DIR):
        print("Warning: knowledge folder not found.")
    else:

        knowledge_count = 0

        for file in sorted(os.listdir(KNOWLEDGE_DIR)):
            if file.endswith(".md"):

                md_path = os.path.join(KNOWLEDGE_DIR, file)

                print(f"Loading: {file}")

                loader = TextLoader(md_path, encoding="utf-8")
                docs = loader.load()

                documents.extend(docs)
                knowledge_count += 1

        print(f"Loaded {knowledge_count} knowledge document(s).")

    print(f"\nTotal documents loaded: {len(documents)}")

    # -----------------------------
    # Split into chunks
    # -----------------------------
    print("\nSplitting documents into chunks...")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=120
    )

    chunks = text_splitter.split_documents(documents)

    print(f"Created {len(chunks)} text chunks.")

    # -----------------------------
    # Embedding Model
    # -----------------------------
    print("\nLoading HuggingFace Embedding Model...")

    embedding_model = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )

    # -----------------------------
    # Create ChromaDB
    # -----------------------------
    print("\nCreating Chroma Vector Database...")

    vector_db = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=CHROMA_DB_DIR
    )

    print("\nSuccess!")
    print(f"ChromaDB saved at:\n{CHROMA_DB_DIR}")

    # -----------------------------
    # Test Query
    # -----------------------------
    print("\nRunning test query...")

    test_query = (
        "I have a research internship from an NIT but it is unpaid. "
        "Am I still eligible for internship credits?"
    )

    results = vector_db.similarity_search(test_query, k=3)

    print("\n========== TEST RESULTS ==========\n")

    for i, result in enumerate(results):

        print(f"Result {i+1}")
        print("-" * 50)
        print(result.page_content)
        print("-" * 50)

    print("\nVector Database Ready!")


if __name__ == "__main__":
    create_vector_db()