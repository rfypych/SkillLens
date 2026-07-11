import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def test_ai():
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_API_BASE")
    model_name = os.getenv("LLM_MODEL_NAME")
    
    print(f"Testing with Model: {model_name}")
    print(f"Base URL: {base_url}")
    
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
        default_headers={"User-Agent": "Mozilla/5.0"}
    )
    
    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say hello in Indonesian!"}
            ],
            max_tokens=50
        )
        print("Success! AI Response:")
        print(response.choices[0].message.content)
    except Exception as e:
        print("Failed to connect to AI Proxy:", str(e))

if __name__ == "__main__":
    asyncio.run(test_ai())
