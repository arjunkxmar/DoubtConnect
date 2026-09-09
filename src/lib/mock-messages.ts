export const MOCK_CONVERSATIONS = [
  {
    id: "conv-1",
    user: {
      name: "Rahul Sharma",
      academicYear: "3rd Year",
      branch: "CSE",
      avatar: "R",
    },
    lastMessage: "Try using a while loop for that graph traversal.",
    time: "2m",
    unreadCount: 1,
  },
  {
    id: "conv-2",
    user: {
      name: "Ananya Patel",
      academicYear: "4th Year",
      branch: "IT",
      avatar: "A",
    },
    lastMessage: "Yes, the React context API should solve your prop drilling issue.",
    time: "1h",
    unreadCount: 0,
  },
  {
    id: "conv-3",
    user: {
      name: "Vikram Singh",
      academicYear: "2nd Year",
      branch: "ECE",
      avatar: "V",
    },
    lastMessage: "Thanks for the notes on digital logic!",
    time: "Yesterday",
    unreadCount: 0,
  }
];

export const MOCK_MESSAGES: Record<string, any[]> = {
  "conv-1": [
    {
      id: "msg-1",
      content: "Hi Rahul, I saw your answer on the graph algorithm doubt. I'm still a bit stuck on the cycle detection part.",
      sender: "me",
      timestamp: "10:30 AM",
      read: true,
    },
    {
      id: "msg-2",
      content: "Hey! No problem. Are you using DFS or BFS?",
      sender: "them",
      timestamp: "10:32 AM",
      read: true,
    },
    {
      id: "msg-3",
      content: "I'm trying to use BFS, but my visited array is getting messed up.",
      sender: "me",
      timestamp: "10:35 AM",
      read: true,
    },
    {
      id: "msg-4",
      content: "Try using a while loop for that graph traversal. Make sure you only push to the queue if the node hasn't been visited yet.",
      sender: "them",
      timestamp: "10:45 AM",
      read: false,
    }
  ],
  "conv-2": [
    {
      id: "msg-21",
      content: "Ananya, how did you manage state in your final year project?",
      sender: "me",
      timestamp: "Yesterday",
      read: true,
    },
    {
      id: "msg-22",
      content: "Yes, the React context API should solve your prop drilling issue. You don't need Redux for a medium sized app.",
      sender: "them",
      timestamp: "Yesterday",
      read: true,
    }
  ]
};
