const messagesContainer = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const clearBtn = document.getElementById("clearBtn");

let messages = [];

function renderMessages() {
  messagesContainer.innerHTML = "";

  if (messages.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "status";
    emptyState.textContent = "Start a conversation...";
    messagesContainer.appendChild(emptyState);
    return;
  }

  messages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `message ${message.role}`;
    bubble.textContent = message.content;
    messagesContainer.appendChild(bubble);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addMessage(role, content) {
  messages.push({ role, content });
  renderMessages();
}

async function sendMessage(content) {
  const trimmed = content.trim();
  if (!trimmed) return;

  addMessage("user", trimmed);
  input.value = "";

  const status = document.createElement("div");
  status.className = "status";
  status.id = "busyStatus";
  status.textContent = "Thinking...";
  messagesContainer.appendChild(status);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages] }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      messages = data.history || messages;
      renderMessages();
    } else {
      addMessage("assistant", data.message || "Sorry, something went wrong.");
    }
  } catch (error) {
    addMessage("assistant", "Unable to reach the server right now.");
  } finally {
    const busyStatus = document.getElementById("busyStatus");
    if (busyStatus) {
      busyStatus.remove();
    }
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await sendMessage(input.value);
});

clearBtn.addEventListener("click", () => {
  messages = [];
  renderMessages();
});

renderMessages();
