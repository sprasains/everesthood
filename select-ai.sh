#!/bin/bash

# Clears the API_KEY environment variable for the current session
unset API_KEY

echo "Select AI Service"
echo "Choose an AI service to connect to:"
select choice in "Google" "Gemini" "Google AI Studio"; do
  case $REPLY in
    1) echo "You have selected Google."; break ;;
    2) echo "You have selected Gemini."; break ;;
    3) echo "You have selected Google AI Studio."; break ;;
    *) echo "Invalid option. Try again." ;;
  esac
done 