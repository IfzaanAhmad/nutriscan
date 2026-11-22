

**Team Macro Managers · NutriScan · ISTE 340 Fall 2026**

We used Claude durign this project as guidance. This file records what we asked, what we kept, what we rejected, and why.


---

## 1. How we used AI, and our rules

- **AI wrote first drafts, and we decided what stayed.** It drafted proposal text, component code, the API layer and test plans. We ran everything ourselves before keeping it.
- **We never trusted a claim about the API without checking it.** Two of our biggest problems came from AI code that looked right but didn't match how Open Food Facts actually behaves 
- **We checked AI reviews against the real files.** When an AI reviewed our work, about a third of its claims were wrong 
- **We kept product decisions for ourselves.** When the AI's fix changed how the app feels to use, we said no 

---

## 2. Prompt log

 "What users can do" of the proposal from our feature list * | A feature description: search with loading, error and empty states, product detail, pin and compare, a saved list, an allergen-preferences form, a theme toggle | **Accepted with edits** over several drafts. Later we **dropped** the theme toggle and the allergen form (see 3.5), so the final app differs from the proposal. |




 Turn our hand-drawn logo into an SVG * A traced vector logo **Accepted**, but it was 232 KB because tracing creates thousands of tiny steps. 

Search for steps to connect the app to the real Open Food Facts API with loading, error and empty states | `services/api.js` using the main API's `cgi/search.pl`, searching as you type | **Rejected after testing.** We were blocked within minutes. See 3.1. |

Search is failing with a CORS error  Diagnosis: rate limit. Fix: search only on Enter, plus a request counter | **Partly rejected.** We kept the counter but **refused search-on-Enter**. 

We're still blocked 25 minutes later | The page said "not available to anonymous users". The AI checked the docs and moved search to Search-a-licious through a Vite proxy, with debounced live search | **Accepted** after we read the [Search-a-licious docs](https://openfoodfacts.github.io/search-a-licious/users/ref-openapi) ourselves and tested it. |


Checked an earlier AI-written review against our code and found which claims were wrong | **Used to decide what to fix.** 

Tell us which tests to run, step by step, with the expected result of each  | 37 manual test steps covering every rubric row | **Used for testing.** One step looked like a failure (requests sent while typing a long search). The AI explained those were valid searches sent before the text passed 60 characters, and gave a cleaner test. We re-ran it and it passed. |


---

## 3. Where the AI was wrong, and what we did

### 3.1 It used a search endpoint that blocks search-as-you-type *(Phase 3, rejected)*

The first live version searched with `world.openfoodfacts.org/cgi/search.pl` on every keystroke. Within a few minutes of testing, every search failed and Chrome reported a **CORS error**.

The AI had not checked the API's rules. Open Food Facts' own docs allow only **10 searches per minute** on that endpoint and say: *"don't use it for a search-as-you-type feature, you would be blocked very quickly."* The "CORS error" was misleading: the blocked reply simply had no CORS header, so the browser couldn't show the real status.

**What we kept:** the lesson. Read the API's limits before writing code against it. Our README now links the docs and explains the endpoint choice.

### 3.2 Its fix changed the product, so we said no *(Phase 3, rejected)*

The AI's fix for 3.1 was to **search only when Enter is pressed**. That would have stopped the blocking, but live search was a core part of our proposal and the way we wanted the app to feel. We told it to keep search-as-you-type and find another way.

The final design does both: a **600 ms debounce** (typing "chocolate" sends one request, not nine), an **AbortController** that cancels stale requests, a **request counter** that stops at 15 per minute with a "please wait N seconds" message, and a 10-minute **cache**. The AI's first diagnosis was also incomplete. It assumed a per-minute limit, but we were still blocked 25 minutes later because `search.pl` was closed to anonymous users. Only after that did it switch to **Search-a-licious**, the service Open Food Facts built for full-text search, with a **Vite proxy** to solve the real CORS issue.

### 3.3 A test claim it wrote stopped being true *(Phase 3 → 5, corrected)*

Our Phase 3 README said opening `/product/123456` shows "Product not found". The Phase 5 review found that barcode **now exists** in Open Food Facts, so the test would fail in a live demo. Open data changes, and an AI can't know that. We replaced it with `/product/abc`: not a valid barcode, so the app shows "Product not found" without sending a request. That test can't go out of date.

### 3.4 An AI review of our work was wrong about a third of the time *(Phase 4, partly rejected)*

Before Phase 4 we had an AI review our project against the rubric *(team: name the tool that produced the review)*. We checked each claim against the actual files:



### 3.5 Features from our AI-drafted proposal we chose not to build 

The proposal listed a **light/dark theme toggle** and an **allergen-preferences form**. In Phase 4 we replaced the allergen form with **My limits** (sugar and salt per 100 g). Allergen data on Open Food Facts is often missing, so a filter built on it would quietly miss products. Sugar and salt are numbers we can actually check. We left out the theme toggle to spend the time on validation and persistence, which the rubric weighs. *(Team: confirm or adjust this reasoning.)*

### 3.6 The Compare verdict ranked "unknown" below "E" 

`pickWinner()` gave a product with **no** Nutri-Score the rank 99, so it lost to an **E** product "because of a better Nutri-Score", which isn't true. A missing grade is unknown, not bad. Now grades are compared only when both products have one. Otherwise the verdict falls back to sugar and says so ("one has no Nutri-Score, so compared on sugar"). We tested both cases.



## 4. What we learned

1. **AI is confident about APIs it hasn't checked.** Reading the provider's documentation fixed in an hour what guessing couldn't fix in a day.
2. **"It works" needs evidence.** Every accepted change was tested in the browser, and the AI's tests used mocked data, so we still had to test against the live API ourselves.
3. **Reviews need reviewing.** An AI review is a list of things to check, not a list of facts.
4. **We own the product decisions.** The AI optimises for "makes the error go away"; we decided what the app should feel like.
5. **Every line has an owner.** Each of us can explain the parts we present, including the code the AI drafted.
