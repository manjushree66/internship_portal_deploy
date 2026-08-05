import os
import requests
import csv
from io import StringIO
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DB_DIR = os.path.join(SCRIPT_DIR, "chroma_db")
load_dotenv()

if not os.environ.get("GOOGLE_API_KEY"):
    raise ValueError("❌ Error: GOOGLE_API_KEY is missing! Make sure your .env file is set up correctly.")

# paste your Google Sheet published CSV URL here
GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRT7XTSOorTX3nEWVBtw4rKptajGQ68gJDxluiY3VHJNwIifoo5RJd8Va6CB_TLXTB36JFpzWTqS7sX/pub?gid=0&single=true&output=tsv"

def fetch_live_sheet_data(url):
    """Fetches the live TSV from Google Sheets and cleans it into a raw text block."""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            # Split the document by lines
            raw_lines = response.text.splitlines()
            
            cleaned_content = []
            for line in raw_lines:
                # Replace tabs with regular spaces so it reads like a normal sentence
                clean_line = line.replace('\t', ' ').strip()
                # Ignore completely blank lines
                if clean_line:
                    cleaned_content.append(clean_line)
            
            # Combine everything back into one massive string block
            return "\n".join(cleaned_content)
            
    except Exception as e:
        print(f"⚠️ Warning: Could not fetch live data from Google Sheets ({e}). Using PDF only.")
    return "No live dynamic data available at the moment."

def run_chatbot():
    print("Initializing Embedding Model and loading ChromaDB...")
    embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    chroma_db_dir = CHROMA_DB_DIR
    vector_db = Chroma(
        persist_directory=chroma_db_dir, 
        embedding_function=embedding_model
    )
    
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})

    print("Setting up Gemini LLM...")
    llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.2)

    # Modified system prompt to accept dynamic sheet data alongside vector context
    system_prompt = (
        "You are an intelligent, helpful AI assistant for the college internship portal.\n"
        "Use the following pieces of retrieved context from the official guidelines and the live updates to answer the student's question.\n"
        "Be a little flexible with vocabulary like incase of typos or misspellings try to understand their true intent based on context.\n"
        
        "CRITICAL: If the live update text contradicts the official PDF guidelines (like changes in dates or team members), ALWAYS prioritize the LIVE UPDATES.\n\n"
        
        "[LIVE UPDATES FROM SHEET]:\n{live_sheet_data}\n\n"
        "[OFFICIAL GUIDELINES CONTEXT]:\n{context}\n\n"
        
        "If you do not know the answer based on both sources, say "
        "'I am sorry, I cannot find that information in the official guidelines.' Do not make up facts. If required you can say meet the internship coordinator for more information."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    print("Chatbot system is live! Type 'exit' to quit.\n")
    
    while True:
        user_question = input("Student: ")
        if user_question.lower() == 'exit':
            break
            
        if not user_question.strip():
            continue
            
        print("Bot is thinking...")
        
        # Pull the absolute freshest data from the sheet right before answering
        live_updates = fetch_live_sheet_data(GOOGLE_SHEET_CSV_URL)
        
        # Inject both user input AND the dynamic sheet text into the chain execution
        response = rag_chain.invoke({
            "input": user_question,
            "live_sheet_data": live_updates
        })
        
        print(f"\nAI Assistant: {response['answer']}\n")
        print("-" * 50)

    # Modifying the bottom of your chat.py
if __name__ == "__main__":
    import sys
    user_question=""
    # If Node.js passes a message as an argument, process it directly instead of looping
    if len(sys.argv) > 1:
        user_question = sys.argv[1]
    elif not sys.stdin.isatty():
        # If piped via Node.js standard input (like child_process stdin.write)
        user_question = sys.stdin.read().strip()

    # 2. If we caught an input from Node.js/External source, run the web process
    if user_question:
        # Fetch the live updates first
        live_updates = fetch_live_sheet_data(GOOGLE_SHEET_CSV_URL)    

        system_prompt = ("You are an intelligent, helpful AI assistant for the college internship portal.\n"
            "Use the following pieces of retrieved context from the official guidelines and the live updates to answer the student's question.\n"
            "Be a little flexible with vocabulary like incase of typos or misspellings try to understand their true intent based on context.\n"
            "Always remember there are only even credits alloted, there is no 1 credit system and the last sem internship incase they have not done any before they can split it as 4 credits in one company and other 4 in another company.\n\n"
            
            "CRITICAL: If the live update text contradicts the official PDF guidelines (like changes in dates or team members), ALWAYS prioritize the LIVE UPDATES.\n\n"
            
            f"[LIVE UPDATES FROM SHEET]:\n{live_updates}\n\n"
            "[OFFICIAL GUIDELINES CONTEXT]:\n{context}\n\n"
            
            "If you do not know the answer based on both sources, say "
            "'I am sorry, I cannot find that information in the official guidelines.' Do not make up facts. If required you can say meet the internship coordinator for more information."
        )
        # Initialize components silently (hide print steps if needed)
        embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_db = Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=embedding_model)
        retriever = vector_db.as_retriever(search_kwargs={"k": 3})
        llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.2)

        prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "{input}")])
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)

        # Invoke once and print just the clean answer string for Node.js
        response = rag_chain.invoke({"input": user_question,"live_sheet_data":live_updates})
        print(response['answer'])
        
    else:
        # Fallback to your original interactive terminal loop if run manually
        run_chatbot()