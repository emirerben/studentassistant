from transformers import T5ForConditionalGeneration, AutoTokenizer
from huggingface_hub import HfApi
import os

# Set your Hugging Face username and model name
hf_username = "emirerben"
model_name = "flan-t5-finetuning"

# Load your fine-tuned model and tokenizer
model_path = "./fine_tuned_model"

print(f"Loading model from {model_path}")
print("Model directory contents:", os.listdir(model_path))

# Load the model
model = T5ForConditionalGeneration.from_pretrained(model_path)
print("Model loaded successfully")

# Load the tokenizer using AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained(model_path, use_fast=False)
print("Tokenizer loaded successfully")

# Create a new repository on Hugging Face
api = HfApi()
repo_url = api.create_repo(repo_id=f"{hf_username}/{model_name}", exist_ok=True)

# Push the model and tokenizer to Hugging Face
model.push_to_hub(f"{hf_username}/{model_name}")
tokenizer.push_to_hub(f"{hf_username}/{model_name}")

print(f"Model published to: https://huggingface.co/{hf_username}/{model_name}")
