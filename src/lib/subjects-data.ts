import { 
  Code, Shield, Brain, Network, Database, Cpu, Calculator, BookOpen 
} from "lucide-react";

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  domain: string;
  icon: any;
  description: string;
  topics: Topic[];
  activeDoubtsCount: number;
  mentorCount: number;
}

export const SUBJECTS_CATALOG: SubjectItem[] = [
  {
    id: "data-structures",
    name: "Data Structures & Algorithms",
    domain: "Computer Science",
    icon: Code,
    description: "Trees, Graphs, Dynamic Programming, Greedy Algorithms, and Complexity Analysis.",
    topics: [
      { id: "binary-trees", name: "Binary Trees", description: "Traversals, BSTs, and balancing algorithms like AVL and Red-Black." },
      { id: "graphs", name: "Graphs", description: "BFS, DFS, shortest path algorithms, and spanning trees." },
      { id: "dp", name: "Dynamic Programming", description: "Memoization, tabulation, and state transitions." },
      { id: "shortest-paths", name: "Shortest Paths", description: "Dijkstra, Bellman-Ford, and Floyd-Warshall." },
      { id: "sorting", name: "Sorting", description: "Merge sort, Quick sort, Heap sort, and their complexities." },
      { id: "heaps", name: "Heaps", description: "Priority queues, max/min heaps, and heap sort." }
    ],
    activeDoubtsCount: 14,
    mentorCount: 8,
  },
  {
    id: "operating-systems",
    name: "Operating Systems",
    domain: "Computer Science",
    icon: Shield,
    description: "Processes, Threads, CPU Scheduling, Virtual Memory, Deadlocks, and File Systems.",
    topics: [
      { id: "paging", name: "Paging", description: "Memory management, page replacement algorithms, and TLB." },
      { id: "deadlocks", name: "Deadlocks", description: "Conditions, prevention, avoidance, and Banker's algorithm." },
      { id: "semaphores", name: "Semaphores", description: "Synchronization primitives, mutexes, and the producer-consumer problem." },
      { id: "syscalls", name: "Syscalls", description: "Kernel mode, user mode, and context switching." },
      { id: "kernel-architecture", name: "Kernel Architecture", description: "Monolithic, microkernel, and hybrid models." }
    ],
    activeDoubtsCount: 9,
    mentorCount: 5,
  },
  {
    id: "machine-learning",
    name: "Machine Learning & AI",
    domain: "Artificial Intelligence",
    icon: Brain,
    description: "Supervised & Unsupervised Learning, Deep Learning, Gradient Descent, Backpropagation.",
    topics: [
      { id: "neural-networks", name: "Neural Networks", description: "Perceptrons, MLPs, activation functions, and architectures." },
      { id: "linear-regression", name: "Linear Regression", description: "Cost functions, gradient descent, and statistical foundations." },
      { id: "svm", name: "SVM", description: "Support Vector Machines, margins, kernels, and hyperplanes." },
      { id: "backpropagation", name: "Backpropagation", description: "Chain rule, vanishing gradients, and weight updates." },
      { id: "pytorch", name: "PyTorch", description: "Tensors, autograd, data loaders, and model building." }
    ],
    activeDoubtsCount: 11,
    mentorCount: 6,
  },
  {
    id: "computer-networks",
    name: "Computer Networks",
    domain: "Computer Science",
    icon: Network,
    description: "OSI & TCP/IP stack, Socket Programming, Routing Algorithms, and Congestion Control.",
    topics: [
      { id: "tcp-udp", name: "TCP/UDP", description: "Connection-oriented vs connectionless protocols, handshakes, and headers." },
      { id: "routing-protocols", name: "Routing Protocols", description: "OSPF, BGP, RIP, distance vector, and link state algorithms." },
      { id: "dns", name: "DNS", description: "Domain name resolution, authoritative servers, and caching." },
      { id: "subnetting", name: "Subnetting", description: "IP addressing, CIDR notation, masks, and network design." },
      { id: "http-https", name: "HTTP/HTTPS", description: "Request/response cycles, status codes, methods, and SSL/TLS." }
    ],
    activeDoubtsCount: 7,
    mentorCount: 4,
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    domain: "Computer Science",
    icon: Database,
    description: "Relational Models, SQL, Normalization (1NF to BCNF), Transactions, and Indexing.",
    topics: [
      { id: "sql-queries", name: "SQL Queries", description: "Joins, aggregations, subqueries, and window functions." },
      { id: "normalization", name: "Normalization", description: "1NF, 2NF, 3NF, BCNF, and dependency preservation." },
      { id: "acid", name: "ACID", description: "Atomicity, Consistency, Isolation, and Durability guarantees." },
      { id: "b-trees", name: "B+ Trees", description: "Balanced trees, internal nodes, and leaf connections." },
      { id: "indexing", name: "Indexing", description: "Clustered vs non-clustered, hash indexes, and query performance." }
    ],
    activeDoubtsCount: 8,
    mentorCount: 5,
  },
  {
    id: "electronics",
    name: "Electronics & Digital Logic",
    domain: "Electronics & Comm",
    icon: Cpu,
    description: "Boolean Algebra, Combinational & Sequential Circuits, Verilog, Microprocessors.",
    topics: [
      { id: "k-maps", name: "K-Maps", description: "Karnaugh maps, prime implicants, and logic minimization." },
      { id: "flip-flops", name: "Flip-Flops", description: "SR, D, JK, T flip-flops, and characteristic equations." },
      { id: "fsm", name: "FSM", description: "Moore and Mealy state machines, state diagrams, and encoding." },
      { id: "verilog-hdl", name: "Verilog HDL", description: "Behavioral, dataflow, and structural modeling." },
      { id: "microprocessors", name: "ARM / 8086", description: "Instruction sets, pipelining, addressing modes, and interrupts." }
    ],
    activeDoubtsCount: 6,
    mentorCount: 3,
  },
  {
    id: "mathematics",
    name: "Engineering Mathematics",
    domain: "Basic Sciences",
    icon: Calculator,
    description: "Calculus, Linear Algebra, Differential Equations, Probability & Statistics.",
    topics: [
      { id: "eigenvalues", name: "Eigenvalues", description: "Characteristic equations, eigenvectors, and diagonalization." },
      { id: "contour-integrals", name: "Contour Integrals", description: "Cauchy integral formula, residues, and poles." },
      { id: "laplace-transforms", name: "Laplace Transforms", description: "Bilateral transforms, ROC, and initial value theorems." },
      { id: "probability", name: "Probability", description: "Distributions, Bayes' theorem, expectations, and random variables." }
    ],
    activeDoubtsCount: 12,
    mentorCount: 7,
  },
  {
    id: "web-dev",
    name: "Web & Full-Stack Development",
    domain: "Software Engineering",
    icon: BookOpen,
    description: "Modern web architecture, React, Next.js, REST APIs, GraphQL, and State Management.",
    topics: [
      { id: "next-js", name: "Next.js", description: "App router, server components, and static site generation." },
      { id: "react-hooks", name: "React Hooks", description: "useState, useEffect, context, and custom hooks." },
      { id: "typescript", name: "TypeScript", description: "Interfaces, generics, unions, and type safety." },
      { id: "rest-apis", name: "REST APIs", description: "Design principles, verbs, statelessness, and authentication." },
      { id: "tailwind-css", name: "Tailwind CSS", description: "Utility-first styling, configuration, and responsive design." }
    ],
    activeDoubtsCount: 10,
    mentorCount: 6,
  },
];
