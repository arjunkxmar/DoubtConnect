const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for DoubtConnect...');

  // Clean existing data
  await prisma.postReport.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.postSave.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.doubt.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const arjun = await prisma.user.create({
    data: {
      fullName: 'Arjun Kumar',
      email: 'arjun@doubtconnect.edu',
      password: hashedPassword,
      college: 'National Institute of Technology',
      branch: 'Computer Science & Engineering',
      academicYear: '3rd Year',
      subjects: 'Data Structures, Algorithms, Operating Systems, Web Development',
      skills: 'React, Next.js, TypeScript, C++, Python, SQL',
      points: 420,
    },
  });

  const priya = await prisma.user.create({
    data: {
      fullName: 'Priya Sharma',
      email: 'priya@doubtconnect.edu',
      password: hashedPassword,
      college: 'National Institute of Technology',
      branch: 'Computer Science (AI & ML)',
      academicYear: '4th Year',
      subjects: 'Machine Learning, Deep Learning, Linear Algebra, Probability',
      skills: 'PyTorch, TensorFlow, Python, Computer Vision, NLP',
      points: 540,
    },
  });

  const rohan = await prisma.user.create({
    data: {
      fullName: 'Rohan Verma',
      email: 'rohan@doubtconnect.edu',
      password: hashedPassword,
      college: 'Delhi Technological University',
      branch: 'Electronics & Communication',
      academicYear: '2nd Year',
      subjects: 'Digital Electronics, Signal Processing, Microprocessors, Analog Circuits',
      skills: 'Verilog, Embedded C, Arduino, MATLAB, VLSI',
      points: 190,
    },
  });

  const ananya = await prisma.user.create({
    data: {
      fullName: 'Ananya Patel',
      email: 'ananya@doubtconnect.edu',
      password: hashedPassword,
      college: 'National Institute of Technology',
      branch: 'Information Technology',
      academicYear: '1st Year',
      subjects: 'Engineering Mathematics, Physics, C Programming, Basics of Web',
      skills: 'C, HTML, CSS, Problem Solving',
      points: 80,
    },
  });

  console.log('✅ Created 4 sample students');

  // 2. Create Doubts
  const doubt1 = await prisma.doubt.create({
    data: {
      title: "Why does Dijkstra's algorithm fail with negative edge weights, but Bellman-Ford succeeds?",
      description: "I'm studying single-source shortest paths. I understand Dijkstra uses a greedy approach with a priority queue, but why exactly does a single negative edge break it? Can't we just add a constant to make all edges positive?",
      subject: 'Data Structures & Algorithms',
      topic: 'Shortest Path Algorithms',
      targetYear: '2nd Year',
      tags: 'graphs, algorithms, dijkstra, bellman-ford',
      isResolved: true,
      authorId: ananya.id,
    },
  });

  const doubt2 = await prisma.doubt.create({
    data: {
      title: 'Understanding Backpropagation: Why does the gradient transpose matrix dimensions in the chain rule?',
      description: "When deriving the gradient of the loss with respect to weights W in a dense linear layer Y = XW + b, why does the gradient formula require transposing X (i.e. dL/dW = X^T * dL/dY)? I know the matrix dimensions have to match, but what is the mathematical intuition?",
      subject: 'Machine Learning',
      topic: 'Neural Networks & Backpropagation',
      targetYear: '3rd Year',
      tags: 'machine-learning, deep-learning, calculus, backprop',
      isResolved: false,
      authorId: arjun.id,
    },
  });

  const doubt3 = await prisma.doubt.create({
    data: {
      title: 'Difference between Process and Thread in Linux kernel: How clone() handles memory space',
      description: "In operating systems textbooks, processes have separate address spaces while threads share them. In Linux specifically, does the kernel treat threads as lightweight processes? What exact flags in clone() create this distinction?",
      subject: 'Operating Systems',
      topic: 'Processes, Threads and Concurrency',
      targetYear: '2nd Year',
      tags: 'os, linux, threads, fork, clone',
      isResolved: true,
      authorId: rohan.id,
    },
  });

  const doubt4 = await prisma.doubt.create({
    data: {
      title: "How to evaluate complex contour integrals using Cauchy's Residue Theorem?",
      description: "Can someone walk through the steps to evaluate the real integral of 1 / (1 + x^4) from -infinity to +infinity using semicircular contour integration in the upper half plane? How do we find the residues at the poles?",
      subject: 'Engineering Mathematics',
      topic: 'Complex Analysis',
      targetYear: '2nd Year',
      tags: 'mathematics, complex-analysis, calculus, residue-theorem',
      isResolved: false,
      authorId: ananya.id,
    },
  });

  const doubt5 = await prisma.doubt.create({
    data: {
      title: 'State Machine vs Synchronous Logic design in Verilog for UART receiver',
      description: "I am designing an oversampling 16x UART receiver on an FPGA board. Should I implement the start bit detection, bit center sampling, and stop bit verification within a single FSM or separate counters? Any advice on handling clock drift?",
      subject: 'Electronics & Communication',
      topic: 'Digital System Design & Verilog',
      targetYear: '3rd Year',
      tags: 'verilog, uart, fpga, digital-circuits',
      isResolved: false,
      authorId: rohan.id,
    },
  });

  const doubt6 = await prisma.doubt.create({
    data: {
      title: 'How does while loop work in C?',
      description: 'Can someone explain the step-by-step execution flow of a while loop in C? When does the condition evaluation take place relative to the body statements?',
      subject: 'Programming in C',
      topic: 'Loops & Control Flow',
      targetYear: '1st Year',
      tags: 'c, loops, while-loop, syntax, control-flow',
      isResolved: true,
      authorId: ananya.id,
    },
  });

  const doubt7 = await prisma.doubt.create({
    data: {
      title: 'Difference between while and do-while loops in C',
      description: 'What is the primary difference in execution guarantees between while and do-while? When would you strictly need do-while over a standard while loop in real programs?',
      subject: 'Programming in C',
      topic: 'Loops & Control Flow',
      targetYear: '1st Year',
      tags: 'c, loops, while-loop, do-while, control-flow',
      isResolved: true,
      authorId: ananya.id,
    },
  });

  const doubt8 = await prisma.doubt.create({
    data: {
      title: 'When should I use a while loop instead of a for loop?',
      description: 'Is there any assembly/performance difference between a while loop and a for loop in modern GCC/Clang compilers, or is it purely a readability/idiom convention for known vs unknown iterations?',
      subject: 'Programming in C',
      topic: 'Loops & Control Flow',
      targetYear: '1st Year',
      tags: 'c, loops, while-loop, for-loop, compilers',
      isResolved: false,
      authorId: rohan.id,
    },
  });

  console.log('✅ Created 8 academic doubts');

  // 3. Create Answers
  const ans1 = await prisma.answer.create({
    data: {
      content: `Dijkstra's algorithm relies on the greedy property: once a vertex is visited and extracted from the priority queue, its distance from the source is assumed to be the **absolute shortest possible**.

If you have negative edge weights, a longer path with a negative edge could later yield a smaller overall distance to an already-visited vertex. Since Dijkstra never re-evaluates visited nodes, it produces incorrect results.

Regarding **adding a constant (reweighting)**:
If you add a constant $C$ to every edge, paths with more edges are penalized more! 
For example:
- Path 1: 1 edge with weight 5 $\\rightarrow$ becomes $5 + C$
- Path 2: 3 edges with weights 1, 1, 1 $\\rightarrow$ becomes $3 + 3C$

Adding $C$ changes which path is shortest! Bellman-Ford solves this by relaxing all $V-1$ edges iteratively, which accommodates negative edges and detects negative weight cycles.`,
      isBest: true,
      doubtId: doubt1.id,
      authorId: priya.id,
    },
  });

  const ans2 = await prisma.answer.create({
    data: {
      content: `Adding to Priya's answer: If you actually need Dijkstra with negative weights in sparse graphs, check out **Johnson's Algorithm**! It uses Bellman-Ford once to compute potential values $h(u)$, reweights edges such that $w'(u, v) = w(u, v) + h(u) - h(v) \\ge 0$, and then runs Dijkstra from every vertex. That avoids the pitfall!`,
      isBest: false,
      doubtId: doubt1.id,
      authorId: arjun.id,
    },
  });

  const ans3 = await prisma.answer.create({
    data: {
      content: `In the Linux kernel, both processes and POSIX threads are represented by the exact same structure: \`struct task_struct\`.

When you call \`fork()\`, the kernel calls \`clone()\` with no sharing flags:
- New address space (\`mm_struct\`)
- New file descriptor table (\`files_struct\`)
- New signal handlers

When \`pthread_create()\` runs, it invokes \`clone()\` with:
- \`CLONE_VM\`: Share memory space (\`current->mm\`)
- \`CLONE_FS\`: Share filesystem info
- \`CLONE_FILES\`: Share open file descriptor table
- \`CLONE_SIGHAND\`: Share signal handlers
- \`CLONE_THREAD\`: Placed in the same thread group (shares the same TGID)

So to the Linux scheduler (\`CFS\`), threads are just schedulable entities that happen to share pointer references to the same memory descriptor!`,
      isBest: true,
      doubtId: doubt3.id,
      authorId: arjun.id,
    },
  });

  const ans4 = await prisma.answer.create({
    data: {
      content: `A **while loop** in C is an entry-controlled loop:
\`\`\`c
while (condition) {
    // loop body statements
}
\`\`\`
1. **Evaluation**: The boolean expression inside \`()\` is evaluated first.
2. If non-zero (true), execution enters the body.
3. At the end of the body, execution jumps back to step 1.
4. If the condition is zero (false) initially, the body is never executed at all!`,
      isBest: true,
      doubtId: doubt6.id,
      authorId: arjun.id,
    },
  });

  const ans5 = await prisma.answer.create({
    data: {
      content: `The key difference is **when the condition is tested**:
- **while**: Entry-controlled. Condition is evaluated *before* loop body executes (can run 0 or more times).
- **do-while**: Exit-controlled. Condition is evaluated *after* loop body executes (guaranteed to run **at least once**).

Classic use case for \`do-while\`: User input validation or menus where you must prompt the user at least once before checking validity!`,
      isBest: true,
      doubtId: doubt7.id,
      authorId: priya.id,
    },
  });

  const ans6 = await prisma.answer.create({
    data: {
      content: `In modern C compilers (GCC -O2 / Clang), \`for\` and \`while\` produce identical machine assembly. 

The rule of thumb is semantic readability:
- Use **\`for\`** when the number of iterations or index increment is known upfront.
- Use **\`while\`** when looping depends on an external condition or state change (e.g. \`while (ptr != NULL)\`, \`while (scanf(...) == 1)\`).`,
      isBest: true,
      doubtId: doubt8.id,
      authorId: arjun.id,
    },
  });

  console.log('✅ Created answers');

  // 4. Create Votes
  await prisma.vote.createMany({
    data: [
      { value: 1, userId: arjun.id, doubtId: doubt1.id },
      { value: 1, userId: priya.id, doubtId: doubt1.id },
      { value: 1, userId: rohan.id, doubtId: doubt1.id },
      { value: 1, userId: ananya.id, doubtId: doubt2.id },
      { value: 1, userId: rohan.id, doubtId: doubt2.id },
      { value: 1, userId: ananya.id, answerId: ans1.id },
      { value: 1, userId: rohan.id, answerId: ans1.id },
      { value: 1, userId: ananya.id, answerId: ans3.id },
    ],
  });

  // 5. Create Community Posts
  const post1 = await prisma.post.create({
    data: {
      type: 'notes',
      title: 'Operating Systems End-Sem Quick Revision Sheet (CPU Scheduling, Deadlock Prevention & Paging)',
      content: `Hey everyone! I compiled a concise 12-page summary covering all critical OS concepts for the upcoming end-semester exams. 

Key topics included:
1. Banker's Algorithm with worked numerical examples
2. Page Replacement Algorithms (FIFO, LRU, Optimal)
3. Semaphore vs Mutex implementation
4. Disk Scheduling (SCAN, C-SCAN, LOOK)

Drop a comment if you want the PDF link or practice questions!`,
      tags: 'os, notes, exams, revision, computer-science',
      subject: 'Operating Systems',
      college: 'National Institute of Technology',
      branch: 'Computer Science & Engineering',
      authorId: arjun.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      type: 'opportunity',
      title: 'Smart India Hackathon (SIH 2026) — Looking for 2 teammates (Full-Stack & Computer Vision)',
      content: `Our team is working on problem statement SIH-1429 (Smart Automated Defect Detection in Manufacturing using Edge AI).

We currently have 4 members:
- 1 ML Lead (me)
- 1 Hardware/Embedded engineer (Rohan)
- 2 Domain researchers

We need 1 strong React/Next.js developer for the interactive dashboard and 1 teammate skilled in YOLOv8 / OpenCV. First and second years welcome! Comment below or DM me.`,
      tags: 'hackathon, sih2026, teamup, ai, webdev',
      subject: 'Computer Science',
      college: 'National Institute of Technology',
      branch: 'Computer Science (AI & ML)',
      authorId: priya.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      type: 'learning_tip',
      title: 'How I approached DSA: Focus on 14 LeetCode Patterns rather than 500 random problems',
      content: `When I started preparing for tech placements, I solved 150 random questions and still panicked on unseen problems.

What actually helped me crack my internship:
1. Two Pointers & Sliding Window (Substrings, target sums)
2. Fast & Slow Pointers (Cycle detection, Linked Lists)
3. Merge Intervals & Monotonic Stack (Next Greater Element)
4. Modified Binary Search (Rotated sorted arrays)
5. Top K Elements (Heaps / Priority Queues)

Master the pattern template first, then solve 4-5 problems per pattern. Quality > Quantity every time!`,
      tags: 'dsa, placements, interview-prep, algorithms, advice',
      subject: 'Data Structures & Algorithms',
      college: 'National Institute of Technology',
      branch: 'Computer Science (AI & ML)',
      authorId: priya.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      type: 'discussion',
      title: 'Which language should we choose for our 3rd Year Distributed Systems Project: Rust or Go?',
      content: `We are planning our 6th semester capstone on a distributed key-value store with Raft consensus. 

Team is split between:
- **Go**: Goroutines & channels make network concurrency straightforward, standard Raft implementations like etcd are in Go.
- **Rust**: Memory safety without GC pauses, amazing type system with Tokio async runtime.

For those who have built systems projects in college, what was your experience with debugging and deadline stress?`,
      tags: 'rust, golang, systems, project, discussion',
      subject: 'Computer Science',
      college: 'National Institute of Technology',
      branch: 'Computer Science & Engineering',
      authorId: arjun.id,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      type: 'resource',
      title: 'Handy Fourier & Laplace Transform Formula Sheet for Signals & Systems',
      content: `Sharing my formula cheat sheet for Signals and Systems. Includes duality property, time scaling, convolution theorem, and region of convergence (ROC) rules for bilateral Laplace transforms. Hope this helps 2nd year ECE students!`,
      tags: 'signals, math, formulas, ece, resources',
      subject: 'Electronics & Communication',
      college: 'Delhi Technological University',
      branch: 'Electronics & Communication',
      authorId: rohan.id,
    },
  });

  console.log('✅ Created 5 community posts');

  // 6. Create Post Likes and Comments
  await prisma.postLike.createMany({
    data: [
      { userId: arjun.id, postId: post2.id },
      { userId: rohan.id, postId: post1.id },
      { userId: ananya.id, postId: post1.id },
      { userId: ananya.id, postId: post3.id },
      { userId: rohan.id, postId: post3.id },
      { userId: priya.id, postId: post4.id },
    ],
  });

  await prisma.postComment.createMany({
    data: [
      {
        content: 'This cheat sheet is a lifesaver for our mid-terms! Thank you Arjun!',
        userId: ananya.id,
        postId: post1.id,
      },
      {
        content: 'I would love to join the SIH team for the frontend role! DMing you my portfolio.',
        userId: ananya.id,
        postId: post2.id,
      },
      {
        content: 'Go is definitely faster to ship within a semester timeline. Highly recommend Go for Raft!',
        userId: priya.id,
        postId: post4.id,
      },
    ],
  });

  // 7. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: arjun.id,
        type: 'BEST_ANSWER',
        message: 'Your answer on "Difference between Process and Thread" was marked as the Best Answer! (+20 pts)',
        linkUrl: `/doubts/${doubt3.id}`,
        isRead: false,
      },
      {
        userId: arjun.id,
        type: 'MATCH',
        message: 'New doubt in Data Structures matching your skills: "Why does Dijkstra\'s algorithm fail..."',
        linkUrl: `/doubts/${doubt1.id}`,
        isRead: true,
      },
      {
        userId: priya.id,
        type: 'MATCH',
        message: 'New doubt in Machine Learning matching your skills: "Understanding Backpropagation calculus..."',
        linkUrl: `/doubts/${doubt2.id}`,
        isRead: false,
      },
      {
        userId: ananya.id,
        type: 'NEW_ANSWER',
        message: 'Priya Sharma answered your doubt on Dijkstra\'s algorithm.',
        linkUrl: `/doubts/${doubt1.id}`,
        isRead: false,
      },
      {
        userId: rohan.id,
        type: 'MATCH',
        message: 'New post in ECE Community: "Handy Fourier & Laplace Transform Formula Sheet"',
        linkUrl: '/community',
        isRead: true,
      },
    ],
  });

  console.log('✅ Created notifications');
  console.log('🎉 Seeding complete! Database is fully initialized.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
