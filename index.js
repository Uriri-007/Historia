import { GoogleGenerativeAI } from "@google/generative-ai";
import inquirer from "inquirer";
import chalk from "chalk";
import 'dotenv/config'; 

// --- Configuration ---
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Note: Using 1.5 flash as 2.5 is not yet in public GA

/**
 * Historia CLI Logic
 */
async function runHistoria() {
  console.clear();
  console.log(chalk.bold.cyan("========================================"));
  console.log(chalk.bold.white("       Welcome to HISTORIA CLI        "));
  console.log(chalk.italic.gray("    Your automated report assistant    "));
  console.log(chalk.bold.cyan("========================================\n"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "topic",
      message: "What topic would you like a report on?",
      validate: (input) => (input ? true : "Please enter a topic."),
    },
    {
      type: "list",
      name: "tone",
      message: "Select the tone of the report:",
      choices: ["Professional", "Informative", "Academic", "Creative"],
    },
    {
      type: "confirm",
      name: "confirmAction",
      message: (prev) => `Generate a ${prev.tone} report on "${prev.topic}"?`,
      default: true,
    },
  ]);

  if (!answers.confirmAction) {
    console.log(chalk.red("\nOperation cancelled. See you next time!"));
    return;
  }

  // --- Generation Logic ---
  console.log(chalk.yellow("\n[Historia is thinking... Please wait]"));

  const prompt = `Write a comprehensive, well-structured report about ${answers.topic}. 
                  The tone should be ${answers.tone}. 
                  Include headings, an introduction, and a conclusion.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(chalk.green("\n--- REPORT GENERATED ---"));
    console.log(chalk.white(text));
    console.log(chalk.green("\n------------------------"));
    
    // Final interaction
    const { exit } = await inquirer.prompt([
      {
        type: "confirm",
        name: "exit",
        message: "Would you like to generate another report?",
        default: false,
      },
    ]);

    if (exit) {
      runHistoria();
    } else {
      console.log(chalk.cyan("Thank you for using Historia. Goodbye!"));
    }

  } catch (error) {
    console.error(chalk.red("\nError generating report:"), error.message);
  }
}

// Start the bot
runHistoria();
