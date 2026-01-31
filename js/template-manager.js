// Template Manager for AppForge
class TemplateManager {
    constructor() {
        this.utils = window.utils;
        this.templates = this.getDefaultTemplates();
        this.favorites = new Set();
        this.init();
    }

    init() {
        this.loadTemplates();
        this.loadFavorites();
        this.renderTemplates();
    }

    getDefaultTemplates() {
        return [
            {
                id: 'blank',
                name: 'Blank App',
                description: 'Start with a clean slate',
                category: 'basic',
                preview: '✨',
                code: `<!DOCTYPE html><html><head><title>My App</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,sans-serif;padding:20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center;}.container{max-width:800px;margin:0 auto;padding:30px;background:rgba(255,255,255,0.1);border-radius:20px;backdrop-filter:blur(10px);}h1{font-size:2.5em;margin-bottom:20px;}p{font-size:1.2em;line-height:1.6;}</style></head><body><div class="container"><h1>Welcome to Your App</h1><p>This is a sample app created with AppForge.</p><button onclick="alert('Hello!')" style="padding:12px 24px;background:white;color:#667eea;border:none;border-radius:10px;font-size:1.1em;cursor:pointer;margin-top:20px;">Click Me</button></div></body></html>`
            },
            {
                id: 'todo',
                name: 'Todo List',
                description: 'Task management app',
                category: 'productivity',
                preview: '📝',
                code: `<!DOCTYPE html><html><head><title>Todo App</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);min-height:100vh;padding:20px;}.container{max-width:500px;margin:0 auto;background:white;border-radius:20px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,0.2);}h1{color:#333;text-align:center;margin-bottom:30px;}.input-group{display:flex;gap:10px;margin-bottom:30px;}#todoInput{flex:1;padding:15px;border:2px solid #e0e0e0;border-radius:10px;font-size:1em;outline:none;transition:border-color 0.3s;}#todoInput:focus{border-color:#f5576c;}#addBtn{background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;border:none;padding:15px 25px;border-radius:10px;font-size:1em;cursor:pointer;transition:transform 0.3s;}#addBtn:hover{transform:scale(1.05);}.todo-list{list-style:none;}.todo-item{background:#f8f9fa;padding:15px;border-radius:10px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;transition:transform 0.3s;}.todo-item:hover{transform:translateX(5px);}.todo-item.completed{opacity:0.6;text-decoration:line-through;}.todo-text{flex:1;margin-left:10px;}.todo-actions{display:flex;gap:10px;}.complete-btn,.delete-btn{padding:5px 10px;border:none;border-radius:5px;cursor:pointer;font-size:0.9em;}.complete-btn{background:#4CAF50;color:white;}.delete-btn{background:#f44336;color:white;}.stats{margin-top:20px;text-align:center;color:#666;font-size:0.9em;}</style></head><body><div class="container"><h1>📝 Todo List</h1><div class="input-group"><input type="text" id="todoInput" placeholder="Add a new task..."><button id="addBtn">Add</button></div><ul id="todoList" class="todo-list"></ul><div class="stats"><span id="totalCount">0</span> tasks total | <span id="completedCount">0</span> completed</div></div><script>let todos=JSON.parse(localStorage.getItem('todos'))||[];function renderTodos(){const todoList=document.getElementById('todoList');const totalCount=document.getElementById('totalCount');const completedCount=document.getElementById('completedCount');todoList.innerHTML='';const completed=todos.filter(todo=>todo.completed).length;todos.forEach((todo,index)=>{const li=document.createElement('li');li.className='todo-item '+(todo.completed?'completed':'');li.innerHTML='<input type="checkbox" '+(todo.completed?'checked':'')+' onchange="toggleTodo('+index+')"><span class="todo-text">'+todo.text+'</span><div class="todo-actions"><button class="delete-btn" onclick="deleteTodo('+index+')">Delete</button></div>';todoList.appendChild(li);});totalCount.textContent=todos.length;completedCount.textContent=completed;localStorage.setItem('todos',JSON.stringify(todos));}function addTodo(){const input=document.getElementById('todoInput');const text=input.value.trim();if(text){todos.push({text,completed:false});input.value='';renderTodos();}}function toggleTodo(index){todos[index].completed=!todos[index].completed;renderTodos();}function deleteTodo(index){todos.splice(index,1);renderTodos();}document.getElementById('addBtn').addEventListener('click',addTodo);document.getElementById('todoInput').addEventListener('keypress',(e)=>{if(e.key==='Enter')addTodo();});renderTodos();</script></body></html>`
            },
            {
                id: 'notes',
                name: 'Notes App',
                description: 'Take and save notes',
                category: 'productivity',
                preview: '📓',
                code: `<!DOCTYPE html><html><head><title>Notes App</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);min-height:100vh;padding:20px;}.container{max-width:800px;margin:0 auto;}.header{text-align:center;color:white;margin-bottom:30px;}h1{font-size:2.5em;margin-bottom:10px;}.note-input{background:white;border-radius:15px;padding:25px;box-shadow:0 10px 40px rgba(0,0,0,0.1);margin-bottom:30px;}#noteTitle{padding:15px;width:100%;border:2px solid #e0e0e0;border-radius:10px;font-size:1.2em;margin-bottom:15px;outline:none;transition:border-color 0.3s;}#noteTitle:focus{border-color:#4facfe;}#noteContent{width:100%;height:200px;padding:15px;border:2px solid #e0e0e0;border-radius:10px;font-size:1em;resize:vertical;outline:none;transition:border-color 0.3s;}#noteContent:focus{border-color:#4facfe;}.btn-group{display:flex;gap:10px;margin-top:15px;}.btn{padding:12px 25px;border:none;border-radius:10px;font-size:1em;cursor:pointer;transition:transform 0.3s,box-shadow 0.3s;}.btn-primary{background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);color:white;}.btn-outline{background:white;border:2px solid #4facfe;color:#4facfe;}.btn:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.2);}.notes-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;}.note-card{background:white;border-radius:15px;padding:20px;box-shadow:0 5px 20px rgba(0,0,0,0.1);transition:transform 0.3s;}.note-card:hover{transform:translateY(-5px);}.note-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}.note-title{font-weight:600;color:#333;font-size:1.2em;}.note-date{color:#666;font-size:0.8em;}.note-content{color:#555;line-height:1.6;margin-bottom:15px;}.note-actions{display:flex;gap:10px;}.edit-btn,.delete-btn{padding:5px 10px;border:none;border-radius:5px;cursor:pointer;font-size:0.9em;}.edit-btn{background:#4CAF50;color:white;}.delete-btn{background:#f44336;color:white;}</style></head><body><div class="container"><div class="header"><h1>📓 Notes App</h1><p>Keep your thoughts organized</p></div><div class="note-input"><input type="text" id="noteTitle" placeholder="Note title..."><textarea id="noteContent" placeholder="Write your note here..."></textarea><div class="btn-group"><button id="saveBtn" class="btn btn-primary">Save Note</button><button id="clearBtn" class="btn btn-outline">Clear</button></div></div><div id="notesContainer" class="notes-grid"></div></div><script>let notes=JSON.parse(localStorage.getItem('notes'))||[];let editingIndex=-1;function renderNotes(){const container=document.getElementById('notesContainer');container.innerHTML='';notes.forEach((note,index)=>{const noteCard=document.createElement('div');noteCard.className='note-card';noteCard.innerHTML='<div class="note-header"><div class="note-title">'+note.title+'</div><div class="note-date">'+new Date(note.date).toLocaleDateString()+'</div></div><div class="note-content">'+note.content+'</div><div class="note-actions"><button class="edit-btn" onclick="editNote('+index+')">Edit</button><button class="delete-btn" onclick="deleteNote('+index+')">Delete</button></div>';container.appendChild(noteCard);});}function saveNote(){const title=document.getElementById('noteTitle').value.trim();const content=document.getElementById('noteContent').value.trim();if(!title||!content){alert('Please fill in both title and content');return;}if(editingIndex>=0){notes[editingIndex]={title,content,date:new Date().toISOString()};editingIndex=-1;}else{notes.push({title,content,date:new Date().toISOString()});}localStorage.setItem('notes',JSON.stringify(notes));renderNotes();clearForm();}function editNote(index){const note=notes[index];document.getElementById('noteTitle').value=note.title;document.getElementById('noteContent').value=note.content;editingIndex=index;document.getElementById('saveBtn').textContent='Update Note';}function deleteNote(index){if(confirm('Delete this note?')){notes.splice(index,1);localStorage.setItem('notes',JSON.stringify(notes));renderNotes();}}function clearForm(){document.getElementById('noteTitle').value='';document.getElementById('noteContent').value='';document.getElementById('saveBtn').textContent='Save Note';editingIndex=-1;}document.getElementById('saveBtn').addEventListener('click',saveNote);document.getElementById('clearBtn').addEventListener('click',clearForm);renderNotes();</script></body></html>`
            },
            {
                id: 'weather',
                name: 'Weather App',
                description: 'Weather forecast application',
                category: 'utility',
                preview: '☁️',
                code: `<!DOCTYPE html><html><head><title>Weather App</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);min-height:100vh;padding:20px;}.container{max-width:800px;margin:0 auto;background:rgba(255,255,255,0.9);border-radius:25px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,0.1);}.header{text-align:center;margin-bottom:30px;color:#333;}.search-box{display:flex;gap:10px;margin-bottom:30px;}#cityInput{flex:1;padding:15px 20px;border:2px solid #ddd;border-radius:15px;font-size:1.1em;outline:none;transition:all 0.3s;}#cityInput:focus{border-color:#a8edea;box-shadow:0 0 0 3px rgba(168,237,234,0.3);}#searchBtn{background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);color:white;border:none;padding:15px 30px;border-radius:15px;font-size:1.1em;cursor:pointer;transition:transform 0.3s;}#searchBtn:hover{transform:translateY(-2px);}.weather-card{background:white;border-radius:20px;padding:30px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.1);margin-bottom:30px;}.location{font-size:1.5em;color:#333;margin-bottom:10px;}.temperature{font-size:4em;font-weight:300;color:#333;margin:20px 0;}.description{font-size:1.2em;color:#666;margin-bottom:20px;text-transform:capitalize;}.weather-icon{font-size:5em;margin:20px 0;}.details{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-top:30px;}.detail-item{background:#f8f9fa;padding:15px;border-radius:10px;}.detail-label{color:#666;font-size:0.9em;margin-bottom:5px;}.detail-value{font-size:1.2em;color:#333;font-weight:600;}.forecast{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-top:30px;}.forecast-day{background:white;border-radius:15px;padding:20px;text-align:center;box-shadow:0 5px 20px rgba(0,0,0,0.1);}.day-name{font-weight:600;color:#333;margin-bottom:10px;}.day-icon{font-size:2em;margin:10px 0;}.day-temp{color:#333;font-weight:600;}.day-desc{color:#666;font-size:0.9em;margin-top:5px;}.error{background:#fee;color:#c00;padding:15px;border-radius:10px;text-align:center;margin-top:20px;display:none;}</style></head><body><div class="container"><div class="header"><h1>☁️ Weather App</h1><p>Get real-time weather updates</p></div><div class="search-box"><input type="text" id="cityInput" placeholder="Enter city name..." value="New York"><button id="searchBtn">Search</button></div><div id="weatherInfo" class="weather-card"><div class="location">New York, US</div><div class="weather-icon">☀️</div><div class="temperature">22°C</div><div class="description">Clear sky</div><div class="details"><div class="detail-item"><div class="detail-label">Feels Like</div><div class="detail-value">23°C</div></div><div class="detail-item"><div class="detail-label">Humidity</div><div class="detail-value">65%</div></div><div class="detail-item"><div class="detail-label">Wind</div><div class="detail-value">5 km/h</div></div><div class="detail-item"><div class="detail-label">Pressure</div><div class="detail-value">1013 hPa</div></div></div></div><div id="forecast" class="forecast"></div><div id="error" class="error">Failed to fetch weather data. Please try again.</div></div><script>const apiKey='';//Add your OpenWeatherMap API key hereasync function getWeather(city='New York'){try{const response=await fetch('https://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric&appid='+apiKey);if(!response.ok)throw new Error('City not found');const data=await response.json();updateWeather(data);}catch(error){document.getElementById('error').style.display='block';console.error('Weather error:',error);}}function updateWeather(data){document.getElementById('error').style.display='none';const weatherCard=document.getElementById('weatherInfo');const weatherIcon=getWeatherIcon(data.weather[0].main);weatherCard.innerHTML='<div class="location">'+data.name+', '+data.sys.country+'</div><div class="weather-icon">'+weatherIcon+'</div><div class="temperature">'+Math.round(data.main.temp)+'°C</div><div class="description">'+data.weather[0].description+'</div><div class="details"><div class="detail-item"><div class="detail-label">Feels Like</div><div class="detail-value">'+Math.round(data.main.feels_like)+'°C</div></div><div class="detail-item"><div class="detail-label">Humidity</div><div class="detail-value">'+data.main.humidity+'%</div></div><div class="detail-item"><div class="detail-label">Wind</div><div class="detail-value">'+Math.round(data.wind.speed)+' km/h</div></div><div class="detail-item"><div class="detail-label">Pressure</div><div class="detail-value">'+data.main.pressure+' hPa</div></div></div>';}function getWeatherIcon(condition){const icons={'Clear':'☀️','Clouds':'☁️','Rain':'🌧️','Snow':'❄️','Thunderstorm':'⛈️','Drizzle':'🌦️','Mist':'🌫️'};return icons[condition]||'🌈';}function getForecast(){const forecastDiv=document.getElementById('forecast');const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];const temps=[22,24,20,18,21,23,19];const icons=['☀️','⛅','🌧️','☁️','☀️','⛅','🌦️'];forecastDiv.innerHTML='';days.forEach((day,index)=>{forecastDiv.innerHTML+='<div class="forecast-day"><div class="day-name">'+day+'</div><div class="day-icon">'+icons[index]+'</div><div class="day-temp">'+temps[index]+'°C</div><div class="day-desc">'+['Sunny','Partly Cloudy','Rainy','Cloudy','Sunny','Partly Cloudy','Light Rain'][index]+'</div></div>';});}document.getElementById('searchBtn').addEventListener('click',()=>{const city=document.getElementById('cityInput').value;if(city){getWeather(city);}});document.getElementById('cityInput').addEventListener('keypress',(e)=>{if(e.key==='Enter'){const city=document.getElementById('cityInput').value;if(city)getWeather(city);}});//Initial loadgetWeather();getForecast();</script></body></html>`
            },
            {
                id: 'quiz',
                name: 'Quiz App',
                description: 'Interactive quiz application',
                category: 'education',
                preview: '🧠',
                code: `<!DOCTYPE html><html><head><title>Quiz App</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%);min-height:100vh;padding:20px;}.container{max-width:800px;margin:0 auto;background:rgba(255,255,255,0.95);border-radius:25px;padding:30px;box-shadow:0 20px 60px rgba(0,0,0,0.1);}.header{text-align:center;margin-bottom:30px;}.header h1{color:#333;font-size:2.5em;margin-bottom:10px;}.header p{color:#666;font-size:1.1em;}.score-board{background:#f8f9fa;border-radius:15px;padding:15px;text-align:center;margin-bottom:30px;}.score{font-size:1.2em;color:#333;}.score span{font-weight:600;color:#ff6b6b;}.quiz-container{background:white;border-radius:20px;padding:30px;box-shadow:0 10px 40px rgba(0,0,0,0.1);}.question-number{color:#666;font-size:0.9em;margin-bottom:10px;}.question{font-size:1.4em;color:#333;margin-bottom:25px;line-height:1.5;}.options{display:flex;flex-direction:column;gap:15px;}.option{background:#f8f9fa;border:2px solid #e0e0e0;border-radius:12px;padding:18px;font-size:1.1em;cursor:pointer;transition:all 0.3s;text-align:left;}.option:hover{transform:translateY(-2px);box-shadow:0 5px 15px rgba(0,0,0,0.1);border-color:#ff6b6b;}.option.correct{background:#d4edda;border-color:#c3e6cb;color:#155724;}.option.incorrect{background:#f8d7da;border-color:#f5c6cb;color:#721c24;}.option.selected{background:#ff6b6b;border-color:#ff6b6b;color:white;}.controls{display:flex;justify-content:space-between;margin-top:30px;}.btn{padding:15px 30px;border:none;border-radius:12px;font-size:1.1em;cursor:pointer;transition:transform 0.3s,box-shadow 0.3s;}.btn-primary{background:linear-gradient(135deg,#ff6b6b 0%,#ff8e53 100%);color:white;}.btn-outline{background:white;border:2px solid #ff6b6b;color:#ff6b6b;}.btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.2);}.btn:disabled{opacity:0.5;cursor:not-allowed;}.result-screen{text-align:center;padding:40px 20px;}.result-icon{font-size:4em;margin-bottom:20px;}.result-score{font-size:2.5em;color:#333;margin-bottom:20px;}.result-message{color:#666;font-size:1.2em;margin-bottom:30px;line-height:1.6;}.progress-bar{height:8px;background:#e0e0e0;border-radius:4px;margin:20px 0;overflow:hidden;}.progress{height:100%;background:linear-gradient(135deg,#ff6b6b 0%,#ff8e53 100%);width:0%;transition:width 0.3s;}</style></head><body><div class="container"><div class="header"><h1>🧠 Quiz Challenge</h1><p>Test your knowledge with this interactive quiz</p></div><div class="score-board">Score: <span id="score">0</span> / <span id="total">0</span></div><div id="quizScreen"><div class="quiz-container"><div class="question-number">Question <span id="currentQuestion">1</span> of <span id="totalQuestions">5</span></div><div id="question" class="question">What is the capital of France?</div><div id="options" class="options"></div><div class="controls"><button id="prevBtn" class="btn btn-outline">Previous</button><button id="nextBtn" class="btn btn-primary">Next Question</button></div></div></div><div id="resultScreen" class="result-screen" style="display:none;"><div class="result-icon">🏆</div><div class="result-score">You scored: <span id="finalScore">0</span>/<span id="maxScore">5</span></div><div class="result-message" id="resultMessage"></div><button id="restartBtn" class="btn btn-primary">Restart Quiz</button></div></div><script>const quizData=[{question:"What is the capital of France?",options:["London","Berlin","Paris","Madrid"],answer:2},{question:"Which planet is known as the Red Planet?",options:["Venus","Mars","Jupiter","Saturn"],answer:1},{question:"What is the largest mammal in the world?",options:["African Elephant","Blue Whale","Giraffe","Polar Bear"],answer:1},{question:"Who painted the Mona Lisa?",options:["Vincent van Gogh","Pablo Picasso","Leonardo da Vinci","Michelangelo"],answer:2},{question:"What is the chemical symbol for gold?",options:["Go","Gd","Au","Ag"],answer:2}];let currentQuestion=0;let score=0;let userAnswers=new Array(quizData.length).fill(null);function loadQuestion(){const questionData=quizData[currentQuestion];document.getElementById('currentQuestion').textContent=currentQuestion+1;document.getElementById('totalQuestions').textContent=quizData.length;document.getElementById('question').textContent=questionData.question;const optionsDiv=document.getElementById('options');optionsDiv.innerHTML='';questionData.options.forEach((option,index)=>{const optionDiv=document.createElement('div');optionDiv.className='option';if(userAnswers[currentQuestion]===index){optionDiv.classList.add('selected');if(index===questionData.answer){optionDiv.classList.add('correct');}else{optionDiv.classList.add('incorrect');}}optionDiv.textContent=option;optionDiv.onclick=()=>selectOption(index);optionsDiv.appendChild(optionDiv);});updateProgress();updateButtons();}function selectOption(index){if(userAnswers[currentQuestion]!==null)return;userAnswers[currentQuestion]=index;const options=document.querySelectorAll('.option');options.forEach((option,optIndex)=>{option.classList.remove('selected','correct','incorrect');if(optIndex===index){option.classList.add('selected');if(index===quizData[currentQuestion].answer){option.classList.add('correct');score++;}else{option.classList.add('incorrect');options[quizData[currentQuestion].answer].classList.add('correct');}}else if(optIndex===quizData[currentQuestion].answer){option.classList.add('correct');}});updateScore();updateButtons();}function updateScore(){document.getElementById('score').textContent=score;document.getElementById('total').textContent=currentQuestion+1;}function updateProgress(){const progress=(currentQuestion/quizData.length)*100;document.querySelector('.progress').style.width=progress+'%';}function updateButtons(){document.getElementById('prevBtn').disabled=currentQuestion===0;document.getElementById('nextBtn').textContent=currentQuestion===quizData.length-1?'Finish':'Next Question';}function nextQuestion(){if(currentQuestion<quizData.length-1){currentQuestion++;loadQuestion();}else{showResults();}}function prevQuestion(){if(currentQuestion>0){currentQuestion--;loadQuestion();}}function showResults(){document.getElementById('quizScreen').style.display='none';document.getElementById('resultScreen').style.display='block';document.getElementById('finalScore').textContent=score;document.getElementById('maxScore').textContent=quizData.length;let message="";const percentage=(score/quizData.length)*100;if(percentage>=80){message="🎉 Excellent! You're a quiz master!";}else if(percentage>=60){message="👍 Good job! You know your stuff!";}else if(percentage>=40){message="😊 Not bad! Keep learning!";}else{message="📚 Keep studying! You'll do better next time!";}document.getElementById('resultMessage').textContent=message;}function restartQuiz(){currentQuestion=0;score=0;userAnswers.fill(null);document.getElementById('quizScreen').style.display='block';document.getElementById('resultScreen').style.display='none';updateScore();loadQuestion();}document.getElementById('nextBtn').addEventListener('click',nextQuestion);document.getElementById('prevBtn').addEventListener('click',prevQuestion);document.getElementById('restartBtn').addEventListener('click',restartQuiz);//Initial loadloadQuestion();updateScore();</script></body></html>`
            },
            {
                id: 'calculator',
                name: 'Calculator',
                description: 'Simple calculator app',
                category: 'utility',
                preview: '🧮',
                code: `<!DOCTYPE html><html><head><title>Calculator</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#74ebd5 0%,#ACB6E5 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px;}.calculator{background:rgba(255,255,255,0.95);border-radius:25px;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden;width:100%;max-width:400px;}.display{background:#1a1a2e;color:white;padding:30px;text-align:right;min-height:120px;display:flex;flex-direction:column;justify-content:flex-end;}.previous{font-size:1.2em;color:#aaa;min-height:27px;word-break:break-all;}.current{font-size:2.5em;font-weight:300;word-break:break-all;}.buttons{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e0e0e0;}.btn{background:white;border:none;padding:25px;font-size:1.3em;cursor:pointer;transition:all 0.2s;outline:none;}.btn:hover{background:#f5f5f5;}.btn:active{background:#e0e0e0;}.operator{background:#f8f9fa;color:#74ebd5;font-weight:600;}.equals{background:linear-gradient(135deg,#74ebd5 0%,#ACB6E5 100%);color:white;grid-column:span 2;}.clear{background:#ff6b6b;color:white;}.zero{grid-column:span 2;}.history-toggle{position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.2);color:white;border:none;padding:10px 15px;border-radius:10px;cursor:pointer;backdrop-filter:blur(10px);}.history-panel{position:fixed;top:0;right:-350px;width:350px;height:100%;background:white;box-shadow:-5px 0 30px rgba(0,0,0,0.1);transition:right 0.3s;padding:30px;overflow-y:auto;}.history-panel.active{right:0;}.history-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}.history-header h3{margin:0;color:#333;}.close-history{background:none;border:none;font-size:1.5em;color:#666;cursor:pointer;}.history-item{background:#f8f9fa;padding:15px;border-radius:10px;margin-bottom:10px;}.history-expression{color:#666;font-size:0.9em;margin-bottom:5px;}.history-result{color:#333;font-weight:600;font-size:1.1em;}.clear-history{background:#ff6b6b;color:white;border:none;padding:10px;border-radius:10px;width:100%;margin-top:20px;cursor:pointer;}</style></head><body><div class="calculator"><div class="display"><div class="previous" id="previous"></div><div class="current" id="current">0</div></div><div class="buttons"><button class="btn clear" onclick="clearAll()">C</button><button class="btn clear" onclick="backspace()">⌫</button><button class="btn operator" onclick="appendOperator('/')">/</button><button class="btn operator" onclick="appendOperator('*')">×</button><button class="btn" onclick="appendNumber('7')">7</button><button class="btn" onclick="appendNumber('8')">8</button><button class="btn" onclick="appendNumber('9')">9</button><button class="btn operator" onclick="appendOperator('-')">-</button><button class="btn" onclick="appendNumber('4')">4</button><button class="btn" onclick="appendNumber('5')">5</button><button class="btn" onclick="appendNumber('6')">6</button><button class="btn operator" onclick="appendOperator('+')">+</button><button class="btn" onclick="appendNumber('1')">1</button><button class="btn" onclick="appendNumber('2')">2</button><button class="btn" onclick="appendNumber('3')">3</button><button class="btn equals" onclick="calculate()">=</button><button class="btn zero" onclick="appendNumber('0')">0</button><button class="btn" onclick="appendDecimal()">.</button></div></div><button class="history-toggle" onclick="toggleHistory()">📜 History</button><div class="history-panel" id="historyPanel"><div class="history-header"><h3>Calculation History</h3><button class="close-history" onclick="toggleHistory()">×</button></div><div id="historyList"></div><button class="clear-history" onclick="clearHistory()">Clear History</button></div><script>let currentDisplay='0';let previousDisplay='';let operator=null;let waitingForNewValue=false;let calculationHistory=JSON.parse(localStorage.getItem('calcHistory'))||[];function updateDisplay(){document.getElementById('current').textContent=currentDisplay;document.getElementById('previous').textContent=previousDisplay;}function appendNumber(number){if(waitingForNewValue){currentDisplay=number;waitingForNewValue=false;}else{currentDisplay=currentDisplay==='0'?number:currentDisplay+number;}updateDisplay();}function appendDecimal(){if(!currentDisplay.includes('.')){currentDisplay+='.';updateDisplay();}}function appendOperator(op){if(operator!==null&&!waitingForNewValue){calculate();}operator=op;previousDisplay=currentDisplay+' '+op;waitingForNewValue=true;updateDisplay();}function calculate(){if(operator===null||waitingForNewValue)return;let prev=parseFloat(previousDisplay);let current=parseFloat(currentDisplay);let result;switch(operator){case'+':result=prev+current;break;case'-':result=prev-current;break;case'*':result=prev*current;break;case'/':result=current!==0?prev/current:'Error';break;default:return;}const calculation={expression:previousDisplay+' '+currentDisplay,result:result.toString()};calculationHistory.unshift(calculation);if(calculationHistory.length>10)calculationHistory.pop();localStorage.setItem('calcHistory',JSON.stringify(calculationHistory));updateHistory();previousDisplay+=currentDisplay;currentDisplay=result.toString();operator=null;waitingForNewValue=true;updateDisplay();}function clearAll(){currentDisplay='0';previousDisplay='';operator=null;waitingForNewValue=false;updateDisplay();}function backspace(){if(currentDisplay.length>1){currentDisplay=currentDisplay.slice(0,-1);}else{currentDisplay='0';}updateDisplay();}function toggleHistory(){document.getElementById('historyPanel').classList.toggle('active');}function updateHistory(){const historyList=document.getElementById('historyList');historyList.innerHTML='';calculationHistory.forEach(item=>{const historyItem=document.createElement('div');historyItem.className='history-item';historyItem.innerHTML='<div class="history-expression">'+item.expression+' =</div><div class="history-result">'+item.result+'</div>';historyList.appendChild(historyItem);});}function clearHistory(){calculationHistory=[];localStorage.setItem('calcHistory',JSON.stringify(calculationHistory));updateHistory();}function handleKeyPress(e){if(e.key>='0'&&e.key<='9')appendNumber(e.key);else if(e.key==='.')appendDecimal();else if(e.key==='+'||e.key==='-'||e.key==='*'||e.key==='/')appendOperator(e.key);else if(e.key==='Enter'||e.key==='=')calculate();else if(e.key==='Escape')clearAll();else if(e.key==='Backspace')backspace();}document.addEventListener('keydown',handleKeyPress);//Initial setupupdateDisplay();updateHistory();</script></body></html>`
            },
            {
                id: 'timer',
                name: 'Timer & Stopwatch',
                description: 'Timer and stopwatch app',
                category: 'utility',
                preview: '⏱️',
                code: `<!DOCTYPE html><html><head><title>Timer & Stopwatch</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#8E2DE2 0%,#4A00E0 100%);min-height:100vh;padding:20px;display:flex;justify-content:center;align-items:center;}.container{width:100%;max-width:500px;background:rgba(255,255,255,0.95);border-radius:25px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);}.tabs{display:flex;background:#f8f9fa;border-bottom:1px solid #e0e0e0;}.tab{flex:1;padding:20px;text-align:center;background:none;border:none;font-size:1.1em;font-weight:600;color:#666;cursor:pointer;transition:all 0.3s;}.tab.active{background:white;color:#8E2DE2;border-bottom:3px solid #8E2DE2;}.tab-content{padding:30px;}.timer-display{text-align:center;margin-bottom:40px;}.time{font-size:5em;font-weight:300;color:#333;margin-bottom:20px;font-feature-settings:"tnum";font-variant-numeric:tabular-nums;}.time-label{color:#666;font-size:1.1em;}.controls{display:flex;justify-content:center;gap:15px;margin-bottom:30px;}.btn{padding:15px 30px;border:none;border-radius:12px;font-size:1.1em;font-weight:600;cursor:pointer;transition:transform 0.3s,box-shadow 0.3s;}.btn-primary{background:linear-gradient(135deg,#8E2DE2 0%,#4A00E0 100%);color:white;}.btn-outline{background:white;border:2px solid #8E2DE2;color:#8E2DE2;}.btn-danger{background:#ff6b6b;color:white;border:none;}.btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 25px rgba(0,0,0,0.2);}.btn:disabled{opacity:0.5;cursor:not-allowed;}.presets{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:30px;}.preset-btn{background:#f8f9fa;border:2px solid #e0e0e0;border-radius:10px;padding:15px;font-size:1em;cursor:pointer;transition:all 0.3s;}.preset-btn:hover{background:#e9ecef;border-color:#8E2DE2;color:#8E2DE2;}.time-input{display:flex;justify-content:center;gap:10px;margin-top:20px;}.time-input-group{display:flex;flex-direction:column;align-items:center;}.time-input input{width:80px;padding:15px;border:2px solid #e0e0e0;border-radius:10px;font-size:1.5em;text-align:center;outline:none;transition:border-color 0.3s;}.time-input input:focus{border-color:#8E2DE2;}.time-input label{color:#666;font-size:0.9em;margin-top:5px;}.lap-list{background:#f8f9fa;border-radius:15px;padding:20px;margin-top:30px;max-height:300px;overflow-y:auto;}.lap-header{display:flex;justify-content:space-between;color:#666;font-weight:600;margin-bottom:15px;padding-bottom:10px;border-bottom:2px solid #e0e0e0;}.lap-item{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e0e0e0;}.lap-number{color:#666;}.lap-time{font-weight:600;color:#333;}.lap-diff{color:#8E2DE2;font-size:0.9em;}.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-top:30px;}.stat-item{background:#f8f9fa;padding:20px;border-radius:15px;text-align:center;}.stat-value{font-size:1.8em;font-weight:600;color:#8E2DE2;margin-bottom:5px;}.stat-label{color:#666;font-size:0.9em;}.progress-ring{transform:rotate(-90deg);}.progress-ring-circle{transition:stroke-dashoffset 0.35s;transform-origin:50% 50%;stroke:linear-gradient(135deg,#8E2DE2 0%,#4A00E0 100%);}</style></head><body><div class="container"><div class="tabs"><button class="tab active" data-tab="timer">Timer</button><button class="tab" data-tab="stopwatch">Stopwatch</button></div><div id="timerTab" class="tab-content"><div class="timer-display"><div class="time" id="timerDisplay">25:00</div><div class="time-label">Countdown Timer</div></div><div class="controls"><button id="startTimer" class="btn btn-primary">Start</button><button id="pauseTimer" class="btn btn-outline" disabled>Pause</button><button id="resetTimer" class="btn btn-outline">Reset</button></div><div class="time-input"><div class="time-input-group"><input type="number" id="minutes" min="0" max="60" value="25"><label>Minutes</label></div><div class="time-input-group"><input type="number" id="seconds" min="0" max="59" value="0"><label>Seconds</label></div></div><div class="presets"><button class="preset-btn" data-time="300">5 min</button><button class="preset-btn" data-time="600">10 min</button><button class="preset-btn" data-time="900">15 min</button><button class="preset-btn" data-time="1200">20 min</button><button class="preset-btn" data-time="1500">25 min</button><button class="preset-btn" data-time="1800">30 min</button></div></div><div id="stopwatchTab" class="tab-content" style="display:none;"><div class="timer-display"><div class="time" id="stopwatchDisplay">00:00.00</div><div class="time-label">Stopwatch</div></div><div class="controls"><button id="startStopwatch" class="btn btn-primary">Start</button><button id="lapStopwatch" class="btn btn-outline" disabled>Lap</button><button id="resetStopwatch" class="btn btn-outline">Reset</button></div><div class="lap-list" id="lapList"><div class="lap-header"><span>Lap</span><span>Time</span><span>Diff</span></div></div><div class="stats"><div class="stat-item"><div class="stat-value" id="lapCount">0</div><div class="stat-label">Laps</div></div><div class="stat-item"><div class="stat-value" id="fastestLap">--</div><div class="stat-label">Fastest Lap</div></div></div></div></div><script>//Timer functionalitylet timerInterval=null;let timerTime=25*60;let isTimerRunning=false;function updateTimerDisplay(){const minutes=Math.floor(timerTime/60);const seconds=timerTime%60;document.getElementById('timerDisplay').textContent='${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}';}function startTimer(){if(isTimerRunning)return;isTimerRunning=true;document.getElementById('startTimer').textContent='Pause';document.getElementById('pauseTimer').disabled=true;timerInterval=setInterval(()=>{if(timerTime>0){timerTime--;updateTimerDisplay();if(timerTime===0){clearInterval(timerInterval);isTimerRunning=false;document.getElementById('startTimer').textContent='Start';document.getElementById('pauseTimer').disabled=true;alert('Timer completed!');}}else{clearInterval(timerInterval);isTimerRunning=false;document.getElementById('startTimer').textContent='Start';document.getElementById('pauseTimer').disabled=true;}},1000);}function pauseTimer(){if(!isTimerRunning)return;clearInterval(timerInterval);isTimerRunning=false;document.getElementById('startTimer').textContent='Resume';document.getElementById('pauseTimer').disabled=true;}function resetTimer(){clearInterval(timerInterval);isTimerRunning=false;timerTime=parseInt(document.getElementById('minutes').value)*60+parseInt(document.getElementById('seconds').value);updateTimerDisplay();document.getElementById('startTimer').textContent='Start';document.getElementById('pauseTimer').disabled=true;}function setTimerFromPreset(seconds){document.getElementById('minutes').value=Math.floor(seconds/60);document.getElementById('seconds').value=seconds%60;resetTimer();}//Stopwatch functionalitylet stopwatchInterval=null;let stopwatchTime=0;let isStopwatchRunning=false;let laps=[];let lastLapTime=0;function updateStopwatchDisplay(){const totalSeconds=stopwatchTime/100;const minutes=Math.floor(totalSeconds/60);const seconds=Math.floor(totalSeconds%60);const hundredths=stopwatchTime%100;document.getElementById('stopwatchDisplay').textContent='${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}.${hundredths.toString().padStart(2,'0')}';}function startStopwatch(){if(isStopwatchRunning)return;isStopwatchRunning=true;document.getElementById('startStopwatch').textContent='Pause';document.getElementById('lapStopwatch').disabled=false;stopwatchInterval=setInterval(()=>{stopwatchTime++;updateStopwatchDisplay();},10);}function pauseStopwatch(){if(!isStopwatchRunning)return;clearInterval(stopwatchInterval);isStopwatchRunning=false;document.getElementById('startStopwatch').textContent='Resume';}function lapStopwatch(){if(!isStopwatchRunning)return;const lapTime=stopwatchTime;const lapDifference=lastLapTime===0?0:lapTime-lastLapTime;laps.unshift({number:laps.length+1,time:lapTime,diff:lapDifference});lastLapTime=lapTime;updateLapList();}function resetStopwatch(){clearInterval(stopwatchInterval);isStopwatchRunning=false;stopwatchTime=0;lastLapTime=0;laps=[];updateStopwatchDisplay();document.getElementById('startStopwatch').textContent='Start';document.getElementById('lapStopwatch').disabled=true;updateLapList();}function updateLapList(){const lapList=document.getElementById('lapList');const lapsContainer=lapList.querySelector('.lap-header').nextElementSibling;if(lapsContainer)lapsContainer.remove();const lapsDiv=document.createElement('div');laps.forEach(lap=>{const lapItem=document.createElement('div');lapItem.className='lap-item';const totalSeconds=lap.time/100;const minutes=Math.floor(totalSeconds/60);const seconds=Math.floor(totalSeconds%60);const hundredths=lap.time%100;const lapTimeStr='${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}.${hundredths.toString().padStart(2,'0')}';const diffSeconds=lap.diff/100;const diffMinutes=Math.floor(diffSeconds/60);const diffSecs=Math.floor(diffSeconds%60);const diffHundredths=lap.diff%100;const diffStr=lap.diff===0?'--':'${diffMinutes>0?diffMinutes+':':''}${diffSecs.toString().padStart(2,'0')}.${diffHundredths.toString().padStart(2,'0')}';lapItem.innerHTML='<span class="lap-number">Lap ${lap.number}</span><span class="lap-time">${lapTimeStr}</span><span class="lap-diff">${diffStr}</span>';lapsDiv.appendChild(lapItem);});lapList.appendChild(lapsDiv);document.getElementById('lapCount').textContent=laps.length;if(laps.length>0){const fastestLap=Math.min(...laps.slice(1).map(lap=>lap.diff));const fastestSeconds=fastestLap/100;const fastestMinutes=Math.floor(fastestSeconds/60);const fastestSecs=Math.floor(fastestSeconds%60);const fastestHundredths=fastestLap%100;document.getElementById('fastestLap').textContent='${fastestMinutes>0?fastestMinutes+':':''}${fastestSecs.toString().padStart(2,'0')}.${fastestHundredths.toString().padStart(2,'0')}';}else{document.getElementById('fastestLap').textContent='--';}}//Tab switchingdocument.querySelectorAll('.tab').forEach(tab=>{tab.addEventListener('click',()=>{const tabName=tab.dataset.tab;document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');document.querySelectorAll('.tab-content').forEach(content=>content.style.display='none');document.getElementById(tabName+'Tab').style.display='block';resetTimer();resetStopwatch();});});//Event listenersdocument.getElementById('startTimer').addEventListener('click',()=>{if(isTimerRunning){pauseTimer();}else{startTimer();}});document.getElementById('pauseTimer').addEventListener('click',pauseTimer);document.getElementById('resetTimer').addEventListener('click',resetTimer);document.getElementById('startStopwatch').addEventListener('click',()=>{if(isStopwatchRunning){pauseStopwatch();}else{startStopwatch();}});document.getElementById('lapStopwatch').addEventListener('click',lapStopwatch);document.getElementById('resetStopwatch').addEventListener('click',resetStopwatch);document.querySelectorAll('.preset-btn').forEach(btn=>{btn.addEventListener('click',()=>setTimerFromPreset(parseInt(btn.dataset.time)));});document.getElementById('minutes').addEventListener('change',resetTimer);document.getElementById('seconds').addEventListener('change',resetTimer);//Initial setupupdateTimerDisplay();updateStopwatchDisplay();</script></body></html>`
            },
            {
                id: 'blog',
                name: 'Blog Template',
                description: 'Simple blog layout',
                category: 'content',
                preview: '📝',
                code: `<!DOCTYPE html><html><head><title>My Blog</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;background:#f9f9f9;}.container{max-width:1200px;margin:0 auto;padding:0 20px;}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:60px 0;text-align:center;margin-bottom:40px;}.header h1{font-size:3em;margin-bottom:10px;}.header p{font-size:1.2em;opacity:0.9;}.nav{background:white;box-shadow:0 2px 10px rgba(0,0,0,0.1);position:sticky;top:0;z-index:1000;}.nav-container{display:flex;justify-content:space-between;align-items:center;padding:15px 0;}.logo{font-size:1.5em;font-weight:700;color:#667eea;}.nav-links{display:flex;gap:30px;}.nav-links a{color:#333;text-decoration:none;font-weight:500;transition:color 0.3s;}.nav-links a:hover{color:#667eea;}.main-content{display:grid;grid-template-columns:2fr 1fr;gap:40px;margin:40px 0;}.posts .post{background:white;border-radius:10px;padding:30px;margin-bottom:30px;box-shadow:0 5px 20px rgba(0,0,0,0.05);transition:transform 0.3s,box-shadow 0.3s;}.posts .post:hover{transform:translateY(-5px);box-shadow:0 10px 30px rgba(0,0,0,0.1);}.post-meta{display:flex;gap:15px;color:#666;font-size:0.9em;margin-bottom:15px;}.post-meta span{display:flex;align-items:center;gap:5px;}.post-title{font-size:1.8em;margin-bottom:15px;color:#333;}.post-excerpt{color:#555;margin-bottom:20px;line-height:1.7;}.read-more{display:inline-block;background:#667eea;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:500;transition:background 0.3s,transform 0.3s;}.read-more:hover{background:#764ba2;transform:translateY(-2px);}.sidebar .widget{background:white;border-radius:10px;padding:25px;margin-bottom:30px;box-shadow:0 5px 20px rgba(0,0,0,0.05);}.widget-title{font-size:1.3em;margin-bottom:20px;color:#333;padding-bottom:10px;border-bottom:2px solid #667eea;}.about-author{text-align:center;}.author-img{width:100px;height:100px;border-radius:50%;margin-bottom:15px;border:3px solid #667eea;}.categories-list,.tags-list{list-style:none;}.categories-list li,.tags-list li{margin-bottom:10px;}.categories-list a,.tags-list a{color:#333;text-decoration:none;transition:color 0.3s;}.categories-list a:hover,.tags-list a:hover{color:#667eea;}.tags-list{display:flex;flex-wrap:wrap;gap:10px;}.tag{padding:5px 15px;background:#f0f0f0;border-radius:20px;font-size:0.9em;}.recent-posts .recent-post{display:flex;gap:15px;margin-bottom:20px;}.recent-post-img{width:80px;height:80px;border-radius:5px;object-fit:cover;}.recent-post-content h4{margin-bottom:5px;}.recent-post-content h4 a{color:#333;text-decoration:none;}.recent-post-content h4 a:hover{color:#667eea;}.recent-post-date{color:#666;font-size:0.9em;}.newsletter-form{margin-top:15px;}.newsletter-form input{width:100%;padding:12px;border:1px solid #ddd;border-radius:5px;margin-bottom:10px;}.newsletter-form button{width:100%;padding:12px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer;transition:background 0.3s;}.newsletter-form button:hover{background:#764ba2;}.footer{background:#1a1a2e;color:white;padding:60px 0;margin-top:60px;}.footer-content{display:grid;grid-template-columns:repeat(4,1fr);gap:40px;}.footer-section h3{font-size:1.3em;margin-bottom:20px;color:#667eea;}.footer-section p{color:#aaa;line-height:1.7;margin-bottom:20px;}.footer-links{list-style:none;}.footer-links li{margin-bottom:10px;}.footer-links a{color:#aaa;text-decoration:none;transition:color 0.3s;}.footer-links a:hover{color:#667eea;}.social-links{display:flex;gap:15px;margin-top:20px;}.social-links a{display:inline-block;width:40px;height:40px;background:#667eea;color:white;border-radius:50%;text-align:center;line-height:40px;transition:background 0.3s,transform 0.3s;}.social-links a:hover{background:#764ba2;transform:translateY(-3px);}.copyright{text-align:center;padding-top:40px;margin-top:40px;border-top:1px solid #2d2d4a;color:#666;}.pagination{display:flex;justify-content:center;gap:10px;margin-top:40px;}.page-link{padding:10px 15px;background:white;color:#333;text-decoration:none;border-radius:5px;transition:all 0.3s;}.page-link:hover,.page-link.active{background:#667eea;color:white;}.featured-post{grid-column:1/-1;}.featured-post .post{background:linear-gradient(135deg,rgba(102,126,234,0.1),rgba(118,75,162,0.1));border:2px solid #667eea;}.post-img{width:100%;height:300px;object-fit:cover;border-radius:10px;margin-bottom:20px;}.post-content img{max-width:100%;height:auto;border-radius:10px;margin:20px 0;}@media(max-width:768px){.main-content{grid-template-columns:1fr;}.nav-container{flex-direction:column;gap:15px;}.nav-links{flex-direction:column;gap:15px;text-align:center;}.footer-content{grid-template-columns:1fr;text-align:center;}.header h1{font-size:2em;}}</style></head><body><div class="container"><header class="header"><h1>✨ My Blog</h1><p>Sharing thoughts, ideas, and stories</p></header><nav class="nav"><div class="nav-container"><div class="logo">MyBlog</div><div class="nav-links"><a href="#home">Home</a><a href="#about">About</a><a href="#categories">Categories</a><a href="#contact">Contact</a></div></div></nav><main class="main-content"><section class="posts"><article class="post featured-post"><div class="post-meta"><span>📅 March 15, 2024</span><span>👤 John Doe</span><span>🏷️ Featured</span></div><h2 class="post-title">Welcome to My Blog Platform</h2><p class="post-excerpt">This is a sample blog post to demonstrate the capabilities of AppForge. You can easily customize this template to create your own beautiful blog...</p><a href="#read" class="read-more">Read More →</a></article><article class="post"><div class="post-meta"><span>📅 March 14, 2024</span><span>👤 Jane Smith</span><span>🏷️ Technology</span></div><h2 class="post-title">The Future of Web Development</h2><p class="post-excerpt">Exploring the latest trends and technologies shaping the future of web development. From AI-assisted coding to new frameworks...</p><a href="#read" class="read-more">Read More →</a></article><article class="post"><div class="post-meta"><span>📅 March 13, 2024</span><span>👤 Alex Johnson</span><span>🏷️ Design</span></div><h2 class="post-title">Creating Beautiful User Interfaces</h2><p class="post-excerpt">Learn how to create stunning user interfaces that are both functional and aesthetically pleasing. Tips and tricks from design experts...</p><a href="#read" class="read-more">Read More →</a></article><div class="pagination"><a href="#" class="page-link active">1</a><a href="#" class="page-link">2</a><a href="#" class="page-link">3</a><a href="#" class="page-link">Next →</a></div></section><aside class="sidebar"><div class="widget about-author"><div class="widget-title">👨‍💻 About Me</div><img src="https://via.placeholder.com/100" alt="Author" class="author-img"><p>Hello! I'm a passionate developer and writer. I love sharing knowledge about technology, design, and creative coding.</p></div><div class="widget"><div class="widget-title">📂 Categories</div><ul class="categories-list"><li><a href="#">Technology (12)</a></li><li><a href="#">Design (8)</a></li><li><a href="#">Development (15)</a></li><li><a href="#">Tips & Tricks (7)</a></li><li><a href="#">Inspiration (5)</a></li></ul></div><div class="widget"><div class="widget-title">🏷️ Popular Tags</div><div class="tags-list"><a href="#" class="tag">Web Dev</a><a href="#" class="tag">CSS</a><a href="#" class="tag">JavaScript</a><a href="#" class="tag">UI/UX</a><a href="#" class="tag">Mobile</a><a href="#" class="tag">React</a><a href="#" class="tag">Design</a></div></div><div class="widget"><div class="widget-title">📰 Recent Posts</div><div class="recent-posts"><div class="recent-post"><img src="https://via.placeholder.com/80" alt="Post" class="recent-post-img"><div class="recent-post-content"><h4><a href="#">Building Modern Websites</a></h4><div class="recent-post-date">March 12, 2024</div></div></div><div class="recent-post"><img src="https://via.placeholder.com/80" alt="Post" class="recent-post-img"><div class="recent-post-content"><h4><a href="#">CSS Grid Mastery</a></h4><div class="recent-post-date">March 10, 2024</div></div></div><div class="recent-post"><img src="https://via.placeholder.com/80" alt="Post" class="recent-post-img"><div class="recent-post-content"><h4><a href="#">JavaScript Tips</a></h4><div class="recent-post-date">March 8, 2024</div></div></div></div></div><div class="widget"><div class="widget-title">📧 Newsletter</div><p>Subscribe to get the latest posts directly in your inbox.</p><form class="newsletter-form"><input type="email" placeholder="Your email address" required><button type="submit">Subscribe</button></form></div></aside></main></div><footer class="footer"><div class="container"><div class="footer-content"><div class="footer-section"><h3>MyBlog</h3><p>A platform for sharing knowledge, ideas, and stories about technology and creativity.</p><div class="social-links"><a href="#">📘</a><a href="#">🐦</a><a href="#">📷</a><a href="#">💼</a></div></div><div class="footer-section"><h3>Quick Links</h3><ul class="footer-links"><li><a href="#">Home</a></li><li><a href="#">About</a></li><li><a href="#">Blog</a></li><li><a href="#">Contact</a></li></ul></div><div class="footer-section"><h3>Categories</h3><ul class="footer-links"><li><a href="#">Technology</a></li><li><a href="#">Design</a></li><li><a href="#">Development</a></li><li><a href="#">Inspiration</a></li></ul></div><div class="footer-section"><h3>Contact</h3><p>Email: hello@myblog.com</p><p>Phone: +1 234 567 890</p><p>Address: 123 Creative St, Digital City</p></div></div><div class="copyright">© 2024 MyBlog. All rights reserved. Created with AppForge.</div></div></footer><script>// Simple blog interactionsdocument.querySelectorAll('.read-more').forEach(link=>{link.addEventListener('click',(e)=>{e.preventDefault();alert('In a real blog, this would take you to the full article page.');});});document.querySelector('.newsletter-form').addEventListener('submit',(e)=>{e.preventDefault();const email=e.target.querySelector('input').value;alert('Thank you for subscribing with: '+email);e.target.reset();});document.querySelectorAll('.tag').forEach(tag=>{tag.addEventListener('click',(e)=>{e.preventDefault();alert('Filtering by tag: '+tag.textContent);});});</script></body></html>`
            }
        ];
    }

    loadTemplates() {
        const savedTemplates = this.utils.getStorage('templates', null);
        if (savedTemplates) {
            this.templates = savedTemplates;
        }
    }

    loadFavorites() {
        const savedFavorites = this.utils.getStorage('favorites', []);
        this.favorites = new Set(savedFavorites);
    }

    renderTemplates() {
        const templateGrid = document.getElementById('templateGrid');
        if (!templateGrid) return;

        templateGrid.innerHTML = '';

        this.templates.forEach(template => {
            const templateCard = this.createTemplateCard(template);
            templateGrid.appendChild(templateCard);
        });
    }

    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.id = template.id;
        
        const isFavorite = this.favorites.has(template.id);
        
        card.innerHTML = `
            <div class="template-preview">${template.preview}</div>
            <div class="template-info">
                <h4>${template.name}</h4>
                <p>${template.description}</p>
                <div class="template-actions">
                    <button class="btn btn-outline btn-small use-template" data-id="${template.id}">Use</button>
                    <button class="btn btn-outline btn-small preview-template" data-id="${template.id}">Preview</button>
                    <button class="btn btn-outline btn-small favorite-btn ${isFavorite ? 'active' : ''}" data-id="${template.id}">
                        ${isFavorite ? '★' : '☆'}
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        card.querySelector('.use-template').addEventListener('click', () => this.useTemplate(template.id));
        card.querySelector('.preview-template').addEventListener('click', () => this.previewTemplate(template.id));
        card.querySelector('.favorite-btn').addEventListener('click', (e) => this.toggleFavorite(template.id, e.target));

        return card;
    }

    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        if (window.codeEditor) {
            window.codeEditor.setCode(template.code);
            this.utils.trackEvent('template_used', { template: templateId });
            this.uiManager.showToast(`"${template.name}" template loaded`, 'success');
            
            // Switch to editor tab
            const editorTab = document.querySelector('[data-tab="editor"]');
            if (editorTab) editorTab.click();
        }
    }

    previewTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        this.uiManager.showModal(
            `Preview: ${template.name}`,
            `<div class="template-preview-modal">
                <div class="template-preview-header">${template.preview}</div>
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="preview-actions">
                    <button class="btn btn-primary use-from-preview" data-id="${templateId}">Use This Template</button>
                </div>
            </div>`
        );

        // Add event listener for the use button in modal
        setTimeout(() => {
            const useBtn = document.querySelector('.use-from-preview');
            if (useBtn) {
                useBtn.addEventListener('click', () => {
                    this.useTemplate(templateId);
                    this.uiManager.closeModal();
                });
            }
        }, 100);
    }

    toggleFavorite(templateId, button) {
        if (this.favorites.has(templateId)) {
            this.favorites.delete(templateId);
            button.textContent = '☆';
            button.classList.remove('active');
            this.uiManager.showToast('Removed from favorites', 'info');
        } else {
            this.favorites.add(templateId);
            button.textContent = '★';
            button.classList.add('active');
            this.uiManager.showToast('Added to favorites', 'success');
        }

        // Save favorites
        this.utils.setStorage('favorites', Array.from(this.favorites));
        this.utils.trackEvent('template_favorite_toggled', { 
            template: templateId, 
            isFavorite: this.favorites.has(templateId) 
        });
    }

    addCustomTemplate(name, description, code) {
        const newTemplate = {
            id: this.utils.slugify(name) + '-' + this.utils.randomId(4),
            name,
            description,
            category: 'custom',
            preview: '⭐',
            code
        };

        this.templates.unshift(newTemplate);
        this.saveTemplates();
        this.renderTemplates();
        
        this.uiManager.showToast(`"${name}" template added`, 'success');
        this.utils.trackEvent('custom_template_added', { name });
        
        return newTemplate.id;
    }

    saveTemplates() {
        this.utils.setStorage('templates', this.templates);
    }

    getTemplateById(id) {
        return this.templates.find(t => t.id === id);
    }

    getTemplatesByCategory(category) {
        return this.templates.filter(t => t.category === category);
    }

    getFavoriteTemplates() {
        return this.templates.filter(t => this.favorites.has(t.id));
    }

    deleteTemplate(templateId) {
        const index = this.templates.findIndex(t => t.id === templateId);
        if (index === -1) return false;

        this.templates.splice(index, 1);
        this.favorites.delete(templateId);
        this.saveTemplates();
        this.renderTemplates();
        
        this.uiManager.showToast('Template deleted', 'info');
        this.utils.trackEvent('template_deleted', { template: templateId });
        
        return true;
    }

    exportTemplates() {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            templates: this.templates
        };

        const filename = `appforge-templates-${new Date().toISOString().split('T')[0]}.json`;
        this.utils.downloadFile(filename, JSON.stringify(exportData, null, 2), 'application/json');
        
        this.uiManager.showToast('Templates exported', 'success');
        this.utils.trackEvent('templates_exported');
    }

    importTemplates(file) {
        this.utils.readFile(file)
            .then(content => {
                try {
                    const data = JSON.parse(content);
                    
                    if (!data.templates || !Array.isArray(data.templates)) {
                        throw new Error('Invalid template file format');
                    }

                    // Add imported templates
                    data.templates.forEach(template => {
                        if (!this.templates.some(t => t.id === template.id)) {
                            this.templates.push(template);
                        }
                    });

                    this.saveTemplates();
                    this.renderTemplates();
                    
                    this.uiManager.showToast(`${data.templates.length} templates imported`, 'success');
                    this.utils.trackEvent('templates_imported', { count: data.templates.length });
                } catch (error) {
                    throw new Error('Invalid template file');
                }
            })
            .catch(error => {
                this.uiManager.showToast('Failed to import templates', 'error');
                console.error('Import error:', error);
            });
    }

    searchTemplates(query) {
        const searchTerm = query.toLowerCase();
        return this.templates.filter(template => 
            template.name.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm) ||
            template.category.toLowerCase().includes(searchTerm)
        );
    }

    renderSearchResults(query) {
        const results = this.searchTemplates(query);
        const templateGrid = document.getElementById('templateGrid');
        
        if (!templateGrid) return;

        if (results.length === 0) {
            templateGrid.innerHTML = `
                <div class="no-results">
                    <h3>No templates found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
            return;
        }

        templateGrid.innerHTML = '';
        results.forEach(template => {
            const templateCard = this.createTemplateCard(template);
            templateGrid.appendChild(templateCard);
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('templateSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query) {
                this.renderSearchResults(query);
            } else {
                this.renderTemplates();
            }
        });
    }

    setupCategories() {
        const categories = [...new Set(this.templates.map(t => t.category))];
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (!categoryFilter) return;

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = this.utils.capitalize(category);
            categoryFilter.appendChild(option);
        });

        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;
            if (category === 'all') {
                this.renderTemplates();
            } else {
                this.renderCategory(category);
            }
        });
    }

    renderCategory(category) {
        const filteredTemplates = this.getTemplatesByCategory(category);
        const templateGrid = document.getElementById('templateGrid');
        
        if (!templateGrid) return;

        templateGrid.innerHTML = '';
        filteredTemplates.forEach(template => {
            const templateCard = this.createTemplateCard(template);
            templateGrid.appendChild(templateCard);
        });
    }

    getTemplateStats() {
        return {
            total: this.templates.length,
            byCategory: this.templates.reduce((acc, template) => {
                acc[template.category] = (acc[template.category] || 0) + 1;
                return acc;
            }, {}),
            favorites: this.favorites.size
        };
    }
}

// Create global instance
window.templateManager = new TemplateManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateManager;
}
