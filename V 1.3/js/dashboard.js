import { auth, db, doc, getDoc, setDoc, updateDoc, arrayUnion, increment, onAuthStateChanged, signOut, collection, query, orderBy, limit, getDocs } from "./firebase-config.js";
import { COURSE_DATA } from "./course-data.js";
import { startInteractiveQuiz } from "./interactive-quiz.js";
import { MemoryMatrix } from "./games/memory-matrix.js";
import { RapidFire } from "./games/rapid-fire.js";

/* ===============================
   DOM ELEMENTS
================================ */
const sidebarUsername = document.getElementById("sidebar-username");
const xpCount = document.getElementById("xp-count");
const streakCount = document.getElementById("streak-count");
const currentCourseName = document.getElementById("current-course-name");
const courseDropdown = document.getElementById("course-dropdown");
const mainContentArea = document.getElementById("main-content-area");
const pageTitle = document.getElementById("page-title");
const logoutBtn = document.getElementById("logout-btn");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarNav = document.getElementById("sidebar-nav");

/* ===============================
   STATE
================================ */
let userProfile = null;
let currentCourseId = null;
let currentView = "overview";

/* ===============================
   AUTH & INIT
================================ */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  await loadUserData(user.uid);
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Mobile Sidebar Toggle
if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    sidebarNav.classList.toggle("d-none"); // Toggle visibility classes standard BS
    sidebarNav.classList.toggle("mobile-show"); // Custom class for animation if needed
  });
}

/* ===============================
   DATA PERSISTENCE (REAL)
================================ */
async function loadUserData(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  userProfile = {
    name: snap.data().name || "Student",
    xp: snap.data().xp || 0,
    streak: snap.data().streak || 0,
    level: snap.data().level || 1,
    class: snap.data().class || "Beginner",
    email: snap.data().email || "",
    completedChapters: snap.data().completedChapters || [],
    history: [] // Will fetch separately if needed, or use subcollection
  };

  // 1. Fetch History (Recent 5)
  try {
    const historyQ = query(collection(db, "users", uid, "history"), orderBy("timestamp", "desc"), limit(5));
    const historySnap = await getDocs(historyQ);
    userProfile.history = [];
    historySnap.forEach(doc => {
      userProfile.history.push(doc.data());
    });
  } catch (e) { console.warn("History fetch error:", e); }

  // 2. Fetch Performance Stats (Aggregate from subcollection)
  userProfile.performance = { totalGames: 0, avgAccuracy: 0 };
  try {
    const perfSnap = await getDocs(collection(db, "users", uid, "performance"));
    let totalMastery = 0;
    let count = 0;
    let totalGames = 0;

    perfSnap.forEach(doc => {
      const data = doc.data();
      totalGames += (data.gamesPlayed || 0);
      totalMastery += (data.masteryPercentage || 0) * (data.gamesPlayed || 1); // Weighted
      count += (data.gamesPlayed || 0);
    });

    userProfile.performance.totalGames = totalGames;
    userProfile.performance.avgAccuracy = count > 0 ? Math.round(totalMastery / count) : 0;
  } catch (e) { console.warn("Performance fetch error:", e); }

  renderSidebarProfile();

  const courses = COURSE_DATA["UG"] || Object.values(COURSE_DATA)[0];
  currentCourseId = courses[0].id;

  renderCourseDropdown(courses);
  renderView();
}

/* ===============================
   CORE FUNCTIONS
================================ */
function getChapterStatus(chapter, index, allChapters) {
  if (userProfile.completedChapters.includes(chapter.id)) return 'completed';
  // First chapter or previous completed = open
  if (index === 0) return 'open';
  const prevChapter = allChapters[index - 1];
  if (userProfile.completedChapters.includes(prevChapter.id)) return 'open';
  return 'locked';
}

function getActiveCourse() {
  const courses = COURSE_DATA["UG"] || Object.values(COURSE_DATA)[0];
  if (!courses || courses.length === 0) return null;

  // Create a copy of the course data to inject REAL status
  let courseData = JSON.parse(JSON.stringify(courses.find((c) => c.id === currentCourseId) || courses[0]));

  // Inject status dynamically
  courseData.chapters = courseData.chapters.map((chap, idx) => ({
    ...chap,
    status: getChapterStatus(chap, idx, courseData.chapters)
  }));

  return courseData;
}

function calculateAdaptation() {
  const acc = userProfile.performance.avgAccuracy || 0;
  const gamesPlayed = userProfile.performance.totalGames || 0;

  let level = "Beginner";
  if (gamesPlayed > 5 && acc > 60) level = "Intermediate";
  if (gamesPlayed > 20 && acc > 85) level = "Advanced";

  return {
    accuracy: acc,
    level,
    gamesPlayed,
    nextDifficulty: acc < 60 ? "Easy" : acc < 80 ? "Medium" : "Hard",
  };
}


/* ===============================
   NAVIGATION
================================ */
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    if (!link.dataset.view) return;
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach((l) =>
      l.classList.remove("active")
    );
    link.classList.add("active");
    currentView = link.dataset.view;
    renderView();
    // Close mobile sidebar on nav click
    if (window.innerWidth < 768) sidebarNav.classList.add("d-none");
  });
});

/* ===============================
   VIEW RENDERER
================================ */
function renderView() {
  const course = getActiveCourse();
  if (!course) return;

  if (currentView === "overview") renderOverview(course);
  if (currentView === "chapters") renderChapters(course);
  if (currentView === "games") renderGames(course);
  if (currentView === "leaderboard") renderLeaderboard();
  if (currentView === "ai-tutor") renderAITutor();
  if (currentView === "about") renderAbout(course);
  if (currentView === "profile") renderProfile(course);
  if (currentView === "settings") renderSettings(course);

  renderSidebarProfile(); // Refresh XP/Stats
}

function renderSidebarProfile() {
  sidebarUsername.textContent = userProfile.name;
  xpCount.textContent = userProfile.xp || 0;
  streakCount.textContent = userProfile.streak || 0;
}

function renderCourseDropdown(courses) {
  const active = courses.find((c) => c.id === currentCourseId);
  currentCourseName.textContent = active.name;

  courseDropdown.innerHTML = courses
    .map(
      (c) => `
      <li>
        <a class="dropdown-item" href="#" onclick="switchCourse('${c.id}')">
          ${c.name}
        </a>
      </li>`
    )
    .join("");

  window.switchCourse = (id) => {
    currentCourseId = id;
    renderCourseDropdown(courses);
    renderView();
  };
}


/* ===============================
   1. OVERVIEW (WINNING SCREEN STYLE)
================================ */
function renderOverview(course) {
  pageTitle.textContent = "Dashboard";
  const adapt = calculateAdaptation();

  // History List
  const historyHtml = userProfile.history.length > 0
    ? userProfile.history.map(h => `
        <div class="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
          <div>
            <div class="fw-bold text-white">${(h.topic || "Unknown").toUpperCase()}</div>
            <small class="text-white-50">${h.timestamp && h.timestamp.seconds ? new Date(h.timestamp.seconds * 1000).toLocaleDateString() : "Just now"}</small>
          </div>
          <div class="text-end">
            <div class="fw-bold ${h.percentage >= 70 ? 'text-success' : 'text-warning'}">${h.percentage || 0}%</div>
            <small class="text-white-50">${h.score || 0}/${h.total || 0} Correct</small>
          </div>
        </div>
      `).join('')
    : `<div class="p-4 text-center text-white-50">No recent activity. Start learning!</div>`;

  mainContentArea.innerHTML = `
    <div class="row g-4">
      <!-- WELCOME HERO -->
      <div class="col-12">
        <div class="p-5 rounded-4 text-white shadow-lg position-relative overflow-hidden" 
             style="background: linear-gradient(135deg, #0946a1 0%, #109db9 100%);">
          <div class="position-absolute top-0 end-0 opacity-25 p-4">
            <img src="logo.png" alt="Medha" height="48" style="filter: brightness(0) invert(1);">
          </div>
          <h2 class="fw-bold mb-2" style="color: white;">Welcome back, ${userProfile.name}!</h2>
          <p class="fs-5 opacity-75 mb-4" style="color: white;">Track: ${userProfile.class}</p>
          
          <div class="d-flex gap-4">
             <div>
               <small class="text-uppercase opacity-75 fw-bold" style="font-size: 0.7rem;">Current Level</small>
               <div class="fs-4 fw-bold"><i class="bi bi-trophy-fill text-warning me-2"></i> Level ${userProfile.level}</div>
             </div>
             <div>
               <small class="text-uppercase opacity-75 fw-bold" style="font-size: 0.7rem;">Total XP</small>
               <div class="fs-4 fw-bold"><i class="bi bi-lightning-fill text-warning me-2"></i> ${userProfile.xp}</div>
             </div>
          </div>
        </div>
      </div>

      <!-- STATS & AI -->
      <div class="col-md-8">
           <!-- AI ADAPTATION CARD -->
             <div class="card bg-dark text-white border-0 shadow-sm rounded-4 h-100" style="background-color: #212529 !important;">
               <div class="card-body p-4">
                 <div class="d-flex justify-content-between align-items-center mb-4">
                   <h5 class="fw-bold m-0"  style="color:white;"><i class="bi bi-cpu-fill text-primary me-2"></i>Performance Stats</h5>
                   <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill">
                     ${adapt.level} User
                   </span>
                 </div>
                 
                 <div class="row text-center g-3">
                   <div class="col-4">
                     <div class="p-3 rounded-4 bg-white bg-opacity-10">
                       <h3 class="fw-bold mb-1 ${adapt.accuracy >= 70 ? 'text-success' : adapt.accuracy >= 50 ? 'text-warning' : 'text-danger'}">
                         ${adapt.accuracy}%
                       </h3>
                       <small class="text-white-50">Avg. Accuracy</small>
                     </div>
                   </div>
                   <div class="col-4">
                     <div class="p-3 rounded-4 bg-white bg-opacity-10">
                       <h3 class="fw-bold mb-1 text-white">${adapt.gamesPlayed}</h3>
                       <small class="text-white-50">Quizzes Solved</small>
                     </div>
                   </div>
                   <div class="col-4">
                     <div class="p-3 rounded-4 bg-white bg-opacity-10">
                       <h3 class="fw-bold mb-1 text-info" style="color: #079dba !important;">${adapt.nextDifficulty}</h3>
                       <small class="text-white-50" sty>Rec. Difficulty</small>
                     </div>
                   </div>
                 </div>

                 <div class="mt-4 pt-3 border-top border-white border-opacity-10">
                   <button class="btn btn-primary w-100 rounded-pill py-2 fw-bold" onclick="document.querySelector('[data-view=games]').click()">
                     <i class="bi bi-play-fill me-2"></i> Start Adaptive Quiz
                   </button>
                 </div>
               </div>
             </div>
      </div>

      <!-- RECENT ACTIVITY -->
      <div class="col-md-4">
        <div class="card bg-dark text-white border-0 shadow-sm rounded-4 h-100" style="background-color: #212529 !important;">
            <div class="card-body p-4">
            <h5 class="fw-bold mb-4"  style="color:white;><i class="bi bi-clock-history text-info me-2"></i> Recent Activity</h5>
            <div class="vstack gap-0">
                ${historyHtml}
            </div>
            </div>
        </div>
      </div>

    </div>
  `;
}

/* ===============================
   2. CHAPTERS (REAL PERSISTENCE)
================================ */
function renderChapters(course) {
  pageTitle.textContent = "Modules & Chapters";

  // Calculate progress
  const completedCount = course.chapters.filter(c => c.status === 'completed').length;
  const progressPercent = Math.round((completedCount / course.chapters.length) * 100);

  const chaptersHtml = course.chapters.map((chap, index) => {
    const isCompleted = chap.status === 'completed';
    const isCurrent = chap.status === 'open';
    const isLocked = chap.status === 'locked';

    let circleClass = isCompleted ? 'circle-completed' : (isCurrent ? 'circle-current' : 'circle-locked');
    let circleContent = isCompleted ? '<i class="bi bi-check-lg"></i>' : index + 1;
    let pillClass = isCompleted ? 'bg-pill-completed' : (isCurrent ? 'bg-pill-progress' : 'bg-pill-locked');
    let pillText = isCompleted ? 'Completed' : (isCurrent ? 'In Progress' : 'Locked');

    const clickAttr = !isLocked ? `onclick="openChapterDetail('${chap.id}')"` : '';
    const opacityClass = isLocked ? 'opacity-75' : '';

    return `
        <div class="chapter-list-card ${opacityClass}" ${clickAttr} id="chap-card-${chap.id}">
            <div class="chapter-row-content">
                <div class="chapter-circle ${circleClass}">
                    ${circleContent}
                </div>
                <div>
                    <h5 class="fw-bold text-dark mb-0">${chap.title}</h5>
                    <div class="status-pill ${pillClass}">${pillText}</div>
                </div>
            </div>
            <i class="bi bi-chevron-right chapter-arrow"></i>
        </div>
        `;
  }).join("");

  mainContentArea.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted small fw-bold uppercase">Course Progress</span>
                    <span class="fw-bold text-primary">${progressPercent}%</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            
            <div id="chapters-list-container">
                ${chaptersHtml}
            </div>
            <div id="chapter-detail-view" class="d-none"></div>
        </div>
    `;

  window.openChapterDetail = (id) => {
    const chap = course.chapters.find(c => c.id === id);
    if (!chap) return;

    const detailContainer = document.getElementById('chapter-detail-view');
    const listContainer = document.getElementById('chapters-list-container');

    listContainer.classList.add('d-none');
    detailContainer.classList.remove('d-none');

    const isCompleted = chap.status === 'completed';

    detailContainer.innerHTML = `
            <button class="btn btn-link text-decoration-none mb-3 p-0 fw-bold" onclick="closeChapterDetail()">
                <i class="bi bi-arrow-left me-2"></i> Back to Course
            </button>
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-4">
                         <h2 class="fw-bold m-0">${chap.title}</h2>
                         <span class="badge ${isCompleted ? 'bg-success' : 'bg-primary'} rounded-pill px-3 py-2">
                            ${isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                         </span>
                    </div>
                    
                    <div class="ratio ratio-16x9 rounded-4 overflow-hidden mb-4 shadow-sm bg-dark">
                         ${chap.video ? `<iframe src="${chap.video}" title="Chapter Video" allowfullscreen></iframe>` : '<div class="d-flex align-items-center justify-content-center h-100 text-white">No Video Available</div>'}
                    </div>
                    
                    <div class="prose max-w-none p-2 mb-4">
                        ${marked.parse(chap.content || "")}
                    </div>
                    
                     <!-- QUIZ & ARCADE SECTION -->
                    <div class="row g-3 mb-4">
                        <div class="col-md-12">
                            <div class="bg-light p-4 rounded-4 border">
                                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div>
                                        <h5 class="fw-bold mb-1"><i class="bi bi-controller text-primary me-2"></i> Practice Arcade</h5>
                                        <p class="mb-0 text-muted small">Master this chapter with AI-powered games.</p>
                                    </div>
                                    <div class="d-flex gap-2">
                                        <button class="btn btn-outline-primary rounded-pill px-3" onclick="startGame('memory', '${course.id}', '${chap.id}')">
                                            <i class="bi bi-puzzle me-1"></i> Memory
                                        </button>
                                        <button class="btn btn-outline-danger rounded-pill px-3" onclick="startGame('rapid', '${course.id}', '${chap.id}')">
                                            <i class="bi bi-lightning-charge me-1"></i> Rapid Fire
                                        </button>
                                        <button class="btn btn-primary rounded-pill px-4" onclick="launchQuiz('${course.id}', '${chap.id}')">
                                            <i class="bi bi-play-fill me-1"></i> Play Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <div class="mt-4 pt-4 border-top d-flex justify-content-between align-items-center">
                         <button class="btn btn-outline-secondary rounded-pill" onclick="closeChapterDetail()">Previous</button>
                         ${!isCompleted
        ? `<button id="btn-complete-${chap.id}" class="btn btn-success rounded-pill px-4" onclick="markComplete('${chap.id}')">
                                <i class="bi bi-check-circle-fill me-2"></i> Mark as Complete
                              </button>`
        : `<button class="btn btn-success rounded-pill px-4" disabled>
                                <i class="bi bi-check-all me-2"></i> Completed
                              </button>`
      }
                    </div>
                </div>
            </div>
        `;
  };

  window.closeChapterDetail = () => {
    document.getElementById('chapter-detail-view').classList.add('d-none');
    document.getElementById('chapters-list-container').classList.remove('d-none');
    renderView();
  };

  // REAL FIRESTORE WRITE
  window.markComplete = async (chapterId) => {
    const btn = document.getElementById(`btn-complete-${chapterId}`);
    if (btn) btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        completedChapters: arrayUnion(chapterId),
        xp: increment(50)
      });

      // Update local state immediately
      userProfile.completedChapters.push(chapterId);
      userProfile.xp = (userProfile.xp || 0) + 50;

      // Refresh view
      if (btn) {
        btn.className = "btn btn-success rounded-pill px-4";
        btn.innerHTML = '<i class="bi bi-check-all me-2"></i> Saved!';
        btn.disabled = true;
      }
      setTimeout(() => {
        closeChapterDetail();
      }, 1000);

    } catch (e) {
      console.error("Error saving progress:", e);
      alert("Failed to save progress. Check console.");
      if (btn) btn.innerHTML = "Retry";
    }
  };

  window.marked = window.marked || { parse: (t) => t.replace(/\n/g, '<br>') };
}

/* ===============================
   3. LEADERBOARD (REAL DATA)
================================ */
async function renderLeaderboard() {
  pageTitle.textContent = "Global Leaderboard";
  mainContentArea.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;

  try {
    const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
    const snap = await getDocs(q);

    let rank = 1;
    const rows = [];

    snap.forEach(doc => {
      const d = doc.data();
      const isMe = doc.id === auth.currentUser.uid;
      rows.push(`
                <tr class="${isMe ? 'table-primary border-primary' : ''}">
                    <td class="text-center fw-bold text-muted">#${rank++}</td>
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <div class="avatar-placeholder rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.8rem;">
                                ${d.name ? d.name[0].toUpperCase() : 'U'}
                            </div>
                            <span class="fw-bold ${isMe ? 'text-primary' : 'text-dark'}">${d.name || "Anonymous"}</span>
                            ${isMe ? '<span class="badge bg-primary ms-2">You</span>' : ''}
                        </div>
                    </td>
                    <td class="text-end fw-bold">${d.xp || 0} XP</td>
                    <td class="text-center"><span class="badge bg-light text-dark border">Lvl ${d.level || 1}</span></td>
                </tr>
            `);
    });

    mainContentArea.innerHTML = `
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle table-leaderboard">
                        <thead class="bg-light">
                            <tr>
                                <th class="py-3 text-center" style="width: 80px;">Rank</th>
                                <th class="py-3">Student</th>
                                <th class="py-3 text-end">XP Earned</th>
                                <th class="py-3 text-center">Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
  } catch (e) {
    console.error("Leaderboard error:", e);
    mainContentArea.innerHTML = `<div class="alert alert-danger">Leaderboard Error: ${e.message}</div>`;
  }
}

/* ===============================
   4. OTHER VIEWS (GAMES, AI, ABOUT)
================================ */
function renderGames(course) {
  pageTitle.textContent = "Practice Games";
  const games = course.games || [];

  mainContentArea.innerHTML = `
    <div class="row g-4">
      <!-- 1. Memory Matrix -->
      <div class="col-md-3">
        <div class="card p-4 shadow-sm rounded-4 text-center h-100 border-0 stat-card">
          <div class="stat-icon-bg bg-info bg-opacity-10 text-info mx-auto mb-3">
            <i class="bi bi-grid-3x3-gap-fill"></i>
          </div>
          <h4 class="fw-bold">Memory Matrix</h4>
          <p class="text-muted small">Match terms with definitions to test your recall.</p>
          <button class="btn btn-outline-info rounded-pill w-100 mt-auto" onclick="startGame('memory', '${course.id}')">Play Memory</button>
        </div>
      </div>

      <!-- 2. Rapid Fire -->
      <div class="col-md-3">
        <div class="card p-4 shadow-sm rounded-4 text-center h-100 border-0 stat-card">
          <div class="stat-icon-bg bg-danger bg-opacity-10 text-danger mx-auto mb-3">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
          <h4 class="fw-bold">Rapid Fire</h4>
          <p class="text-muted small">Answer quickly before the timer runs out!</p>
          <button class="btn btn-outline-danger rounded-pill w-100 mt-auto" onclick="startGame('rapid', '${course.id}')">Play Rapid Fire</button>
        </div>
      </div>

      <!-- 3. AI Quiz -->
      <div class="col-md-3">
        <div class="card p-4 shadow-sm rounded-4 text-center h-100 border-0 stat-card">
          <div class="stat-icon-bg bg-purple bg-opacity-10 text-purple mx-auto mb-3" style="color: #9333ea; background: #f3e8ff;">
             <i class="bi bi-magic"></i>
          </div>
          <h4 class="fw-bold">AI Quiz</h4>
          <p class="text-muted small">Adaptive questions generated by AI for you.</p>
           <button class="btn btn-primary rounded-pill w-100 mt-auto" onclick="launchQuiz('${course.id}', null, true)">Start AI Session</button>
        </div>
      </div>

      <!-- 4. Medha City -->
      <div class="col-md-3">
        <div class="card p-4 shadow-sm rounded-4 text-center h-100 border-0 stat-card">
          <div class="stat-icon-bg bg-success bg-opacity-10 text-success mx-auto mb-3">
             <i class="bi bi-buildings-fill"></i>
          </div>
          <h4 class="fw-bold">Medha City</h4>
          <p class="text-muted small">Explore the learning city and complete quests.</p>
           <button class="btn btn-success rounded-pill w-100 mt-auto" onclick="new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play(); setTimeout(() => window.location.href='advanced games/Medha City/index.html', 300)">Enter City</button>
        </div>
      </div>
    </div>
  `;
}

function renderAITutor() {
  pageTitle.textContent = "AI Tutor";
  mainContentArea.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4" style="height: 600px;">
            <div class="card-body d-flex flex-column justify-content-center align-items-center text-center p-5">
                <div class="mb-4">
                    <img src="https://cdn-icons-png.flaticon.com/512/4712/4712038.png" width="120" alt="AI Robot">
                </div>
                <h3 class="fw-bold">Hi, I'm Medha AI!</h3>
                <p class="text-muted" style="max-width: 400px;">
                    I'm here to help you solve doubts. Ask me anything about Data Structures, Algorithms, or your current course.
                </p>
                <div class="input-group mt-4" style="max-width: 500px;">
                    <input type="text" class="form-control rounded-start-pill ps-4" placeholder="Ask a question..." id="ai-input">
                    <button class="btn btn-primary rounded-end-pill px-4 fw-bold" onclick="alert('AI Integration Coming Soon! This is a UI Demo.')">Ask</button>
                </div>
            </div>
        </div>
    `;
}

function renderAbout(course) {
  pageTitle.textContent = "About Course";
  const videoCount = course.chapters.filter(c => c.video).length;

  const learningPoints = course.learningPoints || [
    "Fundamental concepts and theory",
    "Real-world problem solving",
    "Hands-on coding exercises",
    "Final project implementation"
  ];

  const pointsHtml = learningPoints.map(p => `
    <div class="col-md-6">
        <div class="learning-point">
            <i class="bi bi-check-circle-fill"></i>
            <span class="small fw-semibold">${p}</span>
        </div>
    </div>
  `).join('');

  mainContentArea.innerHTML = `
        <div class="row g-4">
            <!-- Main Content -->
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm rounded-4 p-5 mb-4">
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 w-auto align-self-start mb-3 px-3 py-2 rounded-pill">
                        ${course.level || "Beginner"}
                    </span>
                    <h1 class="fw-bold mb-3 display-5">${course.name}</h1>
                    <p class="lead text-muted mb-4">${course.desc || "Master the fundamentals of " + course.name + " with our comprehensive curriculum."}</p>
                    
                    <div class="d-flex flex-wrap gap-4 mb-5 border-bottom pb-4">
                        <div class="d-flex align-items-center gap-2">
                             <i class="bi bi-collection-play text-muted fs-4"></i>
                             <div>
                                <div class="fw-bold">${course.totalChapters || course.chapters.length} Modules</div>
                                <small class="text-muted">Comprehensive</small>
                             </div>
                        </div>
                         <div class="d-flex align-items-center gap-2">
                             <i class="bi bi-clock-history text-muted fs-4"></i>
                             <div>
                                <div class="fw-bold">${course.duration || "Self-Paced"}</div>
                                <small class="text-muted">Duration</small>
                             </div>
                        </div>
                         <div class="d-flex align-items-center gap-2">
                             <i class="bi bi-award text-muted fs-4"></i>
                             <div>
                                <div class="fw-bold">Certificate</div>
                                <small class="text-muted">On completion</small>
                             </div>
                        </div>
                    </div>

                    <h4 class="fw-bold mb-3">What you'll learn</h4>
                    <div class="row g-3">
                        ${pointsHtml}
                    </div>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="col-lg-4">
   

                    <hr>
                    <h5 class="fw-bold mb-3">Prerequisites</h5>
                    <ul class="list-unstyled text-muted small">
                         ${(course.prerequisites || ["None"]).map(p => `<li><i class="bi bi-dot"></i> ${p}</li>`).join('')}
                    </ul>
                    
                    <button class="btn btn-primary w-100 rounded-pill fw-bold" onclick="document.querySelector('[data-view=chapters]').click()">
                        Go to Curriculum
                    </button>
                </div>
            </div>
        </div>
    `;
}

/* ===============================
   5. PROFILE & SETTINGS
================================ */
function renderProfile() {
  pageTitle.textContent = "My Profile";
  mainContentArea.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center">
            <div class="avatar-placeholder rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 100px; height: 100px; font-size: 3rem;">
                ${userProfile.name[0].toUpperCase()}
            </div>
            <h2 class="fw-bold">${userProfile.name}</h2>
            <p class="text-muted">${userProfile.email}</p>
            
            <div class="row g-4 mt-4">
                <div class="col-4">
                    <div class="p-3 bg-light rounded-3">
                        <h3 class="fw-bold mb-0">${userProfile.xp || 0}</h3>
                        <small class="text-muted">Total XP</small>
                    </div>
                </div>
                 <div class="col-4">
                    <div class="p-3 bg-light rounded-3">
                        <h3 class="fw-bold mb-0">${userProfile.level || 1}</h3>
                        <small class="text-muted">Level</small>
                    </div>
                </div>
                 <div class="col-4">
                    <div class="p-3 bg-light rounded-3">
                        <h3 class="fw-bold mb-0">${userProfile.completedChapters.length}</h3>
                        <small class="text-muted">Chapters Completed</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderSettings() {
  pageTitle.textContent = "Settings";
  mainContentArea.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5">
            <h4 class="fw-bold mb-4">Account Settings</h4>
            <form>
                <div class="mb-3">
                    <label class="form-label">Display Name</label>
                    <input type="text" class="form-control" value="${userProfile.name}">
                </div>
                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" value="${userProfile.email}" disabled>
                </div>
                 <div class="mb-3">
                    <label class="form-label">Track / Class</label>
                    <select class="form-select">
                        <option>B.Tech - CSE</option>
                        <option>B.Tech - ECE</option>
                        <option>B.Sc - CS</option>
                    </select>
                </div>
                <button type="button" class="btn btn-primary" onclick="alert('Profile Updated!')">Save Changes</button>
            </form>
        </div>
    `;
}

function canPlayGame(game) { return true; }


window.launchQuiz = (courseId, chapterId = null, useAI = false) => {
  startInteractiveQuiz(courseId, chapterId, useAI);
};

window.launchArcadeHub = (courseId) => {
  // Show a modal/overlay to choose game
  const hubHtml = `
        <div class="game-overlay" style="display: flex;" id="arcade-hub-overlay">
            <button class="close-game-btn" onclick="document.getElementById('arcade-hub-overlay').remove()"><i class="bi bi-x-lg"></i></button>
            <div class="game-container text-center text-white">
                <h2 class="fw-bold mb-5 display-4" style="color: white;">Select Game Mode</h2>
                <div class="row g-4 justify-content-center">
                    <div class="col-md-5">
                        <div class="card bg-dark border-secondary h-100 p-4 hover-lift" style="cursor: pointer;" onclick="startGame('memory', '${courseId}')">
                             <div class="display-1 mb-3">🧩</div>
                             <h3 style="color: white;">Memory Matrix</h3>
                             <p style="color: white;">Match terms with definitions. Test your recall!</p>
                        </div>
                    </div>
                    <div class="col-md-5">
                         <div class="card bg-dark border-secondary h-100 p-4 hover-lift" style="cursor: pointer;" onclick="startGame('rapid', '${courseId}')">
                             <div class="display-1 mb-3">⚡</div>
                             <h3 style="color: white;">Rapid Fire</h3>
                             <p style="color: white;">Answer quickly before time runs out!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML('beforeend', hubHtml);
};

window.startGame = (type, courseId, chapterId = null) => {
  // Remove hub
  const hub = document.getElementById('arcade-hub-overlay');
  if (hub) hub.remove();

  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.id = 'active-game-container';
  document.body.appendChild(gameContainer);

  // Get Data
  const courses = COURSE_DATA["UG"] || Object.values(COURSE_DATA)[0];
  const course = courses.find(c => c.id === courseId) || courses[0];
  let chapter = null;
  if (chapterId) {
    chapter = course.chapters.find(ch => ch.id === chapterId);
  }

  if (type === 'memory') {
    const game = new MemoryMatrix('active-game-container', () => gameContainer.remove());
    // Prioritize chapter data, then course data, then fallback
    let pairs = [];
    if (chapter && chapter.memoryPairs) {
      pairs = chapter.memoryPairs;
    } else if (course.memoryPairs) {
      pairs = course.memoryPairs;
    } else {
      pairs = [
        { term: "CPU", def: "Central Processing Unit" },
        { term: "RAM", def: "Random Access Memory" },
        { term: "SSD", def: "Solid State Drive" },
        { term: "GPU", def: "Graphics Unit" }
      ];
    }
    game.start(pairs);
  } else if (type === 'rapid') {
    const game = new RapidFire('active-game-container', () => gameContainer.remove());
    // Prioritize chapter data
    let questions = [];
    if (chapter && chapter.rapidQuestions) {
      questions = chapter.rapidQuestions;
    } else if (course.rapidQuestions) {
      questions = course.rapidQuestions;
    } else {
      questions = course.quizQuestions || [
        { question: "Is C++ object oriented?", options: ["Yes", "No", "Maybe", "Sort of"], answer: 0 }
      ];
    }
    game.start(questions);
  }
};
