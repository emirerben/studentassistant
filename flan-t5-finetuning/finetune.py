import json
import os
from transformers import T5ForConditionalGeneration, T5Tokenizer, Trainer, TrainingArguments
from datasets import Dataset

# Load the model and tokenizer
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small")
tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to todo_dataset.json
json_path = os.path.join(current_dir, 'todo_dataset.json')

print("JSON path:", json_path)
# Load the dataset
try:
    with open(json_path, 'r', encoding='utf-8') as f:
        file_contents = f.read()
        print("File contents:", file_contents)  # Debug print
        data = json.loads(file_contents)
except FileNotFoundError:
    print(f"Error: {json_path} file not found")
    exit(1)
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
    print("File contents:", file_contents)  # Print file contents if JSON decoding fails
    exit(1)

# Print the loaded data
print("Loaded data:", data)

# Create the dataset
dataset = Dataset.from_dict({
    'input': [item['input'] for item in data],
    'output': [item['output'] for item in data]
})

# Print the first few examples
print("First few examples:", dataset[:2])

# Preprocess the dataset
def preprocess_function(examples):
    inputs = ["Generate todo list: " + doc for doc in examples["input"]]
    model_inputs = tokenizer(inputs, max_length=512, truncation=True, padding="max_length")
    
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples["output"], max_length=128, truncation=True, padding="max_length")
    
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

processed_dataset = dataset.map(preprocess_function, batched=True)

# Split the dataset
dataset_dict = processed_dataset.train_test_split(test_size=0.2)

# Set up training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=10,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=10,
    evaluation_strategy="steps",
    eval_steps=50,
    save_steps=1000,
    load_best_model_at_end=True,
)

# Create Trainer instance
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset_dict['train'],
    eval_dataset=dataset_dict['test'],
)

# Start training
trainer.train()

# Save the fine-tuned model
model.save_pretrained("./fine_tuned_model")
tokenizer.save_pretrained("./fine_tuned_model")
tokenizer.save_vocabulary("./fine_tuned_model")

# Save tokenizer configuration
tokenizer_config = tokenizer.to_dict()
with open("./fine_tuned_model/tokenizer_config.json", "w") as f:
    json.dump(tokenizer_config, f)

print("Tokenizer configuration saved")

# Add these lines at the end of the file
print("Testing local model loading:")
local_model = T5ForConditionalGeneration.from_pretrained("./fine_tuned_model", local_files_only=True)
local_tokenizer = T5Tokenizer.from_pretrained("./fine_tuned_model", local_files_only=True)
print("Local model loaded successfully")