from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI
import os
import json
import random
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = "https://openrouter.ai/api/v1"

client = None
if API_KEY:
    client = OpenAI(
        api_key=API_KEY,
        base_url=BASE_URL
    )
    print(f"OpenAI Client initialized with OpenRouter. Key present: {bool(API_KEY)}")
else:
    print("WARNING: OPENROUTER_API_KEY not found in .env")

# Fallback DB
FALLBACK_DB = {
    "math": [
        {"question": "What is 5 + 5?", "options": ["10", "11", "9", "8"], "correct": 0},
        {"question": "Solve 2x = 8", "options": ["2", "3", "4", "5"], "correct": 2}
    ]
}

def generate_questions_with_openrouter(subject, count=10):
    if not client:
        print("Client not initialized.")
        return []

    try:
        print(f"Requesting {count} questions for {subject} from OpenRouter...")
        
        prompt = f"""
        Generate {count} multiple-choice questions about '{subject}' for a 7th-grade student.
        Return a JSON OBJECT with a single key "questions" containing the list of question objects.
        
        Structure:
        {{
            "questions": [
                {{
                    "question": "...",
                    "options": ["A", "B", "C", "D"],
                    "correct": 0 // index 0-3
                }}
            ]
        }}
        """

        # Using a reliable model ID validated via script
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001", 
            messages=[
                {"role": "system", "content": "You are a helpful educational AI."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            extra_headers={
                "HTTP-Referer": "http://localhost:5000", 
                "X-Title": "Medha Quiz App"
            }
        )

        content = response.choices[0].message.content
        print("Raw AI Response:", content[:200] + "...") # Log first 200 chars

        try:
            data = json.loads(content)
            return data.get("questions", [])
        except json.JSONDecodeError:
            print("JSON Decode Error. Content might not be valid JSON.")
            return []

    except Exception as e:
        print(f"OpenRouter Error: {e}")
        return []

@app.route('/api/questions', methods=['GET'])
def get_questions():
    subject = request.args.get('subject', 'math')
    count = int(request.args.get('count', 10))
    
    print(f"Received request: {count} questions for {subject}")
    
    # 1. Try AI Generation
    ai_questions = generate_questions_with_openrouter(subject, count)
    
    if ai_questions:
        print(f"Successfully generated {len(ai_questions)} questions via AI.")
        return jsonify({
            "subject": subject,
            "source": "openrouter",
            "questions": ai_questions
        })
    
    # 2. Fallback
    print("AI generation failed. Using fallback.")
    pool = FALLBACK_DB.get(subject, FALLBACK_DB.get('math', []))
    selected = (pool * (count // len(pool) + 1))[:count]
    
    return jsonify({
        "subject": subject,
        "source": "fallback",
        "questions": selected
    })

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "Online", "ai_provider": "OpenRouter", "ai_enabled": bool(client)})

if __name__ == '__main__':
    print("Starting Medha AI Game Engine (OpenRouter Powered)...")
    app.run(port=5000, debug=True)
