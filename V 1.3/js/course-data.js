export const COURSE_DATA = {
  UG: [
    {
      id: "ds-ug",
      name: "Data Structures",
      icon: "bi-diagram-3-fill",
      progress: 35,
      totalChapters: 8,
      nextMilestone: "Graph Guru",

      learningPoints: [
        "Master Arrays, Linked Lists, Trees, and Graphs",
        "Understand Time and Space Complexity (Big O)",
        "Solve 50+ LeetCode-style problems",
        "Implement data structures from scratch"
      ],
      quizQuestions: [
        {
          question: "What is the time complexity of accessing an element in an Array?",
          options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
          answer: 1
        },
        {
          question: "Which data structure follows LIFO (Last In First Out)?",
          options: ["Queue", "Stack", "Linked List", "Tree"],
          answer: 1
        },
        {
          question: "What is the worst-case search time in a Binary Search Tree?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          answer: 2
        },
        {
          question: "Which data structure is best for implementing a priority queue?",
          options: ["Array", "Linked List", "Heap", "Hash Map"],
          answer: 2
        },
        {
          question: "In a circular linked list, where does the last node point?",
          options: ["Null", "First Node", "Second Node", "Previous Node"],
          answer: 1
        }
      ],
      chapters: [
        {
          id: "arrays",
          title: "Arrays & Complexity",
          desc: "Understand memory layout and Big O notation.",
          mastery: 78,
          status: "completed",
          unlocksGame: true,
          video: "https://www.youtube.com/embed/RBSGKlAvoiM",
          content: `
### Key Concepts
- **Array**: Contiguous memory locations.
- **Time Complexity**: Access O(1), Search O(n).
- **Space Complexity**: O(n).

### Practice Problem
Given an array of integers, find the sum of all elements.
          `,
          questions: [
            { question: "What is index of first element in array?", options: ["0", "1", "-1", "Depends"], answer: 0 },
            { question: "Time complexity to access array by index?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 0 },
            { question: "Arrays store elements in...", options: ["Contiguous memory", "Random memory", "Linked nodes", "Files"], answer: 0 }
          ],
          memoryPairs: [
            { term: "Index", def: "Position Number" },
            { term: "Element", def: "Value at Index" },
            { term: "O(1)", def: "Access Time" },
            { term: "O(n)", def: "Search Time" },
            { term: "Length", def: "Total Items" },
            { term: "Bounds", def: "Valid Range" }
          ],
          rapidQuestions: [
            { question: "Array index starts at?", options: ["0", "1", "10", "None"], answer: 0 },
            { question: "Access speed?", options: ["Fast (Constant)", "Slow (Linear)", "Medium", "Random"], answer: 0 },
            { question: "Fixed size?", options: ["Yes", "No", "Maybe", "Sometimes"], answer: 0 },
            { question: "Can store different types?", options: ["No (in C)", "Yes", "Maybe", "Depends"], answer: 0 }
          ]
        },
        {
          id: "linked-lists",
          title: "Linked Lists",
          desc: "Nodes, pointers, and dynamic memory.",
          mastery: 52,
          status: "in-progress",
          unlocksGame: true,
          video: "https://www.youtube.com/embed/njTh_OwMljA",
          content: `
### Key Concepts
- **Singly Linked List**: One-way traversal.
- **Doubly Linked List**: Two-way traversal.
- **Circular List**: Last node points to first.

### Operations
- Insertion: O(1) at head.
- Deletion: O(1) if node is known.
          `,
          questions: [
            { question: "A linked list node contains...", options: ["Data and Link", "Data only", "Link only", "None"], answer: 0 },
            { question: "Time complexity to find an element?", options: ["O(n)", "O(1)", "O(log n)", "O(n^2)"], answer: 0 },
            { question: "Last node of singly linked list points to?", options: ["NULL", "Head", "Previous", "Random"], answer: 0 }
          ],
          memoryPairs: [
            { term: "Head", def: "First Node" },
            { term: "Tail", def: "Last Node" },
            { term: "Null", def: "End Marker" },
            { term: "Pointer", def: "Address Holder" }
          ],
          rapidQuestions: [
            { question: "Random access allowed?", options: ["No", "Yes", "Maybe", "Sometimes"], answer: 0 },
            { question: "Dynamic size?", options: ["Yes", "No", "Fixed", "Static"], answer: 0 }
          ]
        },
        {
          id: "stacks",
          title: "Stacks",
          desc: "LIFO (Last In First Out) principle.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/912eMND7Fgw",
          content: "Apps: Undo mechanism, Expression parsing.",
          questions: [
            { question: "Stack follows which order?", options: ["LIFO", "FIFO", "FILO", "LILO"], answer: 0 },
            { question: "Push adds element to...", options: ["Top", "Bottom", "Middle", "Random"], answer: 0 }
          ],
          memoryPairs: [
            { term: "Push", def: "Insert Top" },
            { term: "Pop", def: "Remove Top" },
            { term: "Peek", def: "View Top" },
            { term: "LIFO", def: "Last In First Out" }
          ],
          rapidQuestions: [
            { question: "LIFO stands for?", options: ["Last In First Out", "Low In Fast Out", "Left In Far Out", "None"], answer: 0 },
            { question: "Overflow condition?", options: ["Full Stack", "Empty Stack", "Null Stack", "NaN"], answer: 0 }
          ]
        },
        {
          id: "queues",
          title: "Queues",
          desc: "FIFO (First In First Out) principle.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/OkEA3Dn19h8",
          content: "Apps: Printer spooling, Task scheduling.",
          questions: [
            { question: "Queue follows which order?", options: ["FIFO", "LIFO", "LILO", "FILO"], answer: 0 },
            { question: "Enqueue adds to...", options: ["Rear", "Front", "Middle", "Top"], answer: 0 }
          ],
          memoryPairs: [
            { term: "Enqueue", def: "Add Rear" },
            { term: "Dequeue", def: "Remove Front" },
            { term: "FIFO", def: "First In First Out" },
            { term: "Front", def: "Head" }
          ],
          rapidQuestions: [
            { question: "FIFO stands for?", options: ["First In First Out", "Fast In Fast Out", "First In Far Out", "None"], answer: 0 },
            { question: "Underflow condition?", options: ["Empty Queue", "Full Queue", "Null Queue", "NaN"], answer: 0 }
          ]
        },
        {
          id: "trees-bst",
          title: "Binary Search Trees",
          desc: "Hierarchical data and efficient searching.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/pYoutubeVideoID",
          content: "Left child < Parent < Right child.",
          questions: [
            { question: "Max nodes in binary tree level 'l'?", options: ["2^l", "2*l", "l^2", "l+2"], answer: 0 },
            { question: "In BST, left child is...", options: ["Smaller", "Larger", "Equal", "Random"], answer: 0 }
          ],
          memoryPairs: [
            { term: "Root", def: "Top Node" },
            { term: "Leaf", def: "No Children" },
            { term: "Height", def: "Max Depth" },
            { term: "BST", def: "Ordered Tree" }
          ],
          rapidQuestions: [
            { question: "Time complexity search BST?", options: ["O(log n)", "O(n)", "O(1)", "O(n^2)"], answer: 0 },
            { question: "Root has no...", options: ["Parent", "Child", "Sibling", "Value"], answer: 0 }
          ]
        },
        {
          id: "heaps",
          title: "Heaps & Priority Queues",
          desc: "Max-Heap and Min-Heap structures.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/t0Cq6tVNRBA",
          content: "Efficient for extracting min/max.",
          questions: [{ question: "Max-Heap root is...", options: ["Largest", "Smallest", "Median", "Random"], answer: 0 }],
          memoryPairs: [{ term: "Max-Heap", def: "Root Largest" }, { term: "Min-Heap", def: "Root Smallest" }, { term: "Heapify", def: "Reorder" }],
          rapidQuestions: [{ question: "Heap is a...", options: ["Tree", "Graph", "List", "Hash"], answer: 0 }]
        },
        {
          id: "hashing",
          title: "Hashing",
          desc: "Hash maps and collision resolution.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/shs0KM3wKv8",
          content: "O(1) average search time.",
          questions: [{ question: "Hash function maps key to...", options: ["Index", "Value", "Pointer", "Node"], answer: 0 }],
          memoryPairs: [{ term: "Key", def: "Input" }, { term: "Hash", def: "Index" }, { term: "Collision", def: "Overlap" }],
          rapidQuestions: [{ question: "Ideal time complexity?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 0 }]
        },
        {
          id: "graphs-algo",
          title: "Graph Algorithms",
          desc: "BFS, DFS, Dijkstra.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/db-F25TspVs",
          content: "Shortest path and connectivity.",
          questions: [{ question: "BFS uses which structure?", options: ["Queue", "Stack", "Heap", "Tree"], answer: 0 }],
          memoryPairs: [{ term: "Vertex", def: "Node" }, { term: "Edge", def: "Connection" }, { term: "BFS", def: "Breadth First" }, { term: "DFS", def: "Depth First" }],
          rapidQuestions: [{ question: "DFS uses?", options: ["Stack", "Queue", "Array", "Heap"], answer: 0 }]
        }
      ],
      games: [
        {
          id: "array-blast",
          title: "Array Blast",
          type: "Arcade",
          difficulty: "Adaptive",
          xp: 150,
          requires: "arrays",
        },
        {
          id: "ll-vision-quiz",
          title: "Linked List Vision Quiz",
          type: "AI Quiz",
          difficulty: "Adaptive",
          xp: 200,
          requires: "linked-lists",
        }
      ],
    },
    {
      id: "c-prog",
      name: "C Programming",
      icon: "bi-file-type-c",
      progress: 60,
      totalChapters: 6,
      nextMilestone: "Pointer Pro",

      learningPoints: [
        "Understand variables, loops, and functions",
        "Master Pointers and Memory Management",
        "File Handling and Preprocessors",
        "Build 5 real-world CLI projects"
      ],
      quizQuestions: [
        {
          question: "What is the size of 'char' in C usually?",
          options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"],
          answer: 0
        },
        {
          question: "Which symbol is used for pointers?",
          options: ["&", "*", "#", "@"],
          answer: 1
        },
        {
          question: "How do you declare a constant in C?",
          options: ["var", "let", "const", "#define"],
          answer: 2
        },
        {
          question: "Which function is used to allocate memory dynamically?",
          options: ["alloc()", "mem()", "malloc()", "create()"],
          answer: 2
        },
        {
          question: "What does 'printf' stand for?",
          options: ["Print File", "Print Format", "Print Function", "Print Fast"],
          answer: 1
        }
      ],
      chapters: [
        {
          id: "c-basics",
          title: "C Basics & Syntax",
          desc: "Variables, loops, and functions.",
          mastery: 90,
          status: "completed",
          unlocksGame: true,
          video: "https://www.youtube.com/embed/KJgsSFOSQv0",
          content: `
### Hello World
All C programs start with \`main()\`.
\`\`\`c
#include <stdio.h>
int main() {
    printf("Hello World");
    return 0;
}
\`\`\`
          `,
          questions: [
            { question: "What ends a C statement?", options: [";", ".", ":", "}"], answer: 0 },
            { question: "Entry point of a C program?", options: ["main()", "start()", "init()", "run()"], answer: 0 },
            { question: "Correct way to formatting integer?", options: ["%d", "%s", "%c", "%f"], answer: 0 }
          ],
          memoryPairs: [
            { term: "int", def: "Integer" },
            { term: "float", def: "Decimal" },
            { term: "char", def: "Character" },
            { term: "printf", def: "Output" },
            { term: "scanf", def: "Input" },
            { term: "void", def: "No Return" }
          ],
          rapidQuestions: [
            { question: "Comment start?", options: ["//", "#", "<!--", ";"], answer: 0 },
            { question: "Loop type?", options: ["for", "repeat", "loop", "until"], answer: 0 },
            { question: "Include lib?", options: ["#include", "import", "using", "require"], answer: 0 }
          ]
        },
        {
          id: "pointers",
          title: "Pointers & Memory",
          desc: "Direct memory manipulation.",
          mastery: 40,
          status: "in-progress",
          unlocksGame: true,
          video: "https://www.youtube.com/embed/DplxIq0mc_Y",
          content: `
### Pointer Basics
- \`*\`: Value at address.
- \`&\`: Address of variable.
\`\`\`c
int a = 10;
int *p = &a;
\`\`\`
          `,
          questions: [{ question: "Address operator?", options: ["&", "*", "#", "@"], answer: 0 }],
          memoryPairs: [{ term: "&", def: "Address Of" }, { term: "*", def: "Value At" }, { term: "Resize", def: "realloc" }, { term: "Null Ptr", def: "Zero Addr" }],
          rapidQuestions: [{ question: "Pointer size (64-bit)?", options: ["8 bytes", "4 bytes", "2 bytes", "1 byte"], answer: 0 }]
        },
        {
          id: "arrays-c",
          title: "Arrays & Strings",
          desc: "Handling collections in C.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/full_link_here",
          content: "Strings are null-terminated character arrays.",
          questions: [{ question: "String terminator?", options: ["\\0", "\\n", "END", "."], answer: 0 }],
          memoryPairs: [{ term: "Array", def: "Fixed List" }, { term: "String", def: "Char Array" }, { term: "Index", def: "Offset" }, { term: "Size", def: "Capacity" }],
          rapidQuestions: [{ question: "Index starts at?", options: ["0", "1", "-1", "None"], answer: 0 }]
        },
        {
          id: "structs",
          title: "Structures & Unions",
          desc: "User-defined data types.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/d7k4j99eOvo",
          content: "Grouping variables of different types.",
          questions: [{ question: "Struct keyword?", options: ["struct", "class", "object", "type"], answer: 0 }],
          memoryPairs: [{ term: "struct", def: "Group Data" }, { term: "union", def: "Shared Mem" }, { term: "Member", def: "Field" }, { term: "Dot .", def: "Access" }],
          rapidQuestions: [{ question: "Size of union?", options: ["Largest Member", "Sum of Members", "Smallest Member", "Zero"], answer: 0 }]
        },
        {
          id: "file-io",
          title: "File I/O",
          desc: "Reading and writing files.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/2whgYI3MSjg",
          content: "fopen, fread, fwrite, fclose.",
          questions: [{ question: "Open file function?", options: ["fopen", "open", "file", "start"], answer: 0 }],
          memoryPairs: [{ term: "fopen", def: "Open" }, { term: "fclose", def: "Close" }, { term: "r", def: "Read Mode" }, { term: "w", def: "Write Mode" }],
          rapidQuestions: [{ question: "Read char?", options: ["fgetc", "get", "read", "input"], answer: 0 }]
        },
        {
          id: "dynamic-mem",
          title: "Dynamic Memory",
          desc: "malloc, calloc, free.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/udfbq5-LM4A",
          content: "Managing heap memory manually.",
          questions: [{ question: "Allocate memory?", options: ["malloc", "alloc", "new", "make"], answer: 0 }],
          memoryPairs: [{ term: "malloc", def: "Alloc Mem" }, { term: "free", def: "Release Mem" }, { term: "Heap", def: "Dyn Storage" }, { term: "Stack", def: "Local Vars" }],
          rapidQuestions: [{ question: "Memory leak caused by?", options: ["No free", "No malloc", "Bad pointer", "Null"], answer: 0 }]
        }
      ],
      games: []
    },
    {
      id: "python-basics",
      name: "Python",
      icon: "bi-file-type-py",
      progress: 10,
      totalChapters: 6,
      nextMilestone: "Snake Charmer",

      learningPoints: [
        "Write Pythonic code",
        "Data structures: Lists, Dicts, Sets, Tuples",
        "Object-Oriented Programming (OOP)",
        "Libraries: NumPy, Pandas basics"
      ],
      quizQuestions: [
        {
          question: "How do you start a comment in Python?",
          options: ["//", "/*", "#", "--"],
          answer: 2
        },
        {
          question: "Which data type is immutable?",
          options: ["List", "Dictionary", "Set", "Tuple"],
          answer: 3
        },
        {
          question: "What keyword is used to define a function?",
          options: ["func", "def", "function", "void"],
          answer: 1
        },
        {
          question: "How do you install libraries in Python?",
          options: ["npm install", "pip install", "apt-get", "brew"],
          answer: 1
        },
        {
          question: "What is the output of print(2 ** 3)?",
          options: ["5", "6", "8", "9"],
          answer: 2
        }
      ],
      chapters: [
        {
          id: "py-intro",
          title: "Introduction",
          desc: "Setup and basic syntax.",
          mastery: 100,
          status: "completed",
          video: "https://www.youtube.com/embed/kqtD5dpn9C8",
          content: "Python is interpreted, high-level, and general-purpose.",
          questions: [{ question: "Python extension?", options: [".py", ".python", ".p", ".pt"], answer: 0 }],
          memoryPairs: [{ term: "print()", def: "Output" }, { term: "input()", def: "Input" }, { term: "Int", def: "Whole Num" }, { term: "Str", def: "Text" }],
          rapidQuestions: [{ question: "Semicolons needed?", options: ["No", "Yes", "Sometimes", "Always"], answer: 0 }]
        },
        {
          id: "py-flow",
          title: "Control Flow",
          desc: "If/Else, Loops.",
          mastery: 80,
          status: "completed",
          video: "https://www.youtube.com/embed/PqFKRqpHrjw",
          content: "Indentation matters in Python.",
          questions: [{ question: "Loop for sequence?", options: ["for", "while", "do-while", "repeat"], answer: 0 }],
          memoryPairs: [{ term: "if", def: "Condition" }, { term: "else", def: "Alternative" }, { term: "elif", def: "Else If" }, { term: "break", def: "Exit Loop" }],
          rapidQuestions: [{ question: "Colon : needed after if?", options: ["Yes", "No", "Maybe", "Never"], answer: 0 }]
        },
        {
          id: "py-lists",
          title: "Lists & Dicts",
          desc: "Advanced data types.",
          mastery: 20,
          status: "in-progress",
          video: "https://www.youtube.com/embed/ohCDWZgNIU0",
          content: "Lists are mutable sequences. Dictionaries are key-value pairs.",
          questions: [{ question: "List brackets?", options: ["[]", "{}", "()", "<>"], answer: 0 }],
          memoryPairs: [{ term: "List", def: "Ordered Mutable" }, { term: "Tuple", def: "Ordered Immutable" }, { term: "Dict", def: "Key-Value" }, { term: "Set", def: "Unique" }],
          rapidQuestions: [{ question: "Dict uses?", options: ["Process", "Keys", "Index", "Pointers"], answer: 1 }]
        },
        {
          id: "py-funcs",
          title: "Functions & Modules",
          desc: "Reusing code.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/NSbOtYzIQI0",
          content: "def function_name(): ...",
          questions: [{ question: "Keyword for function?", options: ["def", "func", "fn", "define"], answer: 0 }],
          memoryPairs: [{ term: "def", def: "Define Func" }, { term: "return", def: "Send Back" }, { term: "arg", def: "Input" }, { term: "lambda", def: "Anonymous" }],
          rapidQuestions: [{ question: "Return value default?", options: ["None", "0", "False", "Void"], answer: 0 }]
        },
        {
          id: "py-oop",
          title: "OOP in Python",
          desc: "Classes and Objects.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/JeznW_7DlB0",
          content: "Everything in Python is an object.",
          questions: [{ question: "Keyword for class?", options: ["class", "struct", "object", "type"], answer: 0 }],
          memoryPairs: [{ term: "Self", def: "Instance Ref" }, { term: "Init", def: "Constructor" }, { term: "Class", def: "Blueprint" }, { term: "Object", def: "Instance" }],
          rapidQuestions: [{ question: "Constructor name?", options: ["__init__", "start", "create", "setup"], answer: 0 }]
        },
        {
          id: "py-libs",
          title: "Libraries (NumPy, Pandas)",
          desc: "Intro to Data Science tools.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/rvu6iT2d_iI",
          content: "Importing power.",
          questions: [{ question: "Library for arrays?", options: ["NumPy", "Pandas", "Matplotlib", "Request"], answer: 0 }],
          memoryPairs: [{ term: "NumPy", def: "Math/Arrays" }, { term: "Pandas", def: "DataFrames" }, { term: "Matplotlib", def: "Plotting" }, { term: "Pip", def: "Installer" }],
          rapidQuestions: [{ question: "Command to install?", options: ["pip install", "npm i", "apt", "get"], answer: 0 }]
        }
      ],
      games: []
    },
    {
      id: "html-css",
      name: "HTML & CSS",
      icon: "bi-filetype-html",
      progress: 0,
      totalChapters: 5,
      nextMilestone: "Web Weaver",

      learningPoints: [
        "Build responsive websites",
        "Master Flexbox and Grid layouts",
        "Semantic HTML5",
        "CSS Animations and Transitions"
      ],
      quizQuestions: [
        {
          question: "What does HTML stand for?",
          options: ["Hyper Text Markup Language", "High Tool Mark Language", "Hyperlink Text Mark", "None"],
          answer: 0
        },
        {
          question: "Which tag is used for the largest heading?",
          options: ["<h6>", "<head>", "<h1>", "<header>"],
          answer: 2
        },
        {
          question: "Which tag is used to display an image?",
          options: ["<img>", "<pic>", "<src>", "<image>"],
          answer: 0
        },
        {
          question: "What is the correct HTML element for line break?",
          options: ["<break>", "<lb>", "<br>", "<ln>"],
          answer: 2
        },
        {
          question: "Which attribute opens a link in a new tab?",
          options: ["target='_new'", "target='_blank'", "new='tab'", "window='new'"],
          answer: 1
        }
      ],
      chapters: [
        {
          id: "html-struct",
          title: "HTML5 Structure",
          desc: "Semantic tags and DOM.",
          mastery: 0,
          status: "open",
          video: "https://www.youtube.com/embed/pQN-pnXPaVg",
          content: "Learn the skeleton of the web: header, nav, main, footer.",
          questions: [{ question: "Main structure tag?", options: ["<html>", "<body>", "<head>", "All"], answer: 3 }],
          memoryPairs: [{ term: "<div>", def: "Container" }, { term: "<p>", def: "Paragraph" }, { term: "<a>", def: "Link" }, { term: "<ul>", def: "List" }],
          rapidQuestions: [{ question: "Closing tag usually has?", options: ["/", "\\", "*", "!"], answer: 0 }]
        },
        {
          id: "css-basics",
          title: "CSS Basics",
          desc: "Selectors, Colors, Fonts.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/1Rs2ND1ryYc",
          content: "Styling the web.",
          questions: [{ question: "CSS stands for?", options: ["Cascading Style Sheets", "Computer Style", "Creative Sheets", "None"], answer: 0 }],
          memoryPairs: [{ term: "Color", def: "Text Color" }, { term: "Bg", def: "Background" }, { term: "Font", def: "Typeface" }, { term: "Margin", def: "Outer Space" }],
          rapidQuestions: [{ question: "Selector for id?", options: ["#", ".", "*", "@"], answer: 0 }]
        },
        {
          id: "css-layout",
          title: "Flexbox & Grid",
          desc: "Modern layouts.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/phWxA89Dy9E",
          content: "Responsive design principles.",
          questions: [{ question: "1D layout system?", options: ["Flexbox", "Grid", "Float", "Table"], answer: 0 }],
          memoryPairs: [{ term: "Flex", def: "1D Layout" }, { term: "Grid", def: "2D Layout" }, { term: "Row", def: "Horizontal" }, { term: "Col", def: "Vertical" }],
          rapidQuestions: [{ question: "Justify-content aligns?", options: ["Main Axis", "Cross Axis", "Both", "None"], answer: 0 }]
        },
        {
          id: "html-forms",
          title: "Forms & Input",
          desc: "User interaction.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/fNcJuPIZ2WE",
          content: "Input types, labels, and validation.",
          questions: [{ question: "Input for text?", options: ["type='text'", "type='string'", "text='in'", "input='txt'"], answer: 0 }],
          memoryPairs: [{ term: "Form", def: "Data Wrapper" }, { term: "Input", def: "Field" }, { term: "Label", def: "Name Tag" }, { term: "Submit", def: "Send Button" }],
          rapidQuestions: [{ question: "Password input visible?", options: ["No", "Yes", "Maybe", "Sometimes"], answer: 0 }]
        },
        {
          id: "responsive",
          title: "Responsive Design",
          desc: "Media queries.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/vqWuMoA6Y6k",
          content: "Making sites work on mobile.",
          questions: [{ question: "Key CSS feature?", options: ["@media", "@screen", "@phone", "@mobile"], answer: 0 }],
          memoryPairs: [{ term: "@media", def: "Breakpoint" }, { term: "rem", def: "Root Unit" }, { term: "%", def: "Fluid Width" }, { term: "vh", def: "Viewport H" }],
          rapidQuestions: [{ question: "Mobile first means?", options: ["Phone styles first", "Desktop key", "Only mobile", "Tablet last"], answer: 0 }]
        }
      ],
      games: []
    },
    {
      id: "os-concepts",
      name: "Operating Systems",
      icon: "bi-cpu",
      progress: 0,
      totalChapters: 8,
      nextMilestone: "Kernel Commander",
      instructor: "Dr. V. Reddy",
      duration: "10 Weeks",
      level: "Advanced",
      prerequisites: ["C Programming", "Computer Architecture"],
      learningPoints: [
        "Process Management & Scheduling",
        "Deadlocks and Concurrency",
        "Memory Management (Paging/Segmentation)",
        "File Systems and I/O"
      ],
      quizQuestions: [
        {
          question: "Which is not an Operating System?",
          options: ["Linux", "Windows", "Oracle", "MacOS"],
          answer: 2
        },
        {
          question: "What is the core of an OS called?",
          options: ["Shell", "Cpu", "Kernel", "Core"],
          answer: 2
        },
        {
          question: "Which scheduling algorithm causes starvation?",
          options: ["Round Robin", "FCFS", "SJF", "Priority"],
          answer: 3
        },
        {
          question: "What is a 'Deadlock'?",
          options: ["System shutdown", "Process waiting infinitely", "Memory leak", "Disk failure"],
          answer: 1
        },
        {
          question: "What technique increases effective memory size?",
          options: ["Virtual Memory", "Caching", "Buffering", "Spooling"],
          answer: 0
        }
      ],
      chapters: [
        {
          id: "os-intro",
          title: "OS Introduction",
          desc: "Kernel, Shell, and System Calls.",
          mastery: 0,
          status: "open",
          video: "https://www.youtube.com/embed/vBURTt97ekA",
          content: "What happens when you turn on your computer?",
          questions: [{ question: "First program to run?", options: ["Bootloader", "OS", "Chrome", "Word"], answer: 0 }],
          memoryPairs: [{ term: "Kernel", def: "Core" }, { term: "Shell", def: "Interface" }, { term: "GUI", def: "Graphics" }, { term: "CLI", def: "Command Line" }],
          rapidQuestions: [{ question: "Windows is open source?", options: ["No", "Yes", "Maybe", "Parts"], answer: 0 }]
        },
        {
          id: "processes",
          title: "Processes & Threads",
          desc: "Execution units.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/OrM7nZCxWZk",
          content: "PCB, Context Switching.",
          questions: [{ question: "Lightweight process?", options: ["Thread", "Task", "Job", "Fork"], answer: 0 }],
          memoryPairs: [{ term: "Process", def: "Program Run" }, { term: "Thread", def: "Lightweight" }, { term: "PCB", def: "Control Block" }, { term: "Fork", def: "Clone" }],
          rapidQuestions: [{ question: "Context switch is fast?", options: ["No (Overhead)", "Yes", "Instant", "Zero time"], answer: 0 }]
        },
        {
          id: "cpu-sched",
          title: "CPU Scheduling",
          desc: "FCFS, SJF, Round Robin.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/ew516E2NC0Q",
          content: "Maximizing CPU utilization.",
          questions: [{ question: "FCFS is?", options: ["First Come First Serve", "Fast Core Fast Serve", "First Cpu First Set", "None"], answer: 0 }],
          memoryPairs: [{ term: "FCFS", def: "Queue Order" }, { term: "SJF", def: "Shortest First" }, { term: "RR", def: "Time Slice" }, { term: "Preempt", def: "Interrupt" }],
          rapidQuestions: [{ question: "Starvation possible in?", options: ["Priority", "FCFS", "RR", "None"], answer: 0 }]
        },
        {
          id: "deadlocks",
          title: "Deadlocks",
          desc: "Prevention and Avoidance.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/rfd6521x20M",
          content: "Dining Philosophers problem.",
          questions: [{ question: "Deadlock condition?", options: ["Mutual Exclusion", "No Block", "Preemption", "Free"], answer: 0 }],
          memoryPairs: [{ term: "Deadlock", def: "Stuck" }, { term: "Mutex", def: "Lock" }, { term: "Bankers", def: "Avoidance" }, { term: "Cycle", def: "Dependency" }],
          rapidQuestions: [{ question: "Safe state means?", options: ["No Deadlock", "Crash", "Slow", "Fast"], answer: 0 }]
        },
        {
          id: "memory-mgmt",
          title: "Memory Management",
          desc: "Paging and Segmentation.",
          mastery: 0,
          status: "locked",
          video: "https://www.youtube.com/embed/5pG99hH5kKE",
          content: "Virtual memory.",
          questions: [{ question: "Virtual memory uses?", options: ["Disk", "RAM only", "Cache", "Register"], answer: 0 }],
          memoryPairs: [{ term: "Page", def: "Fixed Block" }, { term: "Segment", def: "Variable Block" }, { term: "Frame", def: "RAM Block" }, { term: "Swap", def: "Disk Move" }],
          rapidQuestions: [{ question: "Fragmentation is?", options: ["Wasted Space", "Optimized", "Compressed", "None"], answer: 0 }]
        }
      ],
      games: []
    }
  ],
};
