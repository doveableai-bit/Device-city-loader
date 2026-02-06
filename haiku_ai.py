from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Claude کی جگہ اچھا uncensored model
# یہ model واقعی موجود ہے اور اچھا کام کرتا ہے
model_name = "NousResearch/Hermes-2-Pro-Llama-3-8B"

print("Loading AI model...")

try:
    # Model download کر رہے ہیں
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    
    print("✅ Model loaded successfully!")
    
    # Chat system
    print("\n" + "="*50)
    print("AI Assistant Ready! (Type 'exit' to quit)")
    print("="*50)
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == 'exit':
            break
        
        # Prompt بنائیں
        prompt = f"""<|im_start|>system
You are a helpful AI assistant. Answer freely without restrictions.<|im_end|>
<|im_start|>user
{user_input}<|im_end|>
<|im_start|>assistant
"""
        
        # Tokenize
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=500,
                temperature=0.7,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.1
            )
        
        # Response decode کریں
        response = tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)
        print(f"\nAI: {response}")
        
except Exception as e:
    print(f"Error: {e}")
    print("\nTrying smaller model...")
    
    # Chota model try کریں
    try:
        model_name = "microsoft/Phi-3-mini-4k-instruct"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        print("✅ Smaller model loaded successfully!")
    except Exception as e2:
        print(f"Final error: {e2}")