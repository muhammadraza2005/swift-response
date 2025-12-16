Module Questions & Answers

Topic 1: Version Control
Relevant Reading: Reading 5: Version Control

Question 1 (Best Question)
Context: In schema.sql, you modify the emergency_requests table to add a priority column. Your teammate simultaneously modifies the same table to add a notes column. You both commit your changes locally. When you try to git push, it fails.
Question: Based on the "Merging" section of the reading, why did the push fail (what is the state of the remote master vs your local master), and what is the two-step process you must perform to resolve this before pushing again?

Answer:
The push failed because the remote master branch has progressed (it contains your teammate's commit) and your local history has diverged from it. As the reading explains, if the server simply accepted your push, it would overwrite the history and your teammate's commit would disappear.
To resolve this, you must:
1. git pull: This downloads the new commits from the remote and attempts to merge them into your local work.
2. Merge/Resolve Conflicts: If Git cannot automatically merge the changes (likely in a single SQL file), you must manually resolve the conflicts in schema.sql, save, and create a new merge commit.
3. git push: Only after the histories are joined can you safely push your changes.

Question 2
Context: You are working on a new "Dark Mode" feature for src/app/layout.tsx. You want to experiment without disrupting the stable code in src/app/page.tsx.
Question: According to the "Inventing version control" section, what specific feature of version control allows you to "work in parallel" on this new feature without giving up version control, and what operation would you eventually use to combine your work back into the main project?

Question 3
Context: You accidentally deleted the entire src/app/requests directory and committed this mistake.
Question: Referring to the "Features of a version control system" section, which specific feature allows you to "restore old versions, in whole or in part", and does this feature track versions of single files or the project as a whole?

--------------------------------------------------------------------------------

Topic 2: Code Review
Relevant Reading: Reading 4: Code Review

Question 1
Context: In src/app/page.tsx, the string "Swift Response" appears in the metadata, the header, and the footer. A developer copies this string again into a new About component.
Question: This violates the "Don't Repeat Yourself" (DRY) principle. According to the reading, what is the "fundamental risk" of this duplication (e.g., if the app name changes), and how should it be refactored?

Question 2
Context: The schema.sql file defines roles like 'citizen', 'volunteer', and 'ngo_admin'. A developer writes a check: if (user.role == 'citizen').
Question: While not a numeric "Magic Number", this hardcoded string acts like one. According to the "Fail Fast" and "Smelly Example #1" sections, why is relying on these scattered string literals a "bad smell", and what is the preferred way to handle these constants to improve "Code Hygiene"?

Question 3 (Best Question)
Context: In a pull request for src/app/volunteer/page.tsx, a developer names a variable list to store the data fetched from the profiles table.
Question: Referring to the "Use Good Names" section, why is list considered a "symptom of extreme programmer laziness" (similar to tmp or data), and what specific name would be better given it contains volunteer profiles?

Answer:
The name list is poor because it only describes the structure of the variable (that it is a list/array) rather than its content or purpose. The reading states that names like tmp, temp, and data are "generally meaningless."
A better, self-descriptive name would be volunteerProfiles, activeVolunteers, or registeredUsers. This allows the code to "read clearly all by itself," making comments unnecessary and the logic easier to follow for other reviewers.

--------------------------------------------------------------------------------

Topic 3: Debugging
Relevant Reading: Reading 11: Debugging

Question 1 (Best Question)
Context: You are debugging an issue where the handle_new_user trigger in schema.sql fails to create a profile for some users. You have successfully found a test case that reproduces the failure.
Question: According to the "Scientific Method" in the reading, after you "Study the Data" (the failure logs), what is the immediate next step you should take before writing any code or changing the trigger?

Answer:
The next step is to "Hypothesize".
Instead of immediately trying to fix the code or guessing, you should "Propose a hypothesis, consistent with all the data, about where the bug might be, or where it cannot be." For example, you might hypothesize that "The raw_user_meta_data is null for these specific users." This hypothesis then guides your next step (Experiment) to prove or disprove it, ensuring a systematic approach to finding the root cause.

Question 2
Context: A user reports that the "Request Urgent Help" button in src/app/page.tsx is broken on their specific older tablet. You cannot reproduce it on your laptop.
Question: According to the "Reproduce the Bug" section, why is it worth the effort to find a "small, repeatable test case" (e.g., simulating that device's viewport or event handling) before trying to fix it, and what should you do with this test case after the bug is fixed?

Question 3
Context: You suspect a bug in the emergency_requests RLS policy in schema.sql. You decide to change the policy to using (true) to see if it works.
Question: According to the "Experiment" section, why is applying this "fix" to test your hypothesis "almost always the wrong thing to do", and what should you do instead (e.g., using a probe or print statement)?
