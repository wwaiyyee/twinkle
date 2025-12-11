# Twinkle

> Gamified learning designed for ADHD kids, creating a focused, engaging environment to unlock their full potential and foster understanding in education worldwide.

## Inspiration
While working as a part-time teacher, I noticed something remarkable: these children were extremely curious and eager to learn, yet they were often frustrated by their inability to keep up in the classroom. Whether dealing with ADHD, which makes it hard to stay focused, or dyslexia, which complicates reading and writing, these kids were consistently falling behind, getting bullied, and becoming disengaged from school.

Through conversations with colleagues, we discovered some troubling truths:

- **Mental Health Crisis:** Many children with ADHD and dyslexia suffer deeply, experiencing anxiety, low self-esteem, and sometimes even suicidal thoughts because they feel misunderstood by both their teachers and parents.
- **Systemic Gaps:** The educational system isn’t yet fully equipped to support students with these specific learning needs. Teachers often use a one-size-fits-all approach, delivering standard lessons that don’t work for ADHD or dyslexic students. This leaves them feeling frustrated, isolated, and unwilling to learn.
- **Social Struggles:** ADHD and dyslexia can lead to significant social challenges. Children face bullying, isolation, and emotional tolls, which impact both their academic performance and mental well-being.

## Problem Statement
The educational system fails to address the unique needs of children with ADHD and dyslexia. The lack of tailored learning strategies and specialized tools contributes to disengagement, frustration, and poor mental health outcomes.

## Solution
We realized that to truly support these students, we needed to create a solution that combines engaging learning materials, a distraction-free environment, and multisensory engagement—something both ADHD and dyslexic students could thrive in.

**Twinkle** is our answer. We’ve designed a platform that gamifies learning in a way that grabs and holds attention, making education enjoyable rather than overwhelming. By providing a clean, stimulating environment with a balance of visuals, sounds, and interactivity, Twinkle helps kids with ADHD and dyslexia stay focused, learn at their own pace, and regain confidence in their abilities.

## What it does
Twinkle was created to fill this gap. By leveraging gamified learning and multisensory experiences, we’ve designed a platform that helps children with ADHD and dyslexia engage with educational content in a fun and effective way. It’s built with tools and features that support their reading and writing challenges, such as interactive games, text-to-speech, and customizable visuals, all within a distraction-free environment. Twinkle's mission is to not only help children with dyslexia improve academically but also restore their love for learning and their confidence.

## How we built it
Twinkle is built using modern web technologies to ensure a seamless and engaging user experience, developed entirely in TypeScript for robust type safety. The architecture follows a client-server model, with the frontend and backend communicating via API calls for dynamic, AI-driven content.

### Frontend
- **Next.js**: Powered by Next.js to provide a fast and efficient web application.
- **React Three Fiber & Pixi.js**: React Three Fiber is used to create immersive 3D environments, while Pixi.js handles high-performance 2D visual effects.
- **Tailwind CSS & Framer Motion**: The UI is designed responsively using Tailwind CSS for styling, with Framer Motion ensuring smooth animations.
- **Canvas Confetti**: Integrated for celebratory interactions, adding fun effects as users achieve learning milestones.

### Backend
- **Next.js API Routes**: Server-side logic is handled via Next.js API routes, including features like voice synthesis using ElevenLabs.
- **Express.js**: A dedicated Express.js service manages core API requests, ensuring smooth communication with external services.
- **Claude AI**: Integrated for advanced natural language processing, enabling intelligent and context-aware responses.

### Development Tools
- **Code Rabbit**: Used for debugging, ensuring that issues are identified and resolved quickly during the development process.
- **Cursor**: Employed to manage tasks and optimize workflows, streamlining the development cycle.

This combination of technologies ensures that Twinkle is both a fun and educational tool, offering personalized learning experiences through AI-driven features.

## Challenges we ran into
- **Balancing Gamification with Education:** Ensuring that the platform is both fun and educational was tricky. We had to carefully design the experience to keep students engaged without overwhelming them.
- **Technical Constraints:** Integrating 3D rendering with the educational content while maintaining performance was challenging, especially with mobile devices in mind.
- **AI Integration:** Working with the Anthropic Claude API for natural language processing required ensuring proper API call handling, data security, and key management.
- **Designing for ADHD Needs:** Striking the right balance of stimulation without overwhelming the students was crucial. We had to ensure the platform was engaging yet simple enough for ADHD students to thrive.

## Accomplishments that we're proud of
- **Unique Gamification:** We’re proud of the immersive and fun gamified learning experience that’s tailored to ADHD students, making learning enjoyable and engaging.
- **Successful AI Integration:** Successfully integrated the Anthropic Claude AI, which enhances the platform's interactivity and provides intelligent feedback to students.
- **Balanced Environment:** Achieved a clean and distraction-free design, helping ADHD students focus while still maintaining engagement through visuals and sound.
- **Impact on Mental Health:** We’re proud that Twinkle provides a safe and supportive environment for ADHD students, addressing their emotional and social needs by helping them feel understood and appreciated.

## What we learned
- **Understanding ADHD Needs:** We learned a lot about ADHD and the challenges these students face. Designing for them required deep empathy and an understanding of the right level of stimulation.
- **Tech Stack Synergy:** We gained valuable experience with the technologies used, especially in integrating React Three Fiber for 3D rendering, Next.js for efficient frontend architecture, and connecting to an AI model like Anthropic Claude.
- **User-Centric Design:** Creating a platform that caters to a very specific group (ADHD students) taught us the importance of continuously iterating based on user feedback and needs.

## What's next for Twinkle
- **Expanded Features:** We plan to incorporate more features like progress tracking, customizable avatars, and more diverse learning materials tailored to various learning styles.
- **Mobile Optimization:** Improving the mobile experience to ensure that the platform is accessible and engaging across devices.
- **Broader Reach:** We aim to expand Twinkle beyond Malaysia, bringing the platform to ADHD students around the world, adapting it for different educational systems.
- **Collaboration with Schools:** In the future, we hope to collaborate with educational institutions to integrate Twinkle as a part of their curriculum, providing teachers with tools and insights on how to engage ADHD students.

## Built With
- API
- CodeRabbit
- ElevenLabs
- Express.js
- Next.js
- React
- Tailwind CSS
- Three.js

## Try it out
- [Live Demo](https://cursorhack-twinkle.vercel.app)
- [GitHub Repo](https://github.com/wwaiyyee/twinkle)
