import os
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

if not os.environ.get("GOOGLE_API_KEY"):
    raise ValueError("❌ Error: GOOGLE_API_KEY is missing! Check your .env file.")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DB_DIR = os.path.join(SCRIPT_DIR, "chroma_db")

GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRT7XTSOorTX3nEWVBtw4rKptajGQ68gJDxluiY3VHJNwIifoo5RJd8Va6CB_TLXTB36JFpzWTqS7sX/pub?gid=0&single=true&output=tsv"

app = FastAPI()


def fetch_live_sheet_data(url):
    """Fetches the live TSV from Google Sheets and cleans it into a raw text block."""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            raw_lines = response.text.splitlines()
            cleaned_content = []
            for line in raw_lines:
                clean_line = line.replace('\t', ' ').strip()
                if clean_line:
                    cleaned_content.append(clean_line)
            return "\n".join(cleaned_content)
    except Exception as e:
        print(f"⚠️ Warning: Could not fetch live data from Google Sheets ({e}). Using PDF only.")
    return "No live dynamic data available at the moment."


# ---- Everything below runs ONCE, when the server starts ----
print("Loading embedding model...")
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

print("Loading ChromaDB...")
vector_db = Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=embedding_model)
retriever = vector_db.as_retriever(search_kwargs={"k": 3})

print("Setting up Gemini LLM...")
llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.2)

system_prompt = (
    "You are an intelligent, helpful AI assistant for the college internship portal.\n"
    "Use the following pieces of retrieved context from the official guidelines and the live "
    "updates to answer the student's question.\n"
    "Be a little flexible with vocabulary like incase of typos or misspellings, try to "
    "understand their true intent based on context.\n"
    "CRITICAL: If the live update text contradicts the official PDF guidelines (like changes "
    "in dates or team members), ALWAYS prioritize the LIVE UPDATES.\n\n"
    "[LIVE UPDATES FROM SHEET]:\n{live_sheet_data}\n\n"
    "[OFFICIAL GUIDELINES CONTEXT]:\n{context}\n\n"
    "If you do not know the answer based on both sources, say "
    "'I am sorry, I cannot find that information in the official guidelines.' Do not make up "
    "facts. If required you can say meet the internship coordinator for more information."
)
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])
question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

print("✅ RAG pipeline ready. API is live.")
# ---- End of one-time setup ----


class ChatRequest(BaseModel):
    message: str


@app.post("/ask")
def ask(req: ChatRequest):
    if not req.message.strip():
        return {"error": "Message cannot be empty."}

    # Fetched fresh on every request, since this data changes independently of the PDF
    live_updates = fetch_live_sheet_data(GOOGLE_SHEET_CSV_URL)

    response = rag_chain.invoke({
        "input": req.message,
        "live_sheet_data": live_updates,
    })
    return {"reply": response["answer"]}