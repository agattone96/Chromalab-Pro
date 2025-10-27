# Chromalab Assistant Architecture

This document outlines the architecture of the Chromalab Assistant, a context-aware AI module integrated into the Chromalab Pro application.

## Overview

The Chromalab Assistant is designed to act as an AI-powered companion for hair stylists. It analyzes hair color formulas in real-time, provides educational insights, and helps mitigate risks. The assistant is built as a new, layered subsystem that integrates with the existing frontend components and relies on a dedicated (though currently placeholder) backend service for its AI logic.

## Components

### 1. `AssistantPanel.tsx`

-   **Location:** `components/assistant/AssistantPanel.tsx`
-   **Description:** A floating React component that serves as the primary user interface for the assistant.
-   **Features:**
    -   **Collapsible Panel:** Anchored to the bottom-right of the screen, it can be collapsed into an icon or expanded to a full chat interface.
    -   **Conversation History:** Displays the back-and-forth interaction between the stylist and the AI.
    -   **Quick Actions:** Provides one-click buttons for common tasks like "Adjust Developer" or "Suggest Aftercare."
    -   **"Teach Me Why" Mode:** A toggle that, when enabled, instructs the backend to provide more detailed, educational explanations for its recommendations.

### 2. `assistantService.ts`

-   **Location:** `services/assistantService.ts`
-   **Description:** A TypeScript service layer that abstracts all API communication between the frontend and the assistant's backend engine.
-   **Exported Functions:**
    -   `analyzeFormula(formulaData)`: Sends the current `colorPlan` and `hairAnalysis` to the backend for a risk and quality assessment.
    -   `askAssistant(chatData)`: Sends the current conversation history to the backend to get the next AI response.
    -   `getEducationTopic(topic)`: Fetches detailed information on a specific topic from the backend, which is connected to the "Research & Education" data.

### 3. `App.tsx` (Integration)

-   **Location:** `App.tsx`
-   **Description:** The main application component is responsible for managing the state of the `AssistantPanel`.
-   **Integration Logic:**
    -   It renders the `AssistantPanel` and controls its visibility.
    -   The panel is automatically opened whenever a `colorPlan` is created or updated, ensuring the assistant is proactively available.
    -   It passes the `colorPlan` and `hairAnalysis` state down to the `AssistantPanel` as props, providing the necessary context for API calls.

## Data Flow

The data flow is designed to be straightforward, with the `AssistantPanel` acting as the central hub for user interaction and the `assistantService` handling the communication.

1.  **Activation:** A stylist creates or modifies a `colorPlan` in the "Formula Builder" tab.
2.  **State Change:** The `App.tsx` component detects the updated `colorPlan` state and sets the `isAssistantOpen` state to `true`.
3.  **Context Passing:** `App.tsx` passes the `colorPlan` and `hairAnalysis` data as props to the rendered `AssistantPanel`.
4.  **User Interaction:** The stylist interacts with the assistant by typing a message or clicking a "Quick Action" button.
5.  **API Call:** The `AssistantPanel` calls the relevant function from `assistantService.ts` (e.g., `askAssistant`), passing the required data.
6.  **Backend Request:** The service sends a structured JSON request to the appropriate placeholder backend endpoint (e.g., `POST /api/assistant/chat`).
7.  **Response Handling:** The `assistantService` receives the JSON response from the backend.
8.  **UI Update:** The `AssistantPanel` receives the data from the service and updates its state, displaying the new message from the AI in the conversation history.

This architecture ensures that the assistant is a loosely coupled module that enhances the existing application without requiring a major rebuild.
