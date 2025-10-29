import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from 'dotenv';
dotenv.config();

// Check if environment variables are set
const token = process.env.AZURE_INFERENCE_SDK_KEY;
const endpoint = process.env.AZURE_INFERENCE_SDK_ENDPOINT;

if (!token) {
  throw new Error("AZURE_INFERENCE_SDK_KEY environment variable is not set. Please check your .env file.");
}

if (!endpoint) {
  throw new Error("AZURE_INFERENCE_SDK_ENDPOINT environment variable is not set. Please check your .env file.");
}

console.log(`Using endpoint: ${endpoint}`);
console.log(`Using token: ${token.slice(0, 4)}...${token.slice(-4)}`);

const client = new ModelClient(
  endpoint,
  new AzureKeyCredential(token)
);

var messages = [
  { role: "system", content: "You are an helpful assistant" },
  { role: "user", content: "What are 3 things to see in Seattle?" },
];

var response = await client.path("/chat/completions").post({
  body: {
    messages: messages,
    max_tokens: 4096,
    temperature: 1,
    top_p: 1,
    model: "gpt-4o-mini",
  },
});

// Check if the response was successful using isUnexpected
if (isUnexpected(response)) {
  console.error("Unexpected response:", response);
  const errorDetails = response.body?.error?.details || "No additional details provided.";
  throw new Error(`Error: ${response.body?.error?.message || "An unexpected error occurred."} Details: ${errorDetails}`);
}

if (
  response.body &&
  response.body.choices &&
  response.body.choices[0] &&
  response.body.choices[0].message
) {
  console.log("AI Response:", response.body.choices[0].message.content);
} else {
  console.error("Response structure is not as expected:", response.body);
  throw new Error("Invalid response structure.");
}
