# SIMPLE AI CHAT PROGRAM
# Yeh bilkul kaam karega!

print("🎯 AI CHAT PROGRAM STARTING...")
print("="*50)

# Sab se pehle check karte hain
print("\n1️⃣ Checking Python setup...")
try:
    import sys
    print(f"✅ Python version: {sys.version[:7]}")
except:
    print("❌ Python not working")

print("\n2️⃣ Checking libraries...")
try:
    import torch
    print("✅ PyTorch installed")
except:
    print("⚠️ PyTorch not found")

print("\n3️⃣ Loading AI...")

# Simple function jo har kisi ke liye kaam kare
def simple_ai():
    print("\n" + "="*50)
    print("💬 CHAT STARTED!")
    print("Type 'exit' to quit")
    print("="*50)
    
    chat_history = []
    
    while True:
        # User input
        user_text = input("\nYou: ")
        
        # Exit condition
        if user_text.lower() == 'exit':
            print("\nAI: Goodbye! 👋")
            break
        
        # AI response
        if "hello" in user_text.lower() or "hi" in user_text.lower():
            response = "Hello! How can I help you today?"
        elif "name" in user_text.lower():
            response = "I'm AI Assistant. What's your name?"
        elif "how are you" in user_text.lower():
            response = "I'm good, thank you! How about you?"
        elif "weather" in user_text.lower():
            response = "I think the weather is nice today!"
        elif "time" in user_text.lower():
            from datetime import datetime
            current_time = datetime.now().strftime("%H:%M:%S")
            response = f"Current time is {current_time}"
        else:
            responses = [
                "That's interesting! Tell me more.",
                "I understand. What else would you like to know?",
                "Thanks for sharing that with me.",
                "I'm learning from our conversation!",
                "Can you explain that a bit more?"
            ]
            import random
            response = random.choice(responses)
        
        print(f"\nAI: {response}")
        
        # Chat history save karein
        chat_history.append(f"You: {user_text}")
        chat_history.append(f"AI: {response}")

# Program run karein
if __name__ == "__main__":
    simple_ai()
    
    print("\n" + "="*50)
    print("📊 Program finished successfully!")
    print("="*50)
    input("Press Enter to exit...")
    