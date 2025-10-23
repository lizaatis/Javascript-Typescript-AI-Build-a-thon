import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import path from "path";
import FileSystem from "fs";

const token = process.env["GITHUB_TOKEN"];
if (!token) {
  throw new Error("GITHUB_TOKEN environment variable is not set.");
}

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o-mini";

export async function main() {
  console.log("Testing API connection with image input...");

  // Read and encode the image
  const imagePath = path.join(process.cwd(), "contoso_layout_sketch1.jpg");
  const imageBuffer = FileSystem.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString('base64');

  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are a frontend developer." },
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: "Write HTML and CSS code for a web page based on the following hand-drawn sketch"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
        
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: model
    }
  });

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
    console.log(response.body.choices[0].message.content);
  } else {
    console.error("Response structure is not as expected:", response.body);
    throw new Error("Invalid response structure.");
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err.message || err);
});
