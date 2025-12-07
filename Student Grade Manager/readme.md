# Grade Nexus – Student Grade Manager

***link for the better verson of this is*** :-
https://darshil-jha-student-manager6543.netlify.app/auth.html

A modern, interactive web application for managing student grades with a sleek glassmorphism UI. Grade Nexus makes it easy to track class performance with real-time calculations and instant visual feedback.

## 🎯 Features

- **Add Students**: Quickly input student names, subjects, and grades through an intuitive form interface
- **Grade Summary**: View key metrics at a glance:
  - Total number of students
  - Class average percentage
  - Overall passing rate
- **Grade Table**: Sortable table displaying each student's details with pass/fail status
- **Remove Entries**: Delete individual student records with a single click
- **Modern Design**: Glassmorphism UI with smooth transitions and responsive layout
- **Real-Time Calculations**: Class statistics update instantly as you add or remove students

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Styling**: CSS3 with glassmorphism effects and modern gradients
- **Storage**: In-memory JavaScript (perfect for learning, extendable to databases)
- **Architecture**: Single Page Application (SPA)

## 📋 Project Structure

```
Student Grade Manager/
├── index.html          # Main HTML structure
├── style.css           # Styling and glassmorphism effects
├── script.js           # JavaScript logic and DOM manipulation
└── README.md           # This file
```

## 🚀 How to Use

1. **Clone or Download** the project files to your local machine
2. **Open `index.html`** in your web browser
3. **Add a Student**:
   - Enter the student's name in the "Student Name" field
   - Enter the subject (e.g., "Mathematics", "Science")
   - Enter the grade (0-100)
   - Click the "Add Student" button
4. **View Statistics**: The summary card displays the updated class metrics
5. **Remove a Student**: Click the remove button in the table row to delete an entry

## 💡 How It Works

### Core Logic

- Each student entry stores: name, subject, and grade
- **Pass Threshold**: Grades ≥ 40% are marked as PASS (configurable)
- **Class Average**: Calculated as the mean of all grades
- **Pass Rate**: Percentage of students who passed
- **DOM Updates**: All changes reflect instantly in the UI without page refresh

### Key Calculations

```javascript
Class Average = Sum of all grades / Number of students
Pass Rate = (Number of passing students / Total students) × 100
Pass Status = grade >= 40 ? "PASS" : "FAIL"
```

## 🎨 UI Components

### Header
- Application title and tagline
- Modern glassmorphism styling with backdrop blur

### Input Form
- Three input fields: Student Name, Subject, Grade
- Add Student button with hover effects
- Input validation for better UX

### Statistics Card
- Displays total students, class average, and pass rate
- Real-time updates on any data change
- Card-style layout with gradient background

### Student Table
- Sortable columns (click headers to sort)
- Pass/Fail badges with color coding (Green for PASS, Red for FAIL)
- Remove button for each entry
- Responsive design

## 🔧 Customization

### Change the Pass Threshold

Edit the pass threshold in `script.js`:

```javascript
const PASS_THRESHOLD = 40; // Change this value (0-100)
```

### Extend Features

- Add **Local Storage** to persist data across browser sessions
- Implement **CSV Export** to download grades
- Add **Grade Statistics**: Min, Max, Median, Standard Deviation
- Create **Filter Options**: Filter by subject or pass/fail status
- Add **Search Functionality**: Find students by name


## 🚦 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of HTML, CSS, and JavaScript (recommended)

### Installation

```bash
# Clone the repository (if using git)
git clone https://github.com/Darshil1532/AI-Learning.git

# Navigate to the project folder
cd "Student Grade Manager"

# Open in browser
open index.html  # macOS
# or
start index.html # Windows
# or
xdg-open index.html # Linux
```

## 🐛 Troubleshooting

**Q: Grades are not calculating correctly**
- A: Ensure all grades are numbers between 0-100. Check the console for errors (F12).

**Q: The table is not displaying**
- A: Make sure JavaScript is enabled in your browser settings.

**Q: Styles look broken**
- A: Clear your browser cache or do a hard refresh (Ctrl+Shift+R).

## 📖 Resources

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Tricks - Glassmorphism](https://css-tricks.com/)
- [JavaScript Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

## 👨‍💻 Author

**Darshil** - VIT Bhopal Student
- Learning: Python, Data Visualization, Web Development
- Exploring modern UI patterns and frontend technologies

---

**Happy Grading! 🎓**
