/**
 * Community Permission Tests
 * 
 * Tests all community CRUD + interaction APIs for proper auth and ownership checks.
 * Run: node scripts/test-community-permissions.js
 */

const BASE = "http://localhost:3000";

async function getCsrfToken() {
  const res = await fetch(`${BASE}/api/auth/csrf`);
  const data = await res.json();
  return { token: data.csrfToken, cookie: res.headers.get("set-cookie") };
}

async function login(email, password) {
  const { token, cookie } = await getCsrfToken();
  
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie
    },
    body: new URLSearchParams({
      csrfToken: token,
      email,
      password,
      json: "true"
    }),
    redirect: "manual"
  });

  // Collect all cookies from the redirect chain
  const cookies = [];
  if (cookie) cookies.push(cookie.split(";")[0]);
  
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  setCookie.forEach(c => cookies.push(c.split(";")[0]));

  // Follow redirect to get session cookie
  const location = res.headers.get("location");
  if (location) {
    const redirectUrl = location.startsWith("http") ? location : `${BASE}${location}`;
    const res2 = await fetch(redirectUrl, {
      headers: { "Cookie": cookies.join("; ") },
      redirect: "manual"
    });
    const setCookie2 = res2.headers.getSetCookie ? res2.headers.getSetCookie() : [];
    setCookie2.forEach(c => cookies.push(c.split(";")[0]));
  }

  return cookies.join("; ");
}

async function apiCall(method, path, cookies, body = null) {
  const opts = {
    method,
    headers: { 
      "Cookie": cookies,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, text, json };
}

function test(name, passed) {
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}`);
  if (!passed) process.exitCode = 1;
}

async function main() {
  console.log("🔐 Community Permission Tests\n");
  console.log("--- Logging in as two users ---");
  
  let arjunCookies, priyaCookies;
  try {
    arjunCookies = await login("arjun@doubtconnect.edu", "password123");
    console.log("Logged in as Arjun");
  } catch (e) {
    console.error("Failed to login as Arjun:", e.message);
    return;
  }
  
  try {
    priyaCookies = await login("priya@doubtconnect.edu", "password123");
    console.log("Logged in as Priya\n");
  } catch (e) {
    console.error("Failed to login as Priya:", e.message);
    return;
  }

  console.log("--- Unauthorized Access ---");
  const unauth = await apiCall("GET", "/api/community?tab=latest", "");
  test("GET /api/community without auth → 401", unauth.status === 401);

  const unauthPost = await apiCall("POST", "/api/community", "", { content: "test" });
  test("POST /api/community without auth → 401", unauthPost.status === 401);

  console.log("\n--- Create Post ---");
  const createRes = await apiCall("POST", "/api/community", arjunCookies, {
    type: "discussion",
    title: "Permission Test Post",
    content: "This is a test post for permission testing.",
    tags: ["test", "permissions"],
    subject: "Testing"
  });
  test("Arjun can create a post → 200 + id", createRes.status === 200 && !!createRes.json?.id);
  test("Response has formatted shape (likeCount exists)", createRes.json?.likeCount !== undefined);
  test("Response has author info", !!createRes.json?.author?.fullName);
  test("Response has tags as array", Array.isArray(createRes.json?.tags));
  
  const postId = createRes.json?.id;
  if (!postId) { console.error("No post ID, aborting"); return; }

  console.log("\n--- Edit Own Post ---");
  const editRes = await apiCall("PATCH", `/api/community/${postId}`, arjunCookies, {
    content: "This is the EDITED test post.",
    title: "Permission Test Post (Edited)",
  });
  test("Arjun can edit own post → 200", editRes.status === 200);
  test("Edit response has formatted shape", editRes.json?.likeCount !== undefined);
  test("Content was updated", editRes.json?.content?.includes("EDITED"));

  console.log("\n--- Edit Other's Post ---");
  const editForbid = await apiCall("PATCH", `/api/community/${postId}`, priyaCookies, {
    content: "Priya trying to edit Arjun's post",
  });
  test("Priya CANNOT edit Arjun's post → 403", editForbid.status === 403);

  console.log("\n--- Delete Other's Post ---");
  const deleteForbid = await apiCall("DELETE", `/api/community/${postId}`, priyaCookies);
  test("Priya CANNOT delete Arjun's post → 403", deleteForbid.status === 403);

  console.log("\n--- Like Post ---");
  const likeRes = await apiCall("POST", `/api/community/${postId}/like`, priyaCookies);
  test("Priya can like Arjun's post → 200", likeRes.status === 200 && likeRes.json?.liked === true);

  const unlikeRes = await apiCall("POST", `/api/community/${postId}/like`, priyaCookies);
  test("Priya can unlike (toggle) → 200", unlikeRes.status === 200 && unlikeRes.json?.liked === false);

  console.log("\n--- Save Post ---");
  const saveRes = await apiCall("POST", `/api/community/${postId}/save`, priyaCookies);
  test("Priya can save Arjun's post → 200", saveRes.status === 200 && saveRes.json?.saved === true);

  const unsaveRes = await apiCall("POST", `/api/community/${postId}/save`, priyaCookies);
  test("Priya can unsave (toggle) → 200", unsaveRes.status === 200 && unsaveRes.json?.saved === false);

  console.log("\n--- Comment ---");
  const commentRes = await apiCall("POST", `/api/community/${postId}/comment`, priyaCookies, {
    content: "Test comment from Priya"
  });
  test("Priya can comment → 200 + id", commentRes.status === 200 && !!commentRes.json?.id);
  const commentId = commentRes.json?.id;

  console.log("\n--- Delete Own Comment ---");
  if (commentId) {
    const delCommentRes = await apiCall("DELETE", `/api/community/${postId}/comment`, priyaCookies, {
      commentId
    });
    test("Priya can delete own comment → 200", delCommentRes.status === 200);
  }

  console.log("\n--- Report Post ---");
  const reportRes = await apiCall("POST", `/api/community/${postId}/report`, priyaCookies, {
    reason: "Test report"
  });
  test("Priya can report Arjun's post → 200", reportRes.status === 200 && reportRes.json?.reported === true);

  const reportDup = await apiCall("POST", `/api/community/${postId}/report`, priyaCookies, {
    reason: "Duplicate report"
  });
  test("Duplicate report returns alreadyReported", reportDup.json?.alreadyReported === true);

  console.log("\n--- Delete Own Post ---");
  const deleteRes = await apiCall("DELETE", `/api/community/${postId}`, arjunCookies);
  test("Arjun can delete own post → 200", deleteRes.status === 200 && deleteRes.json?.deleted === true);

  console.log("\n--- Non-existent Post ---");
  const notFound = await apiCall("PATCH", `/api/community/${postId}`, arjunCookies, {
    content: "Editing deleted post"
  });
  test("Edit deleted post → 404", notFound.status === 404);

  console.log("\n--- Feed Tabs ---");
  for (const tab of ["latest", "trending", "my-college", "my-branch", "my-subjects", "saved"]) {
    const tabRes = await apiCall("GET", `/api/community?tab=${tab}`, arjunCookies);
    test(`GET ?tab=${tab} → 200 + array`, tabRes.status === 200 && Array.isArray(tabRes.json));
  }

  console.log("\n🏁 Permission tests complete!");
}

main().catch(e => {
  console.error("Test runner error:", e);
  process.exitCode = 1;
});
