import os
import signal
import logging
import subprocess
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Replace with your bot token
BOT_TOKEN = "7752173265:AAGCs3wyl4pU5QhG8W0Bvk8faFZAXqz8aW4"

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

# Global variable to store the running process
running_process = None

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Send /run to execute the script.")

async def stop_script(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Stops the running script"""
    global running_process

    if running_process and running_process.poll() is None:  # Check if process is running
        running_process.terminate()  # Send SIGTERM
        running_process.wait()  # Wait for it to stop
        await update.message.reply_text("Script stopped.")
        running_process = None
    else:
        await update.message.reply_text("No script is running.")

async def run_script(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    global running_process

    if running_process and running_process.poll() is None:
        await update.message.reply_text("Script is already running!")
        return

    try:
        running_process = subprocess.Popen(["python3", "final.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        await update.message.reply_text("Script started!")
    except Exception as e:
        await update.message.reply_text(f"Error: {e}")

def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("run", run_script))
    app.add_handler(CommandHandler("stop", stop_script)) 

    print("Bot is running...")
    app.run_polling()

if __name__ == "__main__":
    main()
