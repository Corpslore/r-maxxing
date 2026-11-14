// All copy lives here so it can be edited without touching app logic.
// In big headlines, "|" is a line break. Each line gets scaled to fill the width.

export const BRAND = {
  // A hyphen in the name is drawn as a censor bar in the logo.
  name: 'R-MAXXING',
  tagline: 'Not a thought.',
};

// Where the web version lives. Shared from inside the iPhone app, where the page has no public address.
export const PUBLIC_URL = 'https://corpslore.github.io/r-maxxing/';

export const CLOSER = 'At the end of the day, it’s the end of the day.';
// Each receipt keeps the one it was printed with.
export const CLOSERS = [CLOSER, 'No refunds on thinking.', 'Thinking: 0. Doing: 1.', 'The brain has been notified.', 'Keep this receipt. Or don’t. Not a thought.'];

// The opener: tap-through cards like Stories, one idea each. `ms` is how long a card holds
// before moving on by itself; the last card waits for the button. `then` slams in after a beat.
export const INTRO_CARDS = [
  { id: 'vs', tone: 'ink', ms: 3800, head: 'WE WIN.|EVERY.|TIME.' },
  { id: 'spiral', tone: 'sun', ms: 3400, head: 'OVERTHINKERS|SPIRAL.', then: 'WE JUST|ACT.' },
  {
    id: 'everest',
    tone: 'blue',
    ms: 4200,
    head: 'THEY ASK IF IT|CAN BE DONE.',
    then: 'WE CLIMB|EVEREST|ON A DARE.*',
    foot: '*Please don’t. That’s a one-way door. We’ll get to that.',
  },
  { id: 'raccoon', tone: 'pink', ms: 5000, head: 'WE ARE THE|RACCOON|IN A HELMET,|RACING A GROCERY CART|DOWN A WATERSLIDE.' },
  { id: 'free', tone: 'sun', head: 'WE ARE|SETTING PEOPLE|FREE HERE,|MY GUY.', foot: 'Type the thing you’re stalling on. Get one tiny step. Hit GO. Get a receipt.' },
];

export const INTRO = {
  sub: 'First: how many thoughts are in there? 7 questions. Don’t think about it.',
  cta: 'SCAN MY BRAIN',
  skip: 'I already know it’s bad',
  replay: '↻ Watch that again',
  rival: 'OVERTHINKER',
};

export const HOME_CTA = '{B}, I’M THINKING AGAIN';
// Quiet mode's version. Same button, inside voice.
export const HOME_CTA_QUIET = 'OKAY. I’M SPIRALING.';

export const QUIZ = [
  { q: 'THE MENU HAS|40 THINGS ON IT.', a: ['Point at one.', 'Check the reviews.', 'Find photos of this exact dish from 2019.'] },
  { q: 'YOU HAVE A 2-LINE|TEXT TO SEND.', a: ['Sent.', 'Rewrote it twice.', 'It’s in the group chat for review.'] },
  { q: 'IT’S 3AM.|YOUR BRAIN IS…', a: ['Asleep.', 'Replaying something you said in 7th grade.', 'Winning an argument that hasn’t happened.'] },
  { q: 'YOU’RE BUYING|A $20 THING.', a: ['Bought it.', 'Seven tabs open.', 'It’s in a spreadsheet.'] },
  { q: 'YOUR GROUP|PROJECT IS…', a: ['Done. It’s bad. It’s fine.', 'Almost done.', 'It has a group chat and no slides.'] },
  { q: 'SOMEONE SAYS|“WE SHOULD TALK.”', a: ['Okay.', 'About what?', 'You’ve already drafted your defense.'] },
  { q: 'WHERE DO YOU|WANT TO EAT?', a: ['Tacos.', 'I’m good with whatever.', 'Let me get back to you.'] },
];

export const TYPES = [
  { name: 'BOWLING BALL', roast: 'Not a thought. Pure. The elders would like to meet you.' },
  { name: 'LIGHT CREASING', roast: 'A few folds. You mostly just do stuff. Respect.' },
  { name: 'THE COMMITTEE', roast: 'Every decision goes to a vote. Nobody has ever won.' },
  { name: 'RESEARCH PHASE', roast: 'You’ve been looking into it since 2023.' },
  { name: 'FULL WALNUT', roast: 'It’s all folds in there, {b}. We have work to do.' },
];

export const THINK_TIMES = [
  { id: 'hour', label: 'AN HOUR', minutes: 60 },
  { id: 'day', label: 'A DAY', minutes: 1440 },
  { id: 'days', label: 'A FEW DAYS', minutes: 4320 },
  { id: 'week', label: 'A WEEK', minutes: 10080 },
  { id: 'weeks', label: 'TWO WEEKS', minutes: 20160 },
  { id: 'month', label: 'A MONTH', minutes: 43200 },
  { id: 'year', label: 'A YEAR OR MORE', minutes: 525600 },
];

// "yes" means the left-hand answer in core.doorVerdict's terms.
export const DOOR = [
  { key: 'serious', q: 'IS A DOCTOR,|A LAWYER, A COP|OR YOUR BANK|INVOLVED?', sub: 'Or could somebody get hurt?', yes: 'YEAH', no: 'NAH' },
  { key: 'undo', q: 'CAN YOU|UNDO IT?', sub: 'If it goes bad, can you try again?', yes: 'YEAH', no: 'NAH' },
  { key: 'cheap', q: 'WORST CASE:|EMBARRASSING|OR EXPENSIVE?', yes: 'EMBARRASSING', no: 'EXPENSIVE' },
  { key: 'solo', q: 'WHO PAYS IF|IT GOES BAD?', yes: 'JUST ME', no: 'OTHER PEOPLE' },
];

export const VERDICTS = {
  send: { title: 'SEND|IT.', sub: 'Two-way door, {b}. If it’s bad in there, come back out.', cta: 'LET’S GO' },
  shrink: { title: 'TOO BIG.|MAKE IT|STUPID SMALL.', sub: 'Do the version you can take back.', cta: 'SHRINK IT' },
  think: { title: 'WOAH.|ONE-WAY|DOOR.', sub: 'This is the one time we use the brain. Put a date on it and ask somebody who knows.', cta: 'SET THAT UP' },
};

export const MOONWALK_LABEL = 'DO A 360 AND MOONWALK AWAY';

export const ONE_WAY_COPY = {
  health: { why: 'This one’s your health. A doctor thinks about this, not an app. We are an app.', move: 'Call the doctor, or write down the one question to ask them.' },
  money: { why: 'This is real money. We don’t yolo real money. Ask somebody with no stake in it.', move: 'Write down the one number you need, then ask somebody with no stake in it.' },
  law: { why: 'This has legal weight. The law does not care that you have no thoughts. Get somebody who knows.', move: 'Find one person who knows this area and send them the question.' },
  safety: { why: 'Somebody could get hurt. This is not a send-it situation.', move: 'Don’t do it today. Call somebody you trust.' },
  life: { why: 'Hard to walk that one back. Thinking is correct here. Put a date on it so it doesn’t go on forever.', move: 'Pick the date you’ll decide by, put it in your calendar and tell one person.' },
  teen: { why: 'That’s one of the few things we don’t send. Not in here.', move: 'Don’t do it today. Text one person you trust about it instead.' },
  pics: { why: 'Pics are a one-way door. Once they’re sent, they’re not yours anymore.', move: 'Don’t send it. If someone’s pushing you for it, that’s your answer about them.' },
  cruel: { why: 'Not writing that one. Saying that to someone is a one-way door.', move: 'Put the phone down for a minute. If they really got to you, tell one person you trust.' },
};

// Shown when the wording is often a joke ("kms", "unalive"). No assumptions either way.
export const CRISIS_CHECK_COPY = {
  title: 'Quick check. Joke, or a real thing?',
  sub: 'No wrong answer. We just want to point you the right way.',
  joke: 'JOKE. KEEP GOING',
  real: 'NOT A JOKE',
};

export const DEFAULT_THINK_MOVE = 'Write down the question, pick a date to decide by and ask somebody who’d know.';

// The first tiny step the fast lane suggests, picked by core.suggestKind from what you typed.
export const MOVE_SUGGESTIONS = {
  draft: ['Write it ugly. Send it.', 'One message. Then phone down.', 'Send it before the brain votes.', 'Type it badly. Send it anyway.'],
  // After MAKE IT STUPID SMALL: a smaller version, not the same thing.
  shrinkDraft: 'Ask for the smallest piece of it. One line.',
  shrink: 'Do the 2-minute version you can take back.',
  gym: 'Put your shoes on and go.',
  email: 'Open it and write one ugly sentence.',
  apply: 'Open the application and fill in the first box.',
  clean: 'Clean one surface. Just one.',
  call: 'Dial the number. Say hi.',
  write: 'Write one ugly sentence. Then another.',
  book: 'Open the booking page. Take the first open slot.',
  form: 'Open the form. Fill in the first box.',
  pay: 'Open the payment page. Find the amount.',
  default: 'Start the ugly version.',
  interview: 'Write the question you’re scared of. Answer it out loud once.',
  lookup: 'Open the page. Read for two minutes, then stop.',
};

// Draft it ugly: plain messages people can actually send. No jokes in here, these go to real people.
// Write names as "Hey {name}," so a blank name still reads right ("Hey,").
export const DRAFTS = [
  { id: 'reply', label: 'REPLY', subject: 'Getting back to you', variants: [
    'Hey {name}! [Your answer to what they asked.] How’s your week going?',
    'Hey {name}, finally answering: [your answer]. What’s new with you?',
    'Hey {name}, late reply, but yes to [the thing]. Are you around this week?',
  ], casual: [
    'heyy [your answer] how’s ur week going',
    'omg sorry just saw this. [your answer]',
    'late but yes to [the thing] lol. u around this week',
    'sorry i’m so late on this. [your answer]',
  ] },
  { id: 'reacted', label: 'THEY REPLIED TO YOUR STORY', subject: 'Your story', variants: [
    'Ha, you saw that. [What happened.]',
    'Okay, you caught that. [Your comeback.]',
  ], casual: [
    'lmaooo you weren’t supposed to see that',
    'ok you caught that 💀 [what happened]',
    'lol [your comeback]',
  ] },
  { id: 'group', label: 'GROUP CHAT', subject: 'Plans', variants: [
    'Sorry I’ve been quiet. My part is coming [day].',
    'Okay who’s free [day]? I’m in for [the plan].',
    'Late to this but I’m in. What time?',
  ], casual: [
    'sorry been mia. my part is coming [day]',
    'on it. sending my [part] by [time]',
    'ok who’s free [day] i’m in for [the plan]',
    'late to this but i’m in what time',
    'wait i’m down. when',
  ] },
  { id: 'family', label: 'FAMILY', subject: 'Hi', variants: [
    'Hi! Sorry I’ve been hard to reach, this week was a lot. Can I call you [day] at [time]? Love you.',
    'Hi! [Your answer.] Love you.',
  ], casual: [
    'hi!! sorry this week was insane. can i call u [day] at [time]? love u',
    'sorry i keep missing u. calling [day], promise',
    'hi! [your answer] love u',
  ] },
  { id: 'story', label: 'REPLY TO A STORY', subject: 'Your story', variants: [
    'Wait, where is this?',
    'This is so good. [What you liked.]',
  ], casual: [
    'wait where is this',
    'ok this is so good',
    'no bc i need to go here',
  ] },
  { id: 'plans', label: 'MAKE PLANS', subject: 'Catching up', variants: [
    'Hey {name}, what are you doing Saturday? Want to grab food?',
    'Hey {name}, it’s been too long. Free for a coffee this week?',
    'Hey {name}, I’m trying to actually see people more. Dinner sometime this week?',
  ], casual: [
    'what are u doing saturday? food?',
    'it’s been too long. coffee this week?',
  ] },
  { id: 'askout', label: 'ASK THEM OUT', subject: 'Dinner?', note: 'If it’s a no, say “all good” and leave it there.', variants: [
    'Hey {name}, I’d like to take you out. Are you free Thursday for food?',
    'Hey {name}, want to get dinner with me this week? Thursday or Saturday both work.',
  ], casual: [
    'ok random but do u wanna hang out this week',
    'we should get food sometime. thursday?',
  ] },
  { id: 'makeup', label: 'WE GOOD?', subject: 'We good?', variants: [
    'Hey {name}, nah, we’re good. My bad about last week. You around [tonight]?',
    'Hey {name}, I’m not mad. I was annoyed about [the thing], but we’re good.',
  ], casual: [
    'nah we good. my bad about last week. u on tonight?',
    'we good fr. [the thing] was dumb. u around later?',
  ] },
  { id: 'apology', label: 'APOLOGIZE', subject: 'I’m sorry', variants: [
    'Hey {name}, I’ve been thinking about what happened. I’m sorry. You didn’t deserve that.',
    'Hey {name}, I owe you an apology. I got that wrong, and I’m sorry. No excuses.',
  ], casual: [
    'hey i was wrong about [the thing]. i’m sorry',
  ] },
  { id: 'decline', label: 'SAY NO', subject: 'Can’t make it', variants: [
    'Hey {name}, I’m going to pass on this one, but thank you for thinking of me.',
    'Hey {name}, I can’t make it after all. Sorry for the short notice.',
  ], casual: [
    'can’t make it this time but have fun',
    'gonna pass on this one but ty for inviting me',
  ] },
  { id: 'favor', label: 'ASK A FAVOR', subject: 'Quick favor', variants: [
    'Hey {name}, could I ask you a favor? Totally fine to say no.',
    'Hey {name}, I could use a hand with something this week. Any chance you’re free for an hour?',
  ], casual: [
    'can i ask u a favor? totally fine if not',
  ] },
  { id: 'issue', label: 'BRING IT UP', subject: 'Quick talk?', variants: [
    'Hey {name}, can we talk about something small before it turns into something big? Nothing dramatic.',
    'Hey {name}, something’s been on my mind and I’d rather just say it. Got a few minutes later?',
  ], casual: [
    'hey can we talk about something small before it’s a big thing. nothing dramatic',
  ] },
  { id: 'coach', label: 'ASK COACH', subject: 'Quick question', variants: [
    'Hey Coach {name}, could I get a few minutes after practice? I want to know what I can work on to earn more playing time.',
    'Hey Coach {name}, what’s one thing I can do better this week to get more minutes?',
  ], casual: [
    'hey coach, can i talk to you after practice for a sec? want to know what to work on',
  ] },
  { id: 'missed', label: 'MISSED CLASS', subject: 'Missed [quiz] in [class]', variants: [
    'Hi Professor {name}, I missed the [quiz] in [class] on [day]. Is there any way to make it up? I can come to office hours.',
    'Hi Professor {name}, I’m sorry I missed class on [day]. Could you tell me what I missed, or is it in the slides?',
  ] },
  { id: 'prof', label: 'EMAIL A PROFESSOR', subject: 'Question about [class]', variants: [
    'Hi Professor {name}, I’m in your [class] section. I’m behind on [assignment] and wanted to ask for an extension to [day]. I can have it to you by then. Thank you for considering it.',
    'Hi Professor {name}, I’m stuck on [topic] from [class]. Could I come to office hours [day/time], or is there a better time?',
    'Hi Professor {name}, I have a quick question about my grade on [assignment]. Could we go over it for a few minutes this week?',
  ] },
  { id: 'rec', label: 'ASK FOR A REC LETTER', subject: 'Recommendation request', variants: [
    'Hi {name}, I’m applying to [colleges or program], and you know my work better than anyone. Would you be willing to write me a recommendation? It’s due [date]. I can send my resume and anything else that helps. Thank you!',
    'Hi Professor {name}, I took your [class] in [semester] and really liked it. I’m applying to [program or job], and I’d be grateful if you’d write me a recommendation. It’s due [date]. I can send my resume and anything else that helps. Totally understand if you can’t.',
  ] },
  { id: 'cover', label: 'COVER A SHIFT', subject: 'Covering [day]', variants: [
    'Hi {name}, yes, I can cover [day]. Sorry for the slow reply. What time?',
    'Hi {name}, I can’t cover [day], sorry. I could do [another day] if that helps.',
  ], casual: [
    'yeah i can cover [day], sorry just saw this. what time?',
    'can’t do [day] sorry. i could do [another day] tho',
  ] },
  { id: 'shift', label: 'WORK SCHEDULE', subject: 'Schedule request', variants: [
    'Hi {name}, could I come off [day] shifts for the next [few weeks]? I have [reason]. Happy to pick up [another shift] instead.',
    'Hi {name}, I need [day] off for [reason]. I can swap with someone or pick up [another shift]. Does that work?',
    'Hi {name}, can we look at my schedule? I can do [days you can work], but not [days you can’t] for the next [few weeks].',
  ], casual: [
    'hey! could i get off [day] shifts for the next [few weeks]? i have [reason]. i can pick up [another shift]',
    'hey can i get [day] off? i can swap or pick up [another shift]',
  ] },
  { id: 'job', label: 'JOB FOLLOW-UP', subject: 'Following up on my application', variants: [
    'Hi {name}, I applied for the [role] position on [date] and wanted to check in. I’m still very interested and happy to send anything else you need. Thank you!',
    'Hi {name}, thanks again for talking with me about the [role]. I enjoyed it and I’m still very interested. Is there anything else I can send?',
  ] },
  { id: 'recruiter', label: 'REPLY TO A RECRUITER', subject: 'Re: [role]', variants: [
    'Hi {name}, thanks for reaching out! I’m interested. I’m free [time 1] or [time 2] this week for a call. Does either work?',
    'Hi {name}, thanks for thinking of me. Could you send the job description and the pay range? Happy to set up a call after.',
  ] },
  { id: 'meeting', label: 'ASK FOR A MEETING', subject: 'Quick chat this week?', variants: [
    'Hi {name}, do you have 20 minutes this week? I’d like your take on something I’m working on.',
    'Hi {name}, could we set up a quick call this week? I want to talk through where I’m at and what’s next.',
  ] },
  { id: 'followup', label: 'FOLLOW UP', subject: 'Following up', variants: [
    'Hi {name}, following up on my last message. Is there anything else you need from me?',
    'Hi {name}, checking in on this. Still interested, and happy to answer any questions.',
  ] },
  { id: 'roommate', label: 'ROOMMATE', subject: 'Quick thing', variants: [
    'Hey {name}, can we figure out the [dishes/cleaning/guests] thing? Not mad, I just want it to stop being a thing. Got 5 minutes tonight?',
    'Hey {name}, can we set some ground rules for the [dishes/cleaning/guests] thing? I want us both to be comfortable in here.',
  ], casual: [
    'hey can we figure out the [dishes] thing? not mad just want it to stop being a thing',
    'hey can we talk about the [dishes] thing tmrw? nothing big, just want us both to be ok with it',
    'ok random but can we make a rule for the [dishes] thing',
  ] },
  { id: 'landlord', label: 'LANDLORD', subject: '[Issue] at [unit]', variants: [
    'Hi {name}, the [issue] in [unit] needs fixing. It started [when]. When could someone come take a look?',
    'Hi {name}, following up on the [issue] I reported on [date]. Is there an update on when it’ll be fixed?',
  ] },
  { id: 'refund', label: 'ASK FOR A REFUND', subject: 'Refund request', variants: [
    'Hi, I’d like to request a refund for my recent order. What do you need from me to process it?',
    'Hi, the item I bought didn’t work out for me. Can I get a refund?',
  ] },
  { id: 'reconnect', label: 'RECONNECT', subject: 'Long time', variants: [
    'Hey {name}! Sorry it took me forever. [Your answer.] What’s new with you?',
    'Hey {name}, you crossed my mind today. How have you been?',
    'Hey {name}, it’s been way too long. What are you up to these days?',
  ], casual: [
    'omg i’m so sorry i fell off the face of the earth. [your answer]',
    'this is so late but [your answer]. how’ve u been',
    'u crossed my mind today. how’ve u been',
  ] },
];


// Tap-to-fill first steps on the fast lane. Five are shown per round.
export const MOVE_CHIPS = [
  'Write one ugly sentence.', 'Send one message.', 'Put my shoes on.', 'Open the thing.', 'Ask one question.',
  'Open it and just look.', 'Stand up.', 'Make the first click.', 'Say it out loud once.', 'Do the worst part first.',
  'Open a blank page.', 'Find the email address.', 'Put it on the calendar.', 'Clear one square foot.', 'Write the subject line.',
];

export const DREAD = ['Fine', 'Awkward', 'Bad', 'Disaster'];

export const THING_PLACEHOLDERS = [
  'texting them back', 'that email', 'going to the gym', 'posting the video', 'asking for the meeting',
  'replying to the group chat', 'replying to their story', 'the laundry', 'asking coach a question',
  'the first sentence of the essay', 'saying hi first', 'returning the package', 'sending my part of the project',
  'cleaning my room', 'answering the voicemail', 'asking for the day off',
];

// One a day, the same for everyone, collected in the Vault. Add new ones at the end.
export const KOANS = [
  'No dog has ever asked for feedback.',
  'A cat doesn’t circle back.',
  'Fish don’t have a morning routine.',
  'Rocks have never once reconsidered.',
  'The bird doesn’t have a Notion.',
  'The door is a door.',
  'A text is a very small letter.',
  'An email is just typing.',
  'It was always going to be Thursday.',
  'You have legs. They go places.',
  'Send is one button.',
  'Thinking is free. That’s what’s wrong with it.',
  'Either it works or it doesn’t. That’s all of them.',
  'The gym is where the gym is.',
  'Tomorrow is also a day.',
  'Soup is soup.',
  'A duck doesn’t check how the water feels about it.',
  'Pigeons walk into places like they own them.',
  'Toast is just bread that committed.',
  'The kettle boils whether you watch it or not.',
  'A goose has never once apologized.',
  'The sun comes up without a pros and cons list.',
  'Ants carry stuff. That’s the whole job.',
  'Snails get there.',
  'The moon shows up half done.',
  'Rain doesn’t practice.',
  'The squirrel buried it and moved on.',
  'A frog jumps. That’s the frog’s whole thing.',
  'Bread rises. It doesn’t think about it.',
  'Nobody remembers a Tuesday.',
  'The fridge light doesn’t ask why.',
  'Your phone is heavier when the text is unsent.',
  'Mountains don’t wait to feel ready.',
  'A sandwich has never waited for the right time.',
  'Every expert started as someone who just started.',
  'The ocean doesn’t have a backup plan.',
  'Trees grow one ring a year and never post about it.',
  'A lost sock is still a sock somewhere.',
  'Horses don’t have an inner monologue. Probably.',
  'The mailbox doesn’t judge.',
];

export const DONE_LINES = [
  'Go have an orange juice.',
  'Done is done.',
  'That’s it. That was the whole thing.',
  'Not a thought.',
  'Three weeks for that, {b}.',
  'The thing is now a thing you did.',
  'Somewhere, a dog is proud of you. He doesn’t know why.',
  'You can stop rehearsing it now.',
  'It happened. History will not be covering it.',
  'Look at you. Doing stuff.',
  'The committee in your head has been dismissed.',
  'No notes.',
  'File it under: over.',
  'Your brain wanted a meeting about this. Denied.',
  'Put it on the fridge.',
  'Wow. Legs and everything.',
  'Nobody clapped. That’s normal. We clapped.',
  'Thinking about it took longer. It always does.',
  'Cross it off. Use a pen. Press hard.',
  'One fewer tab open in your head.',
  'That’s a receipt. Receipts don’t lie.',
  'The raccoon salutes you.',
  'Zero thoughts were harmed.',
  'Next.',
  'Huge. Enormous. Medium, actually. Still counts.',
  'Your future self says thanks. They’re also busy.',
  'Brain empty. Hands full.',
  'Write that down. Actually, don’t. Move on.',
  'Certified smooth.',
  'The overthinker in you has filed a complaint. Ignored.',
  'You did the thing instead of the thinking. Revolutionary.',
  'That’s one less thing to lie awake about.',
];

// Chickening out costs nothing. These say so in different words.
export const BAIL_LINES = [
  'You chickened out. No penalty. Try again when you try again.',
  'Not today. Today is allowed to be not today.',
  'Chickened out. The chicken has been noted. No penalty.',
  'The thing will still be there. It isn’t going anywhere. Neither are you.',
  'Bailing costs nothing in here. Come back when you come back.',
  'Strategic retreat. No penalty.',
  'You looked at it, at least. Looking counts for something. Not much. Something.',
  'Moonwalked away from that one. Allowed.',
];

// Lines aimed at the moment. The first matching context wins; the rest fall back to DONE_LINES.
// `always: true` contexts beat a generic line every time; the others win about half the time.
export const CONTEXT_LINES = {
  first: { always: true, lines: ['Your first receipt. Frame it. Don’t actually frame it.', 'First one. That was the hard part. That was also the only part.'] },
  streak3: { always: true, lines: ['Three days in a row. That’s a pattern now.'] },
  streak7: { always: true, lines: ['A full week. Your brain is filing for unemployment.'] },
  streak14: { always: true, lines: ['Two weeks straight. The committee in your head has been disbanded.'] },
  streak30: { always: true, lines: ['Thirty days. You are now the raccoon in the helmet.'] },
  back: { always: true, lines: ['You came back. The brain missed you. It won’t say so.', 'Welcome back. Nothing happened while you were gone. Nothing ever does.'] },
  daily: { lines: ['Mission complete. Everyone got the same one. You actually did it.', 'Today’s mission: handled. The rest of the day is a bonus.', 'The mission was the mission. Done.'] },
  quick: { lines: ['Under a minute. The worrying took longer than the doing.', 'Faster than a microwave burrito.', 'That took less time than reading this.', 'Blink and you did it.'] },
  late: { lines: ['Middle of the night and you did a thing. Now sleep.', 'Night shift complete. Go to bed, legend.', 'It’s late. The thing is done. The brain can clock out.'] },
  early: { lines: ['Done before 8 a.m. Disgusting. Well done.', 'Done before breakfast. The day can’t touch you now.', 'Early bird. The worm never saw it coming.'] },
  monday: { lines: ['Did a thing on a Monday. Monday hates that.', 'Monday, handled. The rest of the week is scared now.'] },
  friday: { lines: ['Friday, and you still did it. Unhinged. Respect.', 'Did a thing on a Friday. The weekend is earned.'] },
  weekend: { lines: ['Did a thing on the weekend. Nobody even made you.', 'Weekend thing, done. Back to lying down.'] },
  dare: { always: true, lines: ['The wheel said do it. You did it. Respect the wheel.', 'Dare accepted. Dare completed. The wheel is pleased.', 'You let a wheel run your life for five minutes. It worked.'] },
};

// How often an everyday moment line beats a generic one. Low, so small pools don't wear out.
export const MOMENT_ODDS = 0.35;

// ---------- the wardrobe ----------
// Drawn in brain.js. Pieces drop as you finish things, in an order shuffled per person,
// and they're never announced ahead of time: the surprise is the point.
export const WARDROBE_INFO = [
  { id: 'partyhat', name: 'PARTY HAT', line: 'For no reason. That’s the best reason.' },
  { id: 'helmet', name: 'RACING HELMET', line: 'For the waterslide. You know the one.' },
  { id: 'crown', name: 'CROWN', line: 'King of doing it before thinking about it.' },
  { id: 'propeller', name: 'PROPELLER CAP', line: 'Spins faster than your thoughts now.' },
  { id: 'sweatband', name: 'SWEATBAND', line: 'You’re not sweating. The brain is.' },
  { id: 'chefhat', name: 'CHEF HAT', line: 'Cooking. Not thinking. Cooking.' },
  { id: 'headphones', name: 'HEADPHONES', line: 'Can’t hear the overthinking. Too loud in here.' },
  { id: 'cowboy', name: 'COWBOY HAT', line: 'Yeehaw is a complete thought.' },
  { id: 'bow', name: 'BOW', line: 'Gift-wrapped. Present tense.' },
  { id: 'cone', name: 'TRAFFIC CONE', line: 'Found it. Wearing it. No further questions.' },
  { id: 'mustache', name: 'MUSTACHE', line: 'Distinguished. Has never once reconsidered.' },
  { id: 'halo', name: 'HALO', line: 'A smooth brain is a holy brain.' },
];

// ---------- Pro ----------
// One-time purchase, never a subscription. It adds things; nothing free is taken away,
// and nothing about safety (the door check, crisis routing) is ever behind it.
// Prices come from the App Store at runtime and are set in App Store Connect, never here.
export const PRODUCTS = {
  pro: {
    id: 'rmaxxing.pro',
    name: 'R-MAXXING PRO',
    pitch: 'More nerve. Bold versions of the scary messages, dares with stakes and the group chat pack. Plus hats.',
    perks: [
      'SAY IT BOLD: every message, written like you’re not scared',
      'HARD MODE: 20 dares with actual stakes',
      'GROUP CHAT PACK: 20 more BUT WHAT IF comebacks',
      '6 bonus hats and 4 receipt colors',
      'One payment. Not a subscription. Ever.',
    ],
  },
  tips: [
    { id: 'rmaxxing.tip.oj', name: 'Buy the brain an orange juice' },
    { id: 'rmaxxing.tip.sandwich', name: 'Buy the brain a sandwich' },
    { id: 'rmaxxing.tip.cart', name: 'Buy the raccoon a new cart' },
  ],
};

export const PRO_WARDROBE_INFO = [
  { id: 'wizard', name: 'WIZARD HAT', line: 'Casts one spell: Just Do It.' },
  { id: 'viking', name: 'VIKING HELMET', line: 'Raided the to-do list. Took everything.' },
  { id: 'tophat', name: 'TOP HAT', line: 'A gentleman of zero thoughts.' },
  { id: 'tiara', name: 'TIARA', line: 'Royalty doesn’t overthink. Royalty waves.' },
  { id: 'pirate', name: 'PIRATE HAT', line: 'Sails first. Charts later.' },
  { id: 'beanie', name: 'BEANIE', line: 'Cozy. Smooth. Unbothered.' },
];

// Receipt colors, in the app and on share cards. Classic is free; the rest come with Pro.
// The gold legendary receipt always wins over a skin.
export const RECEIPT_SKINS = [
  { id: 'classic', name: 'CLASSIC', paper: '#FFFDF5', ink: '#0B0B0B', mute: '#67624F' },
  { id: 'neon', name: 'NEON', paper: '#0B0B0B', ink: '#7CFF4F', mute: '#4FB833', pro: true },
  { id: 'bubblegum', name: 'BUBBLEGUM', paper: '#FF8FB4', ink: '#0B0B0B', mute: '#6B1F3D', pro: true },
  { id: 'blueprint', name: 'BLUEPRINT', paper: '#1E2BFF', ink: '#FFF8E7', mute: '#CDD1FF', pro: true },
  { id: 'kraft', name: 'KRAFT', paper: '#C9A574', ink: '#2B1D0E', mute: '#5C4325', pro: true },
];

export const TIP_THANKS = [
  'The brain drank it in one go. Thank you.',
  'Tip received. The brain is smoother just knowing.',
  'You paid for a raccoon’s cart. That’s legendary behavior.',
  'Thank you. That money is going straight to not thinking.',
];

// Finished things (bails don't count here) at which a new piece drops.
export const DRIP_AT = [1, 3, 5, 8, 11, 15, 19, 24, 29, 35, 42, 50];

// Tap the brain on the home screen.
export const POKE_LINES = [
  '{Bb}.',
  'Not a thought in here. Check.',
  'Ow. Go do the thing.',
  'I’m busy doing nothing.',
  'Poke me again. I dare you.',
  'Soup.',
  'You’re stalling. I can tell.',
  'Hi. Bye. Go.',
  'I had a thought once. Didn’t like it.',
  'That tickles. Do something.',
  'Echo… echo… echo…',
  'Fully loaded. Nothing in it.',
  'Still Thursday in here.',
  'Do I look smoother to you?',
  'Rent-free. Nobody else lives here.',
  'Beep. Boop. Go outside.',
  'I’m not a stress ball. Well. Okay.',
  'The raccoon says hi.',
  'You poked me. That’s an action. Proud of you.',
  'Thinking about thinking about it? No.',
];

// Spin a dare: small, safe and silly. Mixed with the open mission packs.
export const DARES = [
  'Say “brother” out loud to nobody.',
  'Text someone “thinking of you” with no context.',
  'Reply to the oldest unread message you have.',
  'Do five squats right now.',
  'Make your bed. Badly.',
  'Take the stairs once today.',
  'Put one thing back where it goes.',
  'Send a voice memo instead of a text.',
  'Stand outside for 60 seconds. That’s it.',
  'Delete one app you never open.',
  'Ask someone how their day actually was.',
  'Wipe your phone screen. You know why.',
  'Throw away one thing from your bag.',
  'Drink a glass of water like it’s a toast.',
  'Write tomorrow’s first task on a sticky note.',
  'High-five a doorframe on your way out.',
  'Open the app you’ve been avoiding. Just open it.',
  'Unsubscribe from one email list.',
  'Compliment the next dog you see. Out loud.',
  'Water a plant. Any plant. Yours.',
];

// Shown while the clock runs, one at a time.
// The timer on a one-way door: the one time the brain is on the clock, so not "head empty".
export const THINK_TIMER_LINES = [
  'This one gets the brain. Ten minutes, then it clocks out.',
  'Write the question down. Then a date. Then a name.',
  'Thinking on purpose. Not spiraling. Different thing.',
  'Who would know? Write their name.',
  'A date to decide by. That’s it. Not the decision.',
];

export const TIMER_LINES = [
  'Thoughts: zero. Keep it there.',
  'You’re doing it. That’s the whole thing.',
  'Nobody is watching. Keep going.',
  'The brain is buffering. Good.',
  'This is the part where you don’t stop.',
  'Overthinking has left the building.',
  'Still going. Look at you.',
  'Hands busy. Head empty.',
  'If it’s ugly, it counts.',
  'Somewhere a dog is rooting for you.',
  'Done beats good. Keep it moving.',
  'The committee is on break.',
  'Don’t check. Just keep doing.',
  'The raccoon is in the cart. The cart is moving.',
  'You can decide later. You’re busy.',
  'Small step. Then the next one.',
  'Zero thoughts. Full send.',
  'This is what Thursday is for.',
  'You don’t need a plan. You need a minute.',
  '{Bb}. You’re doing it.',
];

// Daily nudges in the iPhone app. No guilt, no owl threats.
export const NUDGE_LINES = [
  'One tiny thing. Then you’re free.',
  'Today’s mission is small. Like, really small.',
  'Your brain is getting wrinkly. One move smooths it.',
  'The thing you’re avoiding takes nine seconds.',
  'Not a thought. Just one move.',
  '{Bb}. One thing.',
  'Spin a dare. Let the wheel decide.',
  'The raccoon is waiting in the cart.',
  'Something new might drop today. Go find out.',
  'Five minutes. Then you can go back to nothing.',
  'Ugly and done beats perfect and later.',
  'Today’s koan is up. So are you, probably.',
];

// Each round of the fast lane gets its own color, so no two rounds look alike.
export const THEMES = ['sun', 'pink', 'blue', 'lime', 'orange'];

// Rare: about 1 receipt in 20 comes out gold with one of these. Collected in the Vault.
export const RARE_LINES = [
  'A raccoon in a helmet just slid past and saluted.',
  'Somewhere, a spreadsheet you never made breathes a sigh of relief.',
  'For one second your brain was fully smooth. It felt like soup.',
  'The committee in your head has been dissolved. Nobody showed up to object.',
  'A dog somewhere did nothing at all today and is still proud of you.',
  'Monday called. It wants to know your secret.',
  'You have been promoted to Thing Doer, First Class.',
  'A pigeon walked into a bank today with this exact energy.',
  'Even the orange juice is impressed.',
  'This receipt is printed in gold. It isn’t. But imagine.',
  'Soup is soup. And you are you. Wow.',
];

// The "whiny objection, deadpan answer" format is the signature joke of the source videos.
// Written to stay safe for anything: these are about texts and gyms, never about real stakes.
export const OBJECTIONS = [
  { q: 'But what if they don’t text back?', a: 'THEN THEY|DON’T TEXT|BACK, {B}.' },
  { q: 'But what if it goes badly?', a: 'THEN IT|WENT BADLY.|STILL TUESDAY.' },
  { q: 'But what if I look stupid?', a: 'NOBODY|IS LOOKING|AT YOU.' },
  { q: 'But I’m not ready.', a: 'NOBODY|ASKED.' },
  { q: 'But I should do more research.', a: 'THE DOG|DID NO|RESEARCH.' },
  { q: 'But what will people think?', a: 'THEY WON’T.|THAT’S THE WHOLE|PROBLEM WITH PEOPLE.' },
  { q: 'But what if there’s a better option?', a: 'THERE IS.|EAT THE|TACO.' },
  { q: 'But I need a plan.', a: 'YOU DO IT.|THEN IT’S DONE.|THAT’S THE PLAN.' },
  { q: 'But it’s not the right time.', time: true },
  { q: 'But what if I fail?', a: 'THEN YOU|DID SOMETHING.|HUGE UPGRADE.' },
  { q: 'But I’m tired.', a: 'HAVE AN|ORANGE|JUICE.' },
  { q: 'But what if it’s awkward?', a: 'IT LASTS|NINE|SECONDS.' },
  { q: 'But what does it all mean?', a: 'IT MEANS|THURSDAY.' },
  { q: 'But the reviews are mixed.', a: 'IT’S|SOUP.' },
  { q: 'But I could just start Monday.', a: 'MONDAY|IS A|MYTH.' },
  { q: 'But my friend said…', a: 'YOUR FRIEND|IS ALSO|SCARED.' },
  { q: 'But I might regret it.', a: 'YOU REGRET IT|ALREADY AND YOU|HAVEN’T DONE IT.' },
  { q: 'But I made a spreadsheet.', a: 'WE|KNOW.' },
  { q: 'But what if I’m overthinking this?', a: '{B}.', none: 'YOU ARE.|WE CAN|TELL.' },
  { q: 'But what if they say no?', a: 'THEN YOU|KNOW.|CONGRATS.' },
  { q: 'But I don’t know how.', a: 'NOBODY DID.|THEN THEY|DID.' },
  { q: 'But it has to be perfect.', a: 'IT WON’T BE.|SEND IT|ANYWAY.' },
  { q: 'But what if they’re busy?', a: 'THEN THEY|ANSWER|LATER.' },
  { q: 'But I already waited too long.', a: 'NOW IS LESS|LATE THAN|LATER.' },
  { q: 'But what if I’m bad at it?', a: 'YOU ARE.|EVERYONE IS.|AT FIRST.' },
  { q: 'But I need to feel motivated.', a: 'MOTIVATION|SHOWS UP|AFTER.' },
  { q: 'But what if it’s weird?', a: 'WEIRD|IS FINE.|BIRDS ARE WEIRD.' },
  { q: 'But I’m waiting for a sign.', a: 'THIS IS|THE SIGN.|HI.' },
  { q: 'But I don’t have the energy.', a: 'IT’S ONE|BUTTON.' },
  { q: 'But what if they think I’m annoying?', a: 'ONE TEXT|IS NOT|ANNOYING.' },
  { q: 'But I need to think about it.', a: 'YOU HAVE.|FOR WEEKS.|WE CHECKED.' },
  { q: 'But what if I mess up the wording?', a: 'WORDS|ARE|FREE.' },
  { q: 'But it’s been so long.', a: 'SO IT’S|BEEN LONG.|SAY HI.' },
];

export const PLAYBOOKS = [
  { id: 'work', name: 'WORK', moves: [
    'Send the email you keep rewriting. As is.',
    'Ask the question you think is dumb.',
    'Show the rough version to one person.',
    'Ask for the meeting. One sentence.',
    'Apply to one job. Don’t tailor anything.',
    'Pick a date to decide about your job. Don’t decide today.',
  ] },
  { id: 'dating', name: 'DATING', moves: [
    'Ask them out. One sentence, a day and a place.',
    'Say hi to someone you keep noticing. Just hi.',
    'Answer the message you’ve been ignoring.',
    'Book the second date now.',
    'Tell them you had a good time.',
    'If you hear no, say “all good” and leave it there.',
  ] },
  { id: 'friends', name: 'FRIENDS', moves: [
    'Text someone: “what are you doing Saturday?”',
    'Send the “saw this and thought of you.”',
    'Call someone instead of texting.',
    'Say the annoying thing while it’s still small.',
    'Introduce yourself to a neighbor.',
    'Apologize for the thing. No essay.',
  ] },
  { id: 'body', name: 'BODY', moves: [
    'Put your shoes on and go outside. That’s the workout.',
    'Do ten push-ups. Knees count.',
    'Walk for ten minutes with no headphones.',
    'Go to the gym and do anything. No program.',
    'Set an alarm for bedtime tonight.',
    'Book the checkup you keep putting off.',
  ] },
  { id: 'cash', name: 'MONEY', moves: [
    'Cancel one subscription you keep “deciding” about.',
    'Look at your bank balance. Just look.',
    'Move $10 to savings.',
    'Open the bill you’ve been avoiding.',
    'Ask for the refund.',
    'Write down what you owe. One list. Nothing else.',
  ] },
  { id: 'home', name: 'HOME', moves: [
    'Clean one surface.',
    'Throw away three things.',
    'Start the laundry.',
    'Fix the thing that takes five minutes.',
    'Cook the easy thing.',
    'Make the phone call you’ve been dodging.',
  ] },
  { id: 'making', name: 'MAKING STUFF', moves: [
    'Post the rough version.',
    'Write one bad paragraph.',
    'Record one take. Don’t listen back.',
    'Show someone the unfinished thing.',
    'Tell someone what you’re making.',
    'Make the ugly first version.',
  ] },
];

const WILD_CARDS = [
  'Say good morning to a stranger.',
  'Compliment someone out loud.',
  'Take a different way home.',
  'Meow at a cat. If it meows back, that’s a good sign.',
  'Drink an orange juice. Then do the thing.',
];

export const MOVES = [...PLAYBOOKS.flatMap((p) => p.moves), ...WILD_CARDS];

// The daily mission is the same for everyone, so it comes from a pool that suits anyone on day one:
// small dares, the wild cards and the home pack. Never from a pack that's still locked.
export const DAILY_MOVES = [...WILD_CARDS, ...PLAYBOOKS.find((p) => p.id === 'home').moves, ...DARES];

// act: 'loop' starts the door check, 'check' the loop check, 'dump' the brain dump.
export const LESSONS = [
  {
    id: 'chew',
    rule: 'THINKING IS|NOT DOING.',
    why: 'You thought about the gym for 40 minutes. The gym does not know. Research on rumination ties going in circles to worse mood and worse problem-solving.',
    test: 'Did your last round of thinking add a fact, change an option or make the next step clearer? If not, you were chewing.',
    cta: { label: 'RUN THE LOOP CHECK', act: 'check' },
    src: 'Watkins & Roberts, 2020',
  },
  {
    id: 'doors',
    rule: 'MOST DOORS|SWING BOTH|WAYS.',
    why: 'It’s a door, {b}. If it’s bad in there, come back out. Most decisions can be undone, so they don’t need much thought.',
    test: 'If this goes bad, can you try again next week? Then why are we still here?',
    cta: { label: 'CHECK A DOOR', act: 'door' },
    src: 'Two-way doors: Amazon 2015 shareholder letter',
  },
  {
    id: 'shrink',
    rule: 'MAKE IT|STUPID|SMALL.',
    why: 'You are not writing the book. You are writing one bad sentence. Possibly the word “the.” Small moves tell you things that thinking can’t.',
    test: 'If it takes more than ten minutes, it’s still too big.',
    cta: { label: 'SHRINK SOMETHING', act: 'loop' },
  },
  {
    id: 'when',
    rule: 'DECIDE WHEN,|NOT WHETHER.',
    why: '“When lunch ends, I send it.” That’s the whole technology. A plan with a trigger beats a good intention.',
    test: 'Finish the sentence: when ___, I will ___.',
    cta: { label: 'MAKE A PLAN', act: 'loop' },
    src: 'Gollwitzer, 1999; Gollwitzer & Sheeran, 2006',
  },
  {
    id: 'forecast',
    rule: 'YOUR BRAIN|IS A LIAR.',
    why: '29 students with generalized anxiety tracked their worries. 91.4% of the predictions didn’t come true. That’s one small study and they aren’t you, so we’re keeping score on yours.',
    test: 'Predict how bad it’ll go. Then check. Your brain has a record now.',
    cta: { label: 'CATCH IT LYING', act: 'loop' },
    src: 'LaFreniere & Newman, 2020',
  },
  {
    id: 'spotlight',
    rule: 'NOBODY IS|LOOKING AT|YOU.',
    why: 'Scientists put students in an embarrassing T-shirt. They overestimated how many people could say what was on it. That’s a real study. Everyone’s busy worrying about their own shirt.',
    test: 'Go be awkward. Nine seconds, tops.',
    cta: { label: 'DO THE AWKWARD THING', act: 'loop' },
    src: 'Gilovich, Medvec & Savitsky, 2000',
  },
  {
    id: 'legs',
    rule: 'YOU HAVE|LEGS.',
    why: 'When your thoughts start circling, don’t argue with them. Walk. Do ten push-ups. Or dump it all out. It won’t solve anything, but it changes the channel.',
    test: 'This one’s a practice, not a study. Try it and see.',
    cta: { label: 'EMPTY MY HEAD', act: 'dump' },
  },
  {
    id: 'end',
    rule: 'AT THE END|OF THE DAY,|IT’S THE END|OF THE DAY.',
    why: 'The day ended. You can stop trying the case. Keep the one useful thing and move on. Punishing yourself isn’t the same as working on it.',
    test: 'That’s why chickening out costs nothing in here.',
    cta: { label: 'BACK TO IT', act: 'home' },
  },
  {
    id: 'think',
    rule: 'KNOW WHEN|TO USE THE|BRAIN.',
    why: 'Doctors, contracts, real money, somebody’s safety, other people’s lives. That’s what the brain is for. We saved it for this. Go slow and ask somebody who knows.',
    test: 'One-way door? The smart move is the slow one.',
    cta: { label: 'CHECK A DOOR', act: 'door' },
  },
];

// Days of doing stuff (bails count) before each law and mission pack opens. 0 = open from the start.
// "Know when to use the brain" stays open from day one: it's the safety one.
export const UNLOCK_DAYS = {
  lessons: { chew: 0, doors: 0, shrink: 0, when: 1, forecast: 3, spotlight: 5, legs: 8, end: 12, think: 0 },
  packs: { work: 0, home: 0, friends: 2, body: 4, dating: 7, cash: 10, making: 14 },
};

export const CHECK_QS =['ADD A|NEW FACT?', 'CHANGE YOUR|OPTIONS?', 'MAKE THE NEXT|STEP CLEARER?'];

// ---------- Pro content ----------
// Pro sells nerve, not outfits: bold versions of every message, hard-mode dares and the group chat
// pack. Everything the free app needs to work stays free, and safety is never behind it.

// BOLD: every message written like you're not scared. Same [brackets] rule as the free drafts.
export const BOLD_DRAFTS = {
  reply: ['Hey {name}. [Your answer.] Let’s talk this week.', 'Yes to [the thing]. When works?'],
  group: ['I’m in. [Day] at [time]. Who’s coming?', 'Making the call: [the plan], [day], [time]. Be there.'],
  story: ['Okay, I need to go here. Take me next time.', 'This is the best thing I’ve seen all week.'],
  plans: ['Hey {name}, Saturday. Food. You in?', 'Hey {name}, I’m picking the place this time. [Day], [time]. Don’t be late.'],
  askout: ['Hey {name}, I like talking to you. Let me take you out Thursday.', 'Hey {name}, I’d like to take you on a date. Friday or Saturday?'],
  prof: ['Hi Professor {name}, I’m in your [class] section. I need an extension on [assignment] until [day], and I’ll have it to you by then. Thank you.', 'Hi Professor {name}, I’ll be at office hours [day] to go over [topic]. See you then.'],
  rec: ['Hi Professor {name}, I did my best work of the year in your [class]. I’m applying to [program or job], and you’re the person I want writing my recommendation. It’s due [date]. I’ll send everything you need today.'],
  job: ['Hi {name}, I applied for the [role] on [date]. I’m a strong fit and I want this job. What’s the next step?'],
  reacted: ['you saw that? good. [your comeback]'],
  family: ['Hi! I’ve been dodging calls because this week was a lot. I’m calling you [day] at [time].'],
  coach: ['Coach {name}, I want more minutes. What do I need to show you this week?'],
  shift: ['Hi {name}, I can’t work [day] for the next [few weeks] because of [reason]. I can cover [another shift] instead.'],
  cover: ['Hi {name}, I’ve got [day]. What time do you need me?', 'Hi {name}, I can’t do [day]. I can do [another day].'],
  missed: ['Hi Professor {name}, I missed the [quiz] on [day]. I’d like to make it up. When works for you?'],
  makeup: ['Hey {name}, we’re good. I was annoyed, it’s done. [Tonight]?'],
  recruiter: ['Hi {name}, I’m interested. I’m free [time 1] or [time 2]. What’s the pay range for this role?'],
  meeting: ['Hi {name}, I’d like 20 minutes this week to talk about [topic]. Does [day] work?'],
  followup: ['Hi {name}, bumping this back to the top of your inbox. What’s the next step?'],
  roommate: ['Hey {name}, the [dishes] thing has to stop. Can we fix it tonight? Five minutes.'],
  landlord: ['Hi {name}, the [issue] in [unit] has been broken since [when]. Please send someone by [day]. Thank you.'],
  apology: ['Hey {name}, I was wrong. I’m sorry. Here’s what I’ll do differently: [one thing].'],
  decline: ['Hey {name}, I’m going to say no to this one. Thanks for asking me.'],
  refund: ['Hi, I’m requesting a full refund for order [number]. It [what went wrong]. Please confirm when it’s processed.'],
  favor: ['Hey {name}, I need a hand with [thing] on [day]. Can you help?'],
  reconnect: ['Hey {name}, I miss talking to you. Call this week?'],
  issue: ['Hey {name}, I need to bring something up: [the thing]. Can we talk tonight?'],
};

// HARD MODE: dares with social stakes. Still two-way doors, still safe for a 15-year-old.
export const HARD_DARES = [
  'Send “brother.” to the group chat. No context. Don’t explain.',
  'Reply to their story with one word. Not “haha.”',
  'Ask the question in class. The one you rehearsed.',
  'Order first. Don’t look at what anyone else gets.',
  'Post the thing. Don’t check it for an hour.',
  'Call someone instead of texting them. They’ll live.',
  'Send the text you drafted three days ago. As is.',
  'Say “I don’t know” out loud in a conversation today.',
  'Compliment a stranger’s shoes. Keep walking.',
  'Ask for one thing at the counter: extra sauce, a fresh one, a different size.',
  'Leave a voice memo longer than 30 seconds. No re-recording.',
  'Make the plan in the group chat. Pick the day. Pick the place.',
  'Text someone you lost touch with: “saw this and thought of you.”',
  'Raise your hand first. Once.',
  'Eat lunch somewhere new. On purpose.',
  'Give your real opinion on a movie. Even the unpopular take.',
  'Send the meme first. Don’t wait to see if anyone else laughs.',
  'Say no to one thing today. No excuse attached.',
  'Ask someone to hang out. Name the day.',
  'Delete the draft you’ve rewritten four times. Write it once. Send.',
];

// The group chat pack: more BUT WHAT IF, for the things that happen in the chat.
export const PRO_OBJECTIONS = [
  { q: 'But what if they leave me on read?', a: 'THEN YOU|KNOW THEY|CAN READ.' },
  { q: 'But what if nobody laughs?', a: 'SOMEBODY|LAUGHED.|SILENTLY.' },
  { q: 'But what if it’s cringe?', a: 'CRINGE IS|JUST BRAVE|EARLY.' },
  { q: 'But they posted and didn’t reply to me.', a: 'THEY ALSO|ATE LUNCH.|PEOPLE DO THINGS.' },
  { q: 'But what if I double text?', a: 'DOUBLE|THE TEXT.|DOUBLE THE FUN.' },
  { q: 'But the chat went quiet after I sent it.', a: 'IT’S|A TUESDAY.|PEOPLE ARE BUSY.' },
  { q: 'But what if I said it wrong?', a: 'YOU SAID IT.|THAT’S THE|HARD PART.' },
  { q: 'But what if they think I like them?', a: 'DO YOU?|THEN|GOOD.' },
  { q: 'But I typed it and deleted it four times.', a: 'FIFTH TIME.|HIT|SEND.' },
  { q: 'But they type faster than me.', a: 'IT’S NOT|A RACE.|IT’S A CHAT.' },
  { q: 'But what if they just say “lol”?', a: '“LOL” IS|A WHOLE|SENTENCE.' },
  { q: 'But what if I’m the only one who shows up?', a: 'THEN YOU|GET THE|GOOD SEAT.' },
  { q: 'But what if my voice cracks?', a: 'EVERYONE’S|DOES.|EVEN LEGENDS.' },
  { q: 'But they have more followers.', a: 'FOLLOWERS|AREN’T|FRIENDS.' },
  { q: 'But what if they’re mad at me?', a: 'THEN ASK.|DON’T|GUESS.' },
  { q: 'But what if I don’t get the joke?', a: 'ASK WHAT|IT MEANT.|POWER MOVE.' },
  { q: 'But I don’t want to seem desperate.', a: 'ONE TEXT|ISN’T|DESPERATE.' },
  { q: 'But they’re typing…', a: 'LET THEM|TYPE.|PHONE DOWN.' },
  { q: 'But I sent it at 2am.', a: 'BOLD.|RESPECT.|GO TO SLEEP.' },
  { q: 'But what if they don’t remember me?', a: 'THEN SAY|YOUR NAME.|EASY.' },
];

// After 10 PM, once: the app asks before it gets loud.
export const LATE_NIGHT = {
  title: 'IT’S LATE. QUIET MODE?',
  sub: 'No horns, no shaking, no brain rain. Same app, inside voice.',
  yes: 'YES, QUIET',
  no: 'NO, LOUD',
};

// ---------- day 2 ----------
// The next day, home asks how it went. The answers are the share moment.
export const FOLLOW_UP = {
  reply: {
    eyebrow: 'YOU SENT IT',
    choices: [['fine', 'YES. IT WAS FINE.'], ['weird', 'YES. IT WAS WEIRD.'], ['read', 'LEFT ON READ'], ['wait', 'NOT YET']],
  },
  retry: {
    eyebrow: 'YOU CHICKENED OUT',
    title: 'ROUND 2?',
    go: 'ROUND 2',
    did: 'I DID IT ANYWAY',
    skip: 'NOT TODAY',
  },
  plan: {
    eyebrow: 'YOU PUT THE BRAIN ON IT',
    title: 'DID IT GET A DATE?',
    choices: [['date', 'IT HAS A DATE'], ['asked', 'I ASKED SOMEBODY'], ['wait', 'NOT YET'], ['drop', 'LETTING IT GO']],
  },
  answers: {
    date: [
      { a: 'IT HAS|A DATE.', sub: 'That’s the whole job for now. The brain can clock out until then.' },
      { a: 'ON THE|CALENDAR.', sub: 'A date beats a dread. The brain goes back to sleep.' },
    ],
    asked: [
      { a: 'YOU|ASKED.', sub: 'Somebody who knows now knows. That’s the move on a big one.' },
      { a: 'NOT ALONE|ON THIS ONE|ANYMORE.', sub: 'Asking is the step. Next one: a date.' },
    ],
    fine: [
      { a: 'IT WAS|FINE.|OBVIOUSLY.', sub: 'All that thinking. One message.' },
      { a: 'FINE.|AGAIN.|SHOCKING.', sub: 'The brain is 0 for everything on this one.' },
      { a: 'NOTHING|BAD|HAPPENED.', sub: 'Write that down. Actually don’t. Just remember it.' },
    ],
    weird: [
      { a: 'IT WAS|WEIRD.|YOU LIVED.', sub: 'Weird lasts nine seconds. You did your part.' },
      { a: 'WEIRD IS|STILL|A REPLY.', sub: 'Awkward and sent beats perfect and in your notes app.' },
    ],
    read: [
      { a: 'THEIR|MOVE|NOW.', sub: 'You sent it. That was the whole job.' },
      { a: 'BALL’S IN|THEIR|COURT.', sub: 'You shot your shot. Their stats, not yours.' },
    ],
    did: [
      { a: 'DID IT|ANYWAY.', sub: 'Bailing is free. Coming back is legend behavior.' },
      { a: 'ROUND 2.|K.O.', sub: 'Chickened out, came back, did it. That’s the whole method.' },
    ],
  },
  wait: 'Okay. We’ll ask again tomorrow.',
  // For a message that never went out: no verdict, no evidence, off the list.
  unsent: { label: 'I didn’t send anything', toast: 'Then there’s nothing to wait for. Off the list.' },
  skip: 'No penalty. It’ll still be there when you are.',
  drop: 'Deciding not to is a decision. No penalty.',
  // The reminder that goes out on the next day. Never the thing or a name: lock screens are public.
  nudge: { reply: 'Did they answer? The brain needs to know.', retry: 'Round 2 is one button. You know the one.', plan: 'The big one. Did it get a date?' },
  // Asked on the receipt, when there's something to follow up.
  offer: { reply: 'WANT THE VERDICT?', retry: 'ROUND 2 TOMORROW?', plan: 'CHECK ON IT IN A DAY OR TWO?', sub: 'One nudge a day. Skipped if you’ve already done something.' },
};

// ---------- brain court ----------
// Day 3, 7, 14 and 30 of showing up. The evidence is the person's own receipts: what the brain said
// it would be, and what it was. Disasters and crisis-flagged things never go to court (core.exhibitFor).
export const TRIAL = {
  levels: {
    3: {
      name: 'BRAIN COURT',
      eyebrow: 'DAY 3 · SUMMONS',
      card: 'YOUR BRAIN IS ON TRIAL.',
      title: 'COURT IS|IN SESSION.',
      sub: 'The People vs. your brain. The charge: lying to you about how bad things would go.',
      soon: 'Your brain goes on trial for lying to you. We have receipts.',
    },
    7: {
      name: 'THE APPEAL',
      eyebrow: 'DAY 7 · APPEAL',
      card: 'YOUR BRAIN APPEALED.',
      title: 'THE BRAIN|APPEALED.',
      sub: 'It says the last verdict was unfair. The court has new receipts.',
      soon: 'Your brain appealed. Every receipt until then is evidence.',
    },
    14: {
      name: 'SUPREME BRAIN COURT',
      eyebrow: 'DAY 14 · LAST APPEAL',
      card: 'SUPREME BRAIN COURT.',
      title: 'SUPREME|BRAIN COURT.',
      sub: 'Last appeal. The brain hired a lawyer. The lawyer is also the brain.',
      soon: 'Last appeal. The brain hired a lawyer. Bring receipts.',
    },
    30: {
      name: 'THE PAROLE HEARING',
      eyebrow: 'DAY 30 · PAROLE HEARING',
      card: 'YOUR BRAIN WANTS PAROLE.',
      title: 'PAROLE|HEARING.',
      sub: 'The brain says it’s a changed organ. Thirty days of receipts will decide.',
      soon: 'The brain wants parole. It has not earned parole.',
    },
  },
  cardSub: 'The evidence is your receipts. Takes a minute.',
  open: 'START THE TRIAL',
  witness: { eyebrow: 'BEFORE WE START: ONE MORE WITNESS' },
  toVerdict: 'THE VERDICT',
  stamps: { lie: 'LIED', called: 'CALLED IT', worse: 'UNDERSOLD IT', stall: 'STALLING', bail: 'BRAIN WINS', overturned: 'OVERTURNED' },
  bail: 'You chickened out. The brain got this one.',
  overturned: 'You chickened out. Then you did it anyway.',
  // {lies} {calls} {total} {think} {did} are filled in by the app.
  verdicts: {
    guilty: { title: 'GUILTY.', sub: 'On record, your brain lied in {lies} of {total} cases. Everything it says is now hearsay.', tone: 'pink' },
    split: { title: 'HALF|GUILTY.', sub: 'Right {calls}, wrong {lies}. Your brain is a coin with anxiety.', tone: 'sun' },
    accurate: { title: 'NOT|GUILTY.', sub: 'It called {calls} of {total} cases. You did them anyway. Right, and it still lost.', tone: 'lime' },
    stalling: { title: 'GUILTY OF|STALLING.', sub: '{think} of thinking. {did} of doing. The court has seen enough.', tone: 'orange' },
    continued: { title: 'CASE|CONTINUED.', sub: 'Not enough evidence. Next time, tap how bad it’ll go before you do it, and the court can rule.', tone: 'blue' },
  },
  // Appeals and later hearings: same rulings, new words, so day 7 isn't a rerun of day 3.
  again: {
    guilty: { title: 'APPEAL|DENIED.', sub: 'On record: lied in {lies} of {total} cases. Still guilty. The brain would like to speak to a manager.', tone: 'pink' },
    split: { title: 'HUNG|JURY.', sub: 'Right {calls}, wrong {lies}. Half liar, half weather app.', tone: 'sun' },
    accurate: { title: 'APPEAL|GRANTED.', sub: 'It called {calls} of {total} cases. The brain is getting honest, and you did them anyway.', tone: 'lime' },
  },
  cred: 'BRAIN CREDIBILITY',
  sentence: {
    eyebrow: 'THE SENTENCE',
    base: 'The brain sits this one out. You pick the one you’ve been dodging longest.',
    accurate: 'The brain was right, and you did it anyway. Now do the one it’s loudest about.',
    continued: 'Do one today. Tap how bad it’ll go first, so the court has something to rule on.',
    again: 'The brain keeps losing, so the sentence goes up: the one it’s loudest about. Not the easy one.',
    go: 'NAME THE BIG ONE',
    later: 'Not today',
  },
  // The thing screen, when the sentence sends you there.
  bigOne: { title: 'THE ONE|YOU’VE DODGED|LONGEST.', again: 'THE ONE IT’S|LOUDEST|ABOUT.', placeholder: 'the thing you keep not doing' },
  share: { q: 'Is my brain a liar?', text: 'My brain went on trial. Verdict: {verdict}.' },
  // Home and the receipt, the day before a hearing.
  soonTitle: 'TOMORROW: {name}',
  actTitle: 'NEXT: {name}',
  act: 'Do one thing today, and tomorrow your brain goes on trial.',
  // Lock screens are public: no thing, no name.
  nudge: 'Court is in session. Your brain is on trial today.',
  offer: 'COURT IS TOMORROW. WANT A SUMMONS?',
};

// ---------- today's rule ----------
// From day 4 of showing up, each day gets a named rule that changes how a round plays,
// and the day before says which one is coming. Hearing days belong to the court.
// {record} {time} {old} {round} {n} {name} {tease} {dodged} {did} {rounds} {need} are filled in by the app.
export const RULES = {
  speedrun: {
    name: 'SPEEDRUN',
    card: 'The clock counts up. Beat your record: {record}.',
    cardFirst: 'The clock counts up. Set a record.',
    tease: 'The clock counts up. Beat your own time.',
    tag: 'SPEEDRUN · RECORD {record}',
    tagFirst: 'SPEEDRUN · NO RECORD YET',
    ready: 'ON YOUR|MARKS.',
    running: 'GO GO GO.',
    ghost: 'RECORD: {record}',
    past: 'PAST THE RECORD. STILL COUNTS.',
    lines: {
      first: { title: 'RECORD SET: {time}', sub: 'Now it’s the one to beat.' },
      win: { title: 'NEW RECORD: {time}', sub: 'The old one was {old}. The brain didn’t make it to the starting line.' },
      miss: { title: 'RECORD STANDS: {old}', sub: 'You: {time}. Done is done. It still counts.' },
      fast: { title: 'UNDER 10 SECONDS', sub: 'Too fast to count for the record. Nobody believes under 10.' },
    },
  },
  double: {
    name: 'BACK TO BACK',
    card: 'Two things. No break in between.',
    cardRound2: 'Round 1 is done. Round 2 is waiting. No break.',
    tease: 'Two things. No break in between.',
    tag: 'BACK TO BACK · ROUND {round} OF 2',
    round2: { title: 'ROUND 2.|NO BREAK.', placeholder: 'the next one. don’t think about it' },
    next: 'ROUND 2 →',
    lines: {
      round: { title: 'ROUND 1: DONE.', sub: 'One more and it’s back to back. The brain is still catching up.' },
      win: { title: 'BACK TO BACK.', sub: 'Two in a row. The brain didn’t get a word in. Bonus WIS for the pair.' },
      kinda: { title: 'BACK TO BACK. KINDA.', sub: 'Two in a row, one of them kinda. Kinda still counts. Bonus WIS for the pair.' },
    },
  },
  minute: {
    name: 'ONE MINUTE',
    card: 'The clock is 60 seconds. Only what fits.',
    tease: 'The clock is 60 seconds. Only what fits.',
    tag: 'ONE MINUTE',
    fast: 'ONE MINUTE.|WHAT FITS?',
    // The first step, cut down to what fits in 60 seconds. Same kinds as MOVE_SUGGESTIONS.
    moves: {
      draft: 'Write the first line. Send it.',
      gym: 'Put your shoes on.',
      email: 'Open it. Type the first sentence.',
      apply: 'Open the application.',
      clean: 'Clear one spot.',
      call: 'Dial the number.',
      interview: 'Write the question you’re scared of.',
      lookup: 'Open the page.',
      book: 'Open the booking page.',
      form: 'Open the form.',
      pay: 'Open the payment page.',
      shrink: 'Do the one-minute version you can take back.',
      write: 'Write the first sentence.',
      default: 'Do the first 60 seconds of it.',
    },
    ready: 'SIXTY|SECONDS.',
    running: 'MOVE.',
    chips: ['Open it.', 'Write the first line.', 'Send one word.', 'Put it in the calendar.', 'Find the email.', 'Set an alarm for it.', 'Say the first sentence out loud.', 'Get out what you need.'],
    lines: {
      win: { title: 'INSIDE THE MINUTE.', sub: 'Done in {time}. The brain was still loading.' },
      over: { title: 'OVER THE MINUTE.', sub: 'Done anyway. The minute was a suggestion.' },
    },
  },
  pick: {
    name: 'THE APP PICKS',
    card: 'You don’t choose today. Open the envelope.',
    tease: 'You don’t choose. The app does.',
    tag: 'THE APP PICKS',
    title: 'YOU DON’T|PICK TODAY.',
    fast: 'THE APP|PICKED:',
    sealed: 'TAP TO OPEN',
    picked: 'The app picked:',
    pickedYours: 'You chickened out of this one. The app remembers:',
    deal: 'DEAL.',
    reroll: '↻ One re-roll',
    rerolled: 'Re-roll used. That’s the one.',
    own: 'Not today. I’ve got my own thing.',
    lines: {
      win: { title: 'THE APP PICKED. YOU DID IT.', sub: 'The brain didn’t get a vote.' },
    },
  },
  boss: {
    name: 'THE BOSS',
    card: 'The one you’ve dodged longest. Land the first hit.',
    tease: 'The one you’ve dodged longest. Land the first hit.',
    tag: 'BOSS FIGHT',
    tagHp: 'BOSS FIGHT · {dodged} OF DODGING',
    title: 'THE BOSS:|THE ONE YOU’VE|DODGED LONGEST.',
    placeholder: 'the one that’s been sitting there',
    howlong: 'HOW LONG|HAS IT BEEN|SITTING THERE?',
    fast: 'FIRST|HIT:',
    ready: 'BOSS|FIGHT.',
    running: 'HIT IT.',
    hp: 'BOSS HP',
    lines: {
      win: { title: 'CRITICAL HIT.', sub: '{dodged} of dodging. {did} of doing. It’s not down. It knows you’re coming now.' },
      winNoTime: { title: 'CRITICAL HIT.', sub: 'It took {did}. It’s not down. It knows you’re coming now.' },
      hurt: { title: 'GRAZED IT.', sub: 'Kinda counts. It has less health than it did this morning.' },
      think: { title: 'BOSS: HANDLED ON PURPOSE.', sub: 'Some bosses get a plan, not a GO. A date and a person who knows is a hit.' },
    },
  },
  today: 'DAY {n} · TODAY’S RULE',
  done: 'DAY {n} · {name} ✓ DONE',
  progress: '{rounds} OF {need}',
  soonTitle: 'TOMORROW: {name}',
  // Lock screens are public: the rule only, never the thing or a name.
  nudge: 'Today’s rule: {name}. {tease}',
  offer: 'TOMORROW: {name}. WANT A HEADS-UP?',
};

// The brain caught lying, by count: lie 1, 2 and 3 in order, then a rotation.
// {said} {was} {n} are filled in by the app.
export const LIAR_LINES = [
  'You said {said}. It was {was}. Your brain is a liar.',
  'You said {said}. It was {was}. That’s lie number {n}.',
  'Lie number {n}. You said {said}. It was {was}. It’s a pattern now.',
  'Lie number {n}. At this point it’s a hobby.',
  'Lie number {n}. The brain’s lawyer stopped picking up.',
  'Lie number {n}. Nobody in court believes it anymore.',
  'Lie number {n}. Put it on the brain’s permanent record.',
  'Lie number {n}. You said {said}. It was {was}. Same as always.',
];

// The check after DONE. "How bad was it" is answered on one screen with "how long had you been
// dodging it", and the answer gets its verdict right there, stamped. {said} {n} filled in by the app.
export const REVEAL = {
  ask: 'YOU SAID|{said}.|IT WAS…',
  askDraft: 'YOU SAID|{said}.|SENDING IT WAS…',
  dodge: 'AND YOU’D BEEN DODGING IT FOR…',
  next: 'NEXT →',
  lie: { stamp: 'LIED.' },
  called: { stamp: 'CALLED IT.', sub: 'Point for the brain. Don’t let it get cocky.' },
  worse: { stamp: 'UNDERSOLD IT.', sub: 'A notch worse than it said. Done anyway.' },
  // The lie count, under the stamp. From lie 4 on, the rotation in LIAR_LINES.
  lies: ['First lie on the record.', 'Lie number {n}. Same brain, same move.', 'Lie number {n}. It’s a pattern now.'],
};

// Finished in under 10 seconds. Rotates, so a run of quick ones doesn't get the same joke every time.
export const FAST_LINES = [
  'Under 10 seconds. Either you’re a legend or you didn’t do it. We’ll never know.',
  'Under 10 seconds. The brain didn’t even get its shoes on.',
  'Faster than the brain can load. Suspicious. Respect.',
  'Under 10 seconds. Was it even a thing? Doesn’t matter. Done.',
];

// It went badly. The school website not working and telling your dad about the truck don't get the same line.
// hard: they called it a disaster and it was "only" bad. big: a one-way door they did anyway. lines: everything else, rotating.
export const ROUGH_LINES = {
  hard: 'You said disaster. It was bad. Bad is survivable, and it’s behind you now.',
  big: 'That was a big one, and you moved on it. Bad isn’t the end of it.',
  bigKinda: 'Kinda counts. It’s written down now. The date you picked is the next step, not the brain.',
  lines: [
    'That happens. Now you know something. Move on.',
    'Didn’t go great. It’s done, though, and done was the hard part.',
    'Rough one. It’s behind you now.',
    'Not every one goes fine. This one’s still off your plate.',
  ],
};
