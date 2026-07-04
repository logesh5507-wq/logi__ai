# 🤖 Logi_Assist — AI Powered SQL Assistant

An AI SQL Assistant that understands **English, Tamil and Tanglish**, generates SQL from
natural language, fixes broken SQL, explains queries, and can answer questions about
uploaded Excel/CSV/PDF/TXT files — all through a futuristic glassmorphism web UI.

Single project: Spring Boot backend + static HTML/CSS/JS frontend, served together.
Open it in VS Code, run one command, and the whole website works at `http://localhost:8080`.

---

## 1. What you need installed

| Tool | Version | Check with |
|---|---|---|
| Java (JDK) | 21 | `java -version` |
| Maven | 3.9+ (optional — VS Code can build without it) | `mvn -version` |
| VS Code | latest | — |

### VS Code Extensions (install these from the Extensions tab)
- **Extension Pack for Java** (by Microsoft)
- **Spring Boot Extension Pack** (by VMware / Broadcom)

These two give you a "Run" button directly above `main()` in `LogiAssistApplication.java`
and a Spring Boot Dashboard — no need to type Maven commands manually.

---

## 2. Get your FREE Gemini API Key

Logi_Assist uses Google's Gemini API for the actual AI (natural language → SQL) understanding.

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

### Add the key to the project (pick ONE way):

**Option A — Paste directly into the config file (easiest for beginners)**

Open `src/main/resources/application.properties` and replace this line:

```properties
gemini.api.key=${GEMINI_API_KEY:PASTE_YOUR_GEMINI_API_KEY_HERE}
```

with:

```properties
gemini.api.key=AIzaSy_your_actual_key_here
```

**Option B — Environment variable (better for real projects / not committing your key to git)**

Set an environment variable named `GEMINI_API_KEY` before running:

```bash
# Mac/Linux
export GEMINI_API_KEY=AIzaSy_your_actual_key_here

# Windows PowerShell
$env:GEMINI_API_KEY="AIzaSy_your_actual_key_here"
```

---

## 3. Run the project

### Option A — VS Code "Run" button (recommended, no terminal needed)
1. Open this folder (`logi-assist`) in VS Code: **File → Open Folder**
2. Wait a few seconds for the Java extension to detect `pom.xml` and download dependencies (needs internet the first time)
3. Open `src/main/java/com/logiassist/LogiAssistApplication.java`
4. Click the small **▶ Run** button that appears above `public static void main(...)`
5. Wait for the console to show:
   ```
   Logi_Assist is running!
   Open your browser -> http://localhost:8080
   ```
6. Open your browser at **http://localhost:8080**

### Option B — Terminal with Maven installed
```bash
cd logi-assist
mvn spring-boot:run
```

### Option C — Build a runnable JAR
```bash
mvn clean package
java -jar target/logi-assist.jar
```

---

## 4. Using the app

- **Guest mode**: click "Use as Guest" on the login screen — generate/fix/explain SQL instantly, no signup. History and file upload are locked for guests.
- **Sign up**: create a free account to unlock query history and file upload (Excel/CSV/PDF/TXT → ask questions about your data).
- **Ask Logi**: type in English, Tamil, or Tanglish, e.g.:
  - `create student table`
  - `student table create pannu`
  - `மாணவர் அட்டவணையை உருவாக்கு`
  - `student table la marks column add pannu`
- Switch mode with the dropdown next to the mic button: **Generate SQL / Fix SQL Error / Explain SQL**.
- Click the 🎤 mic to speak your request instead of typing.

---

## 5. Project structure

```
logi-assist/
├── pom.xml                          → Maven build file (all dependencies)
├── src/main/java/com/logiassist/
│   ├── LogiAssistApplication.java   → main entry point
│   ├── config/                      → security & app config
│   ├── security/                    → JWT auth
│   ├── controller/                  → REST API endpoints
│   ├── service/                     → business logic + Gemini AI integration
│   ├── model/                       → database entities (User, QueryHistory)
│   ├── repository/                  → JPA repositories
│   └── dto/                         → request/response objects
├── src/main/resources/
│   ├── application.properties       → all configuration (DB, JWT, Gemini key)
│   └── static/                      → the entire frontend (HTML/CSS/JS)
│       ├── index.html
│       ├── css/style.css
│       └── js/ (app.js, api.js, auth.js, voice.js, three-bg.js)
└── data/                             → auto-created H2 database file (persists your data)
```

---

## 6. Database

Uses **H2** (file-based, zero setup — no separate database server needed).
Data is saved automatically to `./data/logiassist.mv.db`.
You can browse it visually at `http://localhost:8080/h2-console` while the app is running
(JDBC URL: `jdbc:h2:file:./data/logiassist`, username `sa`, no password).

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| "Gemini API key not configured" error in the app | You skipped Step 2 — paste your key in `application.properties` |
| Port 8080 already in use | Change `server.port=8080` in `application.properties` to e.g. `8081` |
| VS Code doesn't show the Run button | Make sure "Extension Pack for Java" is installed and wait for it to finish indexing (bottom-right progress bar) |
| Dependencies fail to download | You need an internet connection the first time you open the project (Maven downloads libraries from Maven Central) |

---

## 8. Tech Stack

- **Backend**: Java 21, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, H2 Database, Maven
- **AI**: Google Gemini API (`gemini-2.0-flash`)
- **File parsing**: Apache POI (Excel), OpenCSV (CSV), Apache PDFBox (PDF)
- **Frontend**: HTML5, CSS3 (custom glassmorphism theme), vanilla JavaScript, Bootstrap grid, Three.js (animated background), Web Speech API (voice input)

---

Built with ❤️ for **Logi_Assist** — turning natural thoughts into SQL.
